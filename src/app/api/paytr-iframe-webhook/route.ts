import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { IframeWebhookData } from '@/lib/payment/payment-types';
import { subscriptionService } from '@/lib/subscription-service';

// Paytr konfigürasyonu - sadece server-side
const PAYTR_CONFIG = {
  MERCHANT_ID: process.env.PAYTR_MERCHANT_ID,
  MERCHANT_KEY: process.env.PAYTR_MERCHANT_KEY,
  MERCHANT_SALT: process.env.PAYTR_MERCHANT_SALT,
};

// iFrame webhook doğrulama (PayTR resmi formatı)
function verifyIframeWebhook(webhookData: IframeWebhookData): boolean {
  try {
    if (!webhookData.merchant_oid || !webhookData.status || 
        !webhookData.total_amount || !webhookData.hash) {
      return false;
    }

    // PayTR iFrame hash formatı: merchant_oid + merchant_salt + status + total_amount
    const hashString = `${webhookData.merchant_oid}${PAYTR_CONFIG.MERCHANT_SALT}${webhookData.status}${webhookData.total_amount}`;
    const calculatedHash = crypto.createHmac('sha256', PAYTR_CONFIG.MERCHANT_KEY!)
      .update(hashString)
      .digest('base64');
    
    return calculatedHash === webhookData.hash;
  } catch {
    return false;
  }
}

// iFrame webhook data validation
function validateIframeWebhookData(data: any): { isValid: boolean; error?: string } {
  if (!data.merchant_oid || typeof data.merchant_oid !== 'string') {
    return { isValid: false, error: 'Invalid merchant_oid' };
  }
  
  if (!data.status || !['success', 'failed'].includes(data.status)) {
    return { isValid: false, error: 'Invalid status' };
  }
  
  if (!data.total_amount || typeof data.total_amount !== 'number' || data.total_amount <= 0) {
    return { isValid: false, error: 'Invalid total_amount' };
  }
  
  if (!data.hash || typeof data.hash !== 'string') {
    return { isValid: false, error: 'Invalid hash' };
  }
  
  return { isValid: true };
}

export async function POST(request: NextRequest) {
  try {
    // Request body'yi parse et
    const webhookData = await request.json();
    
    // Webhook data validation
    const validation = validateIframeWebhookData(webhookData);
    if (!validation.isValid) {
      return new NextResponse('VALIDATION_ERROR', {
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
    
    // Webhook doğrulama (hash kontrolü)
    if (!verifyIframeWebhook(webhookData)) {
      return new NextResponse('HASH_ERROR', {
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
    
    const { merchant_oid, status, total_amount } = webhookData;
    
    // merchant_oid'den kullanıcı bilgisini çıkar (format: order{userId}{timestamp}{random})
    let userId = '';
    if (merchant_oid && merchant_oid.startsWith('order')) {
      // order{userId}{timestamp}{random} formatından userId'yi çıkar
      // userId genellikle Firebase UID formatında (28 karakter)
      const orderPrefix = 'order';
      const remaining = merchant_oid.substring(orderPrefix.length);
      
      // Firebase UID genellikle 28 karakter, timestamp 13 karakter, random 6 karakter
      // En az 28 karakter varsa ilk 28'i userId olarak al
      if (remaining.length >= 28) {
        userId = remaining.substring(0, 28);
      } else {
        // Kısa ise tümünü al
        userId = remaining;
      }
      
    }
    
    // Hala userId bulunamadıysa, webhook'u işle
    if (!userId) {
      return NextResponse.json({ status: 'OK', warning: 'User ID not found' });
    }

    if (status === 'success') {
      // Premium abonelik oluştur
      try {
        // Plan ID'sini merchant_oid'den çıkar (format: order{userId}{timestamp}{random})
        const planId = 'premium'; // varsayılan
        
        // Subscription'ı aktif et
        await subscriptionService.activateSubscription(userId, planId, {
          paymentId: merchant_oid,
          linkId: merchant_oid, // iFrame'de link ID yok, merchant_oid kullan
          amount: total_amount / 100, // PayTR kuruş olarak gönderir
          currency: 'TRY'
        });
        
      } catch (subscriptionError) {
        // Hata olsa bile webhook'u başarılı olarak işaretle (ödeme başarılı)
      }
      
    }

    // PayTR'ye başarılı yanıt gönder (sadece "OK" text olarak)
    return new NextResponse('OK', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    });

  } catch (error) {
    // PayTR'ye hata durumunda da text yanıt ver
    return new NextResponse('ERROR', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
    });
  }
}
