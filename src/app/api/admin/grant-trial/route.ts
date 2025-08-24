import { NextRequest, NextResponse } from 'next/server';
import { subscriptionService } from '@/lib/firebase-services';

// In-memory rate limiting for trial granting
const trialGrantAttempts = new Map<string, { count: number; lastAttempt: number }>();

const checkRateLimit = (userId: string): boolean => {
  const now = Date.now();
  const userAttempts = trialGrantAttempts.get(userId);
  
  if (!userAttempts) {
    trialGrantAttempts.set(userId, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Reset counter if more than 1 minute has passed
  if (now - userAttempts.lastAttempt > 60000) {
    trialGrantAttempts.set(userId, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Allow max 3 attempts per minute
  if (userAttempts.count >= 3) {
    return false;
  }
  
  userAttempts.count++;
  userAttempts.lastAttempt = now;
  return true;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, grantedBy, reason } = body;
    
    console.log('🔍 Grant trial request:', { userId, grantedBy, reason });
    
    // Input validation
    if (!userId || !grantedBy) {
      return NextResponse.json({ 
        error: 'userId ve grantedBy gerekli' 
      }, { status: 400 });
    }

    // Rate limiting check
    if (!checkRateLimit(userId)) {
      console.log('🔒 Rate limit exceeded for user:', userId);
      return NextResponse.json({ 
        error: 'Çok fazla deneme yapıldı. Lütfen 1 dakika bekleyin.' 
      }, { status: 429 });
    }

    // Trial period verme
    const result = await subscriptionService.grantTrialPeriod(userId, grantedBy, reason || 'Admin tarafından verildi');
    
    console.log('🔍 Trial period granted successfully:', result);
    
    return NextResponse.json({
      success: true,
      message: 'Trial period granted successfully',
      data: {
        newEndDate: result.newEndDate.toISOString(),
        daysAdded: result.daysAdded
      }
    });

  } catch (error) {
    console.error('Grant trial error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Trial period verilemedi',
        message: error instanceof Error ? error.message : 'Teknik bir hata oluştu'
      }, 
      { status: 500 }
    );
  }
}
