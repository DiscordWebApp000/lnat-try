import { NextRequest, NextResponse } from 'next/server';
import { paytrLinkService } from '@/lib/payment/paytr-link-service';
import { PaymentRequest } from '@/lib/payment/payment-types';

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
  
  if (!body.planType || body.planType !== 'premium') {
    return { isValid: false, error: 'Geçersiz plan tipi' };
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
    console.log('🔗 ===== PAYTR LINK API START =====');
    console.log('🔗 Payment Link API called at:', new Date().toISOString());
    console.log('🔗 Environment:', process.env.NODE_ENV);
    console.log('🔗 APP_URL:', process.env.NEXT_PUBLIC_APP_URL);
    
    // Authentication kontrolü (development'ta esnek)
    const authHeader = request.headers.get('authorization');
    console.log('🔗 Auth header:', authHeader);
    
    if (process.env.NODE_ENV === 'production') {
      // Production'da sıkı authentication
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('🔗 Authentication failed: No valid auth header');
        return NextResponse.json({ 
          success: false,
          error: 'Kimlik doğrulama gerekli',
          message: 'Lütfen giriş yapın'
        }, { status: 401 });
      }
      
      const token = authHeader.replace('Bearer ', '');
      if (!token || token.length < 10) {
        console.log('🔗 Authentication failed: Invalid token');
        return NextResponse.json({ 
          success: false,
          error: 'Geçersiz kimlik bilgisi',
          message: 'Lütfen tekrar giriş yapın'
        }, { status: 401 });
      }
      
      console.log('🔗 Production authentication successful, token length:', token.length);
    } else {
      // Development'ta authentication opsiyonel
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '');
        console.log('🔗 Development authentication with token, length:', token.length);
      } else {
        console.log('🔗 Development mode - authentication bypassed');
      }
    }
    
    // Rate limiting kontrolü
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    if (!checkRateLimit(clientIP, 5, 60000)) {
      console.log('🔗 Rate limit exceeded for IP:', clientIP);
      return NextResponse.json({ 
        success: false,
        error: 'Çok fazla istek. Lütfen bir dakika bekleyin.' 
      }, { status: 429 });
    }
    
    // Request body'yi parse et
    const body = await request.json();
    console.log('🔗 Request body:', body);
    
    // Input validation
    const validation = validatePaymentRequest(body);
    if (!validation.isValid) {
      console.log('🔗 Validation failed:', validation.error);
      return NextResponse.json({ 
        success: false,
        error: validation.error 
      }, { status: 400 });
    }
    
    const { userId, amount, planType, userEmail, userName } = body;
    console.log('🔗 Creating payment link for:', { userId, amount, planType, userEmail, userName });
    
    // PayTR Link API ile ödeme linki oluştur
    const paymentRequest: PaymentRequest = {
      userId,
      amount,
      currency: 'TRY',
      planType,
      userEmail,
      userName
    };
    
    console.log('🔗 PaymentRequest object:', paymentRequest);
    
    const result = await paytrLinkService.createPaymentLink(paymentRequest);
    
    console.log('🔗 PaytrLinkService result:', result);
    
    if (result.success) {
      console.log('🔗 Payment link created successfully:', result);
      console.log('🔗 ===== PAYTR LINK API SUCCESS =====');
      
      return NextResponse.json({
        success: true,
        token: result.token,
        message: result.message,
        paymentUrl: result.paymentUrl,
        orderId: result.token // Link ID'yi order ID olarak kullan
      });
    } else {
      console.log('🔗 Payment link creation failed:', result.error);
      
      return NextResponse.json({
        success: false,
        error: result.error,
        message: result.message
      }, { status: 400 });
    }

  } catch (error) {
    console.log('🔗 ===== PAYTR LINK API ERROR =====');
    console.error('🔗 Payment link creation error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Ödeme linki oluşturulamadı',
        message: error instanceof Error ? error.message : 'Teknik bir hata oluştu',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, 
      { status: 500 }
    );
  }
}
