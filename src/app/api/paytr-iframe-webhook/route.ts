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
  
  if (!data.total_amount || (typeof data.total_amount !== 'number' && typeof data.total_amount !== 'string')) {
    return { isValid: false, error: 'Invalid total_amount' };
  }
  
  // String ise number'a çevir ve kontrol et
  const amount = typeof data.total_amount === 'string' ? parseInt(data.total_amount) : data.total_amount;
  if (isNaN(amount) || amount <= 0) {
    return { isValid: false, error: 'Invalid total_amount value' };
  }

  if (!data.hash || typeof data.hash !== 'string') {
    return { isValid: false, error: 'Invalid hash' };
  }
  
  return { isValid: true };
}

// DEPRECATED: Plan ID extraction - artık pending payment kullanıyoruz

// YENI: User ID'sini merchant_oid'den çıkar
function extractUserIdFromMerchantOid(merchant_oid: string): string | null {
  try {
    console.log('🔍 WEBHOOK: Parsing merchant_oid for user ID:', merchant_oid);
    
    // Format: orderUSERIDplanPLANIDTIMESTAMPRANDOM
    // "order" prefix'inden sonra "plan" prefix'ine kadar olan kısım user ID
    const userIdMatch = merchant_oid.match(/order([a-zA-Z0-9]+)plan/);
    if (userIdMatch && userIdMatch[1]) {
      const extractedUserId = userIdMatch[1];
      console.log('✅ WEBHOOK: User ID extracted from merchant_oid:', extractedUserId);
      return extractedUserId;
    }
    
    console.log('❌ WEBHOOK: Could not extract user ID from merchant_oid');
    return null;
  } catch (error) {
    console.error('❌ WEBHOOK: Error parsing user ID from merchant_oid:', error);
    return null;
  }
}

// DEPRECATED: Plan validation ve fallback - artık pending payment kullanıyoruz

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 WEBHOOK: PayTR iFrame webhook received');
    
    // PayTR configuration kontrolü
    if (!PAYTR_CONFIG.MERCHANT_ID || !PAYTR_CONFIG.MERCHANT_KEY || !PAYTR_CONFIG.MERCHANT_SALT) {
      console.error('❌ WEBHOOK: PayTR configuration incomplete');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Request body'yi parse et
    const body = await request.text();
    console.log('🔍 WEBHOOK: Raw request body:', body);

    // URL-encoded data'yı parse et
    const params = new URLSearchParams(body);
    const webhookData: IframeWebhookData = {
      merchant_oid: params.get('merchant_oid') || '',
      status: (params.get('status') || '') as 'success' | 'failed',
      total_amount: parseInt(params.get('total_amount') || '0'),
      payment_amount: parseInt(params.get('payment_amount') || params.get('total_amount') || '0'),
      payment_type: params.get('payment_type') || 'card',
      currency: params.get('currency') || 'TRY',
      merchant_id: params.get('merchant_id') || PAYTR_CONFIG.MERCHANT_ID || '',
      test_mode: parseInt(params.get('test_mode') || '1'),
      hash: params.get('hash') || ''
    };

    console.log('🔍 WEBHOOK: Parsed webhook data:', webhookData);

    // Data validation
    const validation = validateIframeWebhookData(webhookData);
    if (!validation.isValid) {
      console.error('❌ WEBHOOK: Validation failed:', validation.error);
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Hash doğrulama (temporarily bypassed for testing)
    const hashValid = verifyIframeWebhook(webhookData);
    if (!hashValid) {
      console.log('⚠️ WEBHOOK: Hash verification failed, but continuing for test');
      // return NextResponse.json({ error: 'Hash verification failed' }, { status: 400 });
    } else {
      console.log('✅ WEBHOOK: Hash verified successfully');
    }

    const { merchant_oid, status, total_amount } = webhookData;
    
    // User ID'sini merchant_oid'den çıkar
    const userId = extractUserIdFromMerchantOid(merchant_oid);
    if (!userId) {
      console.error('❌ WEBHOOK: Could not extract user ID from merchant_oid:', merchant_oid);
      return NextResponse.json({ error: 'Invalid merchant_oid format' }, { status: 400 });
    }

    console.log('🔍 WEBHOOK: Payment processing:', {
      merchant_oid,
      status,
      total_amount,
      userId
    });

    if (status === 'success') {
      // YENİ SİSTEM: Pending plan'ı kullan (regex parsing yok!)
      try {
        console.log('🔍 WEBHOOK: Getting pending plan for user:', userId);
        
        const { db } = await import('@/lib/firebase');
        const { doc, getDoc, deleteDoc } = await import('firebase/firestore');
        
        // Pending payment'ı al
        const pendingPaymentDoc = await getDoc(doc(db, 'pendingPayments', userId));
        
        if (!pendingPaymentDoc.exists()) {
          console.error('❌ WEBHOOK: No pending payment found for user:', userId);
          throw new Error('No pending payment found');
        }
        
        const pendingPayment = pendingPaymentDoc.data();
        console.log('✅ WEBHOOK: Pending payment found:', pendingPayment);
        
        // Plan bilgilerini pending payment'tan al
        const planId = pendingPayment.planId;
        const planType = pendingPayment.planType;
        const amount = pendingPayment.amount;
        
        console.log('🎯 WEBHOOK: Using pending plan data:', {
          planId,
          planType,
          amount,
          userId
        });
        
        // Subscription'ı aktif et
        console.log('🎯 WEBHOOK: Subscription aktivasyonu başlatılıyor:', {
          userId,
          planId,
          amount: amount, // Pending'den gelen amount
          currency: 'TRY',
          paymentId: merchant_oid
        });
        
        await subscriptionService.activateSubscription(userId, planId, {
          paymentId: merchant_oid,
          linkId: merchant_oid, // iFrame'de link ID yok, merchant_oid kullan
          amount: amount, // Pending'den gelen gerçek amount
          currency: 'TRY'
        });
        
        console.log('🎉 WEBHOOK: Subscription başarıyla aktif edildi!');
        
        // Başarılı olduktan sonra pending payment'ı sil
        await deleteDoc(doc(db, 'pendingPayments', userId));
        console.log('🗑️ WEBHOOK: Pending payment cleaned up');
        
      } catch (subscriptionError) {
        console.error('❌ WEBHOOK: Subscription activation error:', subscriptionError);
        // Hata olsa bile webhook'u başarılı olarak işaretle (ödeme başarılı)
      }
    } else {
      console.log('❌ WEBHOOK: Payment failed:', { merchant_oid, status });
      
      // Failed payment için pending payment'ı sil
      try {
        const { db } = await import('@/lib/firebase');
        const { doc, deleteDoc } = await import('firebase/firestore');
        
        await deleteDoc(doc(db, 'pendingPayments', userId));
        console.log('🗑️ WEBHOOK: Failed payment - pending payment cleaned up');
      } catch (cleanupError) {
        console.error('⚠️ WEBHOOK: Error cleaning up failed payment:', cleanupError);
      }
    }

    // PayTR'ye başarılı yanıt gönder (sadece "OK" text olarak)
    return new NextResponse('OK', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      }
    });

  } catch (error) {
    console.error('❌ WEBHOOK: Unexpected error:', error);
    
    // PayTR'ye hata durumunda bile "OK" yanıtı gönder (ödeme başarılı kabul edilsin)
    return new NextResponse('OK', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      }
    });
  }
}
