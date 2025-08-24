import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { LinkWebhookData } from '@/lib/payment/payment-types';
import { paytrLinkService } from '@/lib/payment/paytr-link-service';
import { subscriptionService } from '@/lib/subscription-service';

// Paytr konfigürasyonu - sadece server-side
const PAYTR_CONFIG = {
  MERCHANT_ID: process.env.PAYTR_MERCHANT_ID,
  MERCHANT_KEY: process.env.PAYTR_MERCHANT_KEY,
  MERCHANT_SALT: process.env.PAYTR_MERCHANT_SALT,
  CALLBACK_URL: process.env.PAYTR_CALLBACK_URL,
};

// Link API webhook doğrulama (PayTR resmi formatı)
function verifyLinkWebhook(webhookData: LinkWebhookData): boolean {
  try {
    if (!webhookData.id || !webhookData.merchant_oid || !webhookData.status || 
        !webhookData.total_amount || !webhookData.hash) {
      console.error('Missing required webhook fields');
      return false;
    }

    // PayTR Link API hash formatı: id + merchant_oid + merchant_salt + status + total_amount
    const hashString = `${webhookData.id}${webhookData.merchant_oid}${PAYTR_CONFIG.MERCHANT_SALT}${webhookData.status}${webhookData.total_amount}`;
    const calculatedHash = crypto.createHmac('sha256', PAYTR_CONFIG.MERCHANT_KEY!)
      .update(hashString)
      .digest('base64');
    
    const isValid = calculatedHash === webhookData.hash;
    
    if (!isValid) {
      console.error('Link webhook hash verification failed');
      console.error('Expected:', calculatedHash);
      console.error('Received:', webhookData.hash);
      console.error('Hash string:', hashString);
    }
    
    return isValid;
  } catch (error) {
    console.error('Link webhook verification error:', error);
    return false;
  }
}

// Link webhook data validation
function validateLinkWebhookData(data: any): { isValid: boolean; error?: string } {
  if (!data.id || typeof data.id !== 'string') {
    return { isValid: false, error: 'Invalid link ID' };
  }
  
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
    console.log('🔔 ===== PAYTR LINK WEBHOOK START =====');
    console.log('🔔 Webhook URL:', request.url);
    console.log('🔔 Expected callback URL:', PAYTR_CONFIG.CALLBACK_URL);
    console.log('🔔 Request headers:', Object.fromEntries(request.headers.entries()));
    
    // Request body'yi parse et
    const webhookData = await request.json();
    
    console.log('🔔 Link webhook received:', {
      id: webhookData.id,
      merchant_oid: webhookData.merchant_oid,
      status: webhookData.status,
      total_amount: webhookData.total_amount,
      callback_id: webhookData.callback_id,
      timestamp: new Date().toISOString()
    });
    
    // Webhook data validation
    const validation = validateLinkWebhookData(webhookData);
    if (!validation.isValid) {
      console.error('🔔 Link webhook validation failed:', validation.error);
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    
    // Webhook doğrulama (hash kontrolü)
    if (!verifyLinkWebhook(webhookData)) {
      console.error('🔔 Link webhook verification failed');
      return NextResponse.json({ error: 'Invalid hash' }, { status: 400 });
    }

    const { id, merchant_oid, status, total_amount, callback_id } = webhookData;
    
    // Callback ID'den kullanıcı bilgisini çıkar
    let userId = '';
    if (callback_id && callback_id.startsWith('CB_')) {
      const callbackParts = callback_id.split('_');
      if (callbackParts.length >= 3) {
        userId = callbackParts[2]; // CB_{timestamp}_{userId}
        console.log('🔔 UserId extracted from callback_id:', userId);
      }
    }
    
    // Eğer callback_id'den çıkarılamazsa, merchant_oid'den çıkarmaya çalış
    if (!userId && merchant_oid) {
      const orderParts = merchant_oid.split('_');
      if (orderParts.length >= 2) {
        userId = orderParts[1]; // plan_{planType}_{userId}_{timestamp}
        console.log('🔔 UserId extracted from merchant_oid:', userId);
      }
    }
    
    // Eğer callback_id'den çıkarılamazsa, merchant_oid'den çıkarmaya çalış
    if (!userId && merchant_oid) {
      const orderParts = merchant_oid.split('_');
      if (orderParts.length >= 2) {
        userId = orderParts[1]; // plan_{planType}_{userId}_{timestamp}
      }
    }
    
    if (!userId) {
      console.error('🔔 Could not extract userId from webhook data');
      console.error('🔔 callback_id:', callback_id);
      console.error('🔔 merchant_oid:', merchant_oid);
      console.error('🔔 Full webhook data:', webhookData);
      return NextResponse.json({ error: 'Invalid user identification' }, { status: 400 });
    }
    
    console.log('🔔 UserId successfully extracted:', userId);

    if (status === 'success') {
      // Premium abonelik oluştur
      console.log(`🔔 Payment successful for user ${userId}, amount: ${total_amount}, link: ${id}, order: ${merchant_oid}`);
      
      try {
        // Plan ID'sini merchant_oid'den çıkar (format: plan_{planId}_{userId}_{timestamp})
        let planId = 'premium'; // varsayılan
        if (merchant_oid && merchant_oid.startsWith('plan_')) {
          const orderParts = merchant_oid.split('_');
          if (orderParts.length >= 2) {
            planId = orderParts[1];
          }
        }
        
        // Subscription'ı aktif et
        await subscriptionService.activateSubscription(userId, planId, {
          paymentId: merchant_oid,
          linkId: id,
          amount: total_amount / 100, // PayTR kuruş olarak gönderir
          currency: 'TRY'
        });
        
        console.log(`🔔 Subscription activated for user ${userId}, plan: ${planId}`);
        
      } catch (subscriptionError) {
        console.error('🔔 Subscription activation error:', subscriptionError);
        // Hata olsa bile webhook'u başarılı olarak işaretle (ödeme başarılı)
      }
      
      // Başarılı işlem log'u
      console.log(`🔔 Premium subscription created for user ${userId} via Link API`);
      
      // Ödeme linkini sil (güvenlik için)
      try {
        const deleteResult = await paytrLinkService.deletePaymentLink(id);
        if (deleteResult) {
          console.log(`🔔 Payment link ${id} deleted successfully`);
        } else {
          console.error(`🔔 Failed to delete payment link ${id}`);
        }
      } catch (deleteError) {
        console.error(`🔔 Error deleting payment link ${id}:`, deleteError);
      }
      
    } else {
      console.log(`🔔 Payment failed for user ${userId}, status: ${status}, link: ${id}, order: ${merchant_oid}`);
      
      // TODO: Başarısız ödeme log'u
      // await logFailedPayment(userId, merchant_oid, status, total_amount, id);
      
      // Başarısız ödemede de link'i sil
      try {
        const deleteResult = await paytrLinkService.deletePaymentLink(id);
        if (deleteResult) {
          console.log(`🔔 Failed payment link ${id} deleted successfully`);
        }
      } catch (deleteError) {
        console.error(`🔔 Error deleting failed payment link ${id}:`, deleteError);
      }
    }

    console.log('🔔 ===== PAYTR LINK WEBHOOK SUCCESS =====');
    
    // Paytr'a başarılı yanıt gönder
    return NextResponse.json({ status: 'OK' });

  } catch (error) {
    console.error('🔔 ===== PAYTR LINK WEBHOOK ERROR =====');
    console.error('🔔 Link webhook processing error:', error);
    
    return NextResponse.json(
      { error: 'Link webhook processing failed' }, 
      { status: 500 }
    );
  }
}
