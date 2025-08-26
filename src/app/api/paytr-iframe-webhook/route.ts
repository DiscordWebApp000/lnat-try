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
    console.log('🔄 iFrame Webhook başlatıldı');
    
    // Request body'yi parse et
    const webhookData = await request.json();
    console.log('📥 Webhook data alındı:', {
      merchant_oid: webhookData.merchant_oid,
      status: webhookData.status,
      total_amount: webhookData.total_amount,
      payment_type: webhookData.payment_type,
      currency: webhookData.currency
    });
    
    // Webhook data validation
    const validation = validateIframeWebhookData(webhookData);
    if (!validation.isValid) {
      console.error('❌ Webhook validation hatası:', validation.error);
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    
    // Webhook doğrulama (hash kontrolü)
    if (!verifyIframeWebhook(webhookData)) {
      console.error('❌ Webhook hash doğrulama hatası');
      return NextResponse.json({ error: 'Invalid hash' }, { status: 400 });
    }
    
    console.log('✅ Webhook hash doğrulandı');

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
      
      console.log('🔍 User ID çıkarıldı:', { merchant_oid, extractedUserId: userId, remainingLength: remaining.length });
    }
    
    // Hala userId bulunamadıysa, webhook'u işle ama log'la
    if (!userId) {
      console.error('❌ iFrame Webhook: Could not extract userId from merchant_oid:', merchant_oid);
      // Webhook'u başarılı olarak işaretle ama işleme devam et
      return NextResponse.json({ status: 'OK', warning: 'User ID not found' });
    }

    if (status === 'success') {
      console.log('✅ Başarılı ödeme tespit edildi, subscription aktif ediliyor...');
      
      // Premium abonelik oluştur
      try {
        // Plan ID'sini merchant_oid'den çıkar (format: order{userId}{timestamp}{random})
        const planId = 'premium'; // varsayılan
        
        console.log('🎯 Subscription aktivasyonu başlatılıyor:', {
          userId,
          planId,
          amount: total_amount / 100,
          currency: 'TRY',
          paymentId: merchant_oid
        });
        
        // Subscription'ı aktif et
        await subscriptionService.activateSubscription(userId, planId, {
          paymentId: merchant_oid,
          linkId: merchant_oid, // iFrame'de link ID yok, merchant_oid kullan
          amount: total_amount / 100, // PayTR kuruş olarak gönderir
          currency: 'TRY'
        });
        
        console.log('🎉 iFrame Webhook: Subscription başarıyla aktif edildi!', {
          userId,
          planId,
          subscriptionId: `sub_${userId}_${Date.now()}`,
          amount: total_amount / 100,
          currency: 'TRY'
        });
        
      } catch (subscriptionError) {
        console.error('❌ iFrame Webhook: Subscription activation error:', subscriptionError);
        // Hata olsa bile webhook'u başarılı olarak işaretle (ödeme başarılı)
        // Ama hatayı log'la ki daha sonra manuel olarak düzeltilebilsin
      }
      
    } else {
      // Başarısız ödeme log'u
      console.log('❌ Başarısız ödeme tespit edildi:', {
        userId,
        merchant_oid,
        status,
        total_amount
      });
      
      // Hata detayları log'la
      if (webhookData.failed_reason_code && webhookData.failed_reason_msg) {
        console.log('📋 Ödeme hatası detayları:', {
          code: webhookData.failed_reason_code,
          message: webhookData.failed_reason_msg
        });
      }
    }

    console.log('✅ Webhook başarıyla işlendi, PayTR\'a OK yanıtı gönderiliyor');
    
    // Paytr'a başarılı yanıt gönder (sadece "OK" text olarak)
    return new NextResponse('OK', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });

  } catch (error) {
    console.error('❌ iFrame Webhook processing error:', error);
    return NextResponse.json(
      { error: 'iFrame webhook processing failed' }, 
      { status: 500 }
    );
  }
}
