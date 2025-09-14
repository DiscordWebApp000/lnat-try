import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { subscriptionService } from '@/lib/subscription-service';

// Manual subscription activation for success page
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;
    
    console.log('🔍 MANUAL ACTIVATION: Attempting to activate subscription for orderId:', orderId);
    
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }
    
    // Extract user ID from merchant_oid (orderId)
    const userIdMatch = orderId.match(/order([a-zA-Z0-9]+)plan/);
    if (!userIdMatch || !userIdMatch[1]) {
      console.error('❌ MANUAL ACTIVATION: Could not extract user ID from orderId:', orderId);
      return NextResponse.json({ error: 'Invalid order ID format' }, { status: 400 });
    }
    
    const userId = userIdMatch[1];
    console.log('✅ MANUAL ACTIVATION: User ID extracted:', userId);
    
    // Check if pending payment exists
    const pendingPaymentDoc = await getDoc(doc(db, 'pendingPayments', userId));
    
    if (!pendingPaymentDoc.exists()) {
      console.log('⚠️ MANUAL ACTIVATION: No pending payment found for user:', userId);
      return NextResponse.json({ error: 'No pending payment found' }, { status: 404 });
    }
    
    const pendingPayment = pendingPaymentDoc.data();
    console.log('✅ MANUAL ACTIVATION: Pending payment found:', pendingPayment);
    
    console.log('🔥 MANUAL ACTIVATION CRITICAL: Plan activation data:', {
      'pending.planId': pendingPayment.planId,
      'pending.planType': pendingPayment.planType,
      'pending.amount': pendingPayment.amount,
      'userId': userId,
      'fullPendingData': pendingPayment
    });
    
    // Activate subscription with pending plan
    await subscriptionService.activateSubscription(userId, pendingPayment.planId, {
      paymentId: orderId,
      linkId: orderId,
      amount: pendingPayment.amount,
      currency: 'TRY'
    });
    
    console.log('🎉 MANUAL ACTIVATION: Subscription activated successfully!');
    
    // Clean up pending payment
    await deleteDoc(doc(db, 'pendingPayments', userId));
    console.log('🗑️ MANUAL ACTIVATION: Pending payment cleaned up');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Subscription activated successfully',
      planId: pendingPayment.planId
    });
    
  } catch (error) {
    console.error('❌ MANUAL ACTIVATION: Error:', error);
    return NextResponse.json({ 
      error: 'Subscription activation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

