import { NextRequest, NextResponse } from 'next/server';
import { subscriptionService } from '@/lib/subscription-service';

export async function POST(request: NextRequest) {
  try {
    const { userId, planId } = await request.json();
    
    console.log('🧪 Test webhook başlatıldı:', { userId, planId });
    
    // Test subscription aktivasyonu
    await subscriptionService.activateSubscription(userId, planId, {
      paymentId: 'test_payment_' + Date.now(),
      linkId: 'test_link_' + Date.now(),
      amount: 1.00,
      currency: 'TRY'
    });
    
    console.log('✅ Test subscription başarıyla oluşturuldu!');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test subscription başarıyla oluşturuldu!' 
    });
    
  } catch (error) {
    console.error('❌ Test webhook hatası:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
