import { NextRequest, NextResponse } from 'next/server';
import { paytrIframeService } from '@/lib/payment/paytr-iframe-service';
import { PaymentRequest } from '@/lib/payment/payment-types';
import { validatePayTRConfig } from '@/lib/payment/paytr-config';

// Rate limiting için basit cache
const requestCounts = new Map<string, { count: number; resetTime: number }>();

// Rate limiting kontrolü
function checkRateLimit(identifier: string, limit: number = 5, windowMs: number = 60000): boolean {
  const now = Date.now();
  const userRequests = requestCounts.get(identifier);
  
  if (!userRequests || now > userRequests.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (userRequests.count >= limit) {
    return false;
  }
  
  userRequests.count++;
  return true;
}

// Input validation
function validatePaymentRequest(body: any): { isValid: boolean; error?: string } {
  if (!body.userId || typeof body.userId !== 'string') {
    return { isValid: false, error: 'Geçersiz kullanıcı ID' };
  }
  
  if (!body.amount || typeof body.amount !== 'number' || body.amount <= 0) {
    return { isValid: false, error: 'Geçersiz tutar' };
  }
  
  if (!body.planType || typeof body.planType !== 'string') {
    return { isValid: false, error: 'Geçersiz plan tipi' };
  }
  
  if (!body.planId || typeof body.planId !== 'string') {
    return { isValid: false, error: 'Plan ID gerekli' };
  }
  
  if (!body.userEmail || typeof body.userEmail !== 'string' || !body.userEmail.includes('@')) {
    return { isValid: false, error: 'Geçersiz email' };
  }
  
  if (!body.userName || typeof body.userName !== 'string' || body.userName.length < 2) {
    return { isValid: false, error: 'Geçersiz kullanıcı adı' };
  }
  
  return { isValid: true };
}

export async function POST(request: NextRequest) {
  try {
    // PayTR configuration validation
    if (!validatePayTRConfig()) {
      return NextResponse.json({ 
        success: false,
        error: 'PayTR konfigürasyon hatası',
        message: 'Lütfen sistem yöneticisi ile iletişime geçin'
      }, { status: 500 });
    }
    
    // Authentication kontrolü (development'ta esnek)
    const authHeader = request.headers.get('authorization');
    
    if (process.env.NODE_ENV === 'production') {
      // Production'da sıkı authentication
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ 
          success: false,
          error: 'Kimlik doğrulama gerekli',
          message: 'Lütfen giriş yapın'
        }, { status: 401 });
      }
      
      const token = authHeader.replace('Bearer ', '');
      if (!token || token.length < 10) {
        return NextResponse.json({ 
          success: false,
          error: 'Geçersiz kimlik bilgisi',
          message: 'Lütfen tekrar giriş yapın'
        }, { status: 401 });
      }
    }
    
    // Rate limiting kontrolü
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    if (!checkRateLimit(clientIP, 5, 60000)) {
      return NextResponse.json({ 
        success: false,
        error: 'Çok fazla istek. Lütfen bir dakika bekleyin.' 
      }, { status: 429 });
    }
    
    // Request body'yi parse et
    const body = await request.json();
    
    // Input validation
    const validation = validatePaymentRequest(body);
    if (!validation.isValid) {
      return NextResponse.json({ 
        success: false,
        error: validation.error 
      }, { status: 400 });
    }
    
    const { userId, amount, planType, planId, userEmail, userName, userPhone, userAddress } = body;
    
    // CRITICAL DEBUG: API'ye hangi plan geldi?
    console.log('🔥 CREATE-IFRAME API: Received payment request:', {
      userId,
      planId,
      planType,
      amount,
      body: JSON.stringify(body, null, 2)
    });
    
    // YENİ SİSTEM: Seçilen planı temporary olarak kaydet
    console.log('💾 STORING PENDING PLAN: Saving selected plan before payment');
    const { db } = await import('@/lib/firebase');
    const { doc, setDoc, Timestamp } = await import('firebase/firestore');
    
    await setDoc(doc(db, 'pendingPayments', userId), {
      planId: planId,
      planType: planType,
      amount: amount,
      currency: 'TRY',
      userId: userId,
      userEmail: userEmail,
      userName: userName,
      createdAt: Timestamp.fromDate(new Date()),
      status: 'pending',
      paymentData: {
        userPhone,
        userAddress
      }
    });
    
    console.log('✅ PENDING PLAN SAVED:', { userId, planId, planType, amount });
    
    // PayTR iFrame API ile ödeme formu oluştur
    const paymentRequest: PaymentRequest = {
      userId,
      amount,
      currency: 'TRY',
      planType,
      planId, // Plan ID'sini ekle
      userEmail,
      userName,
      userPhone,
      userAddress
    };
    
    const result = await paytrIframeService.createIframePayment(paymentRequest);
    
    if (result.success && result.iframeData) {
      return NextResponse.json({
        success: true,
        token: result.token,
        message: result.message,
        iframeData: result.iframeData,
        orderId: result.token
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        message: result.message
      }, { status: 400 });
    }

  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: 'iFrame ödeme formu oluşturulamadı',
        message: error instanceof Error ? error.message : 'Teknik bir hata oluştu',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, 
      { status: 500 }
    );
  }
}




