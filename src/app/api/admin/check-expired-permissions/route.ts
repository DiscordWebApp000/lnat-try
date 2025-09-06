import { NextResponse } from 'next/server';
import { subscriptionService } from '@/lib/firebase-services';

export async function POST() {
  try {
    console.log('🔍 Checking expired permissions with new system...');
    
    // Check and update expired subscriptions
    await subscriptionService.checkAndUpdateExpiredSubscriptions();
    
    // Check and revoke expired admin-granted permissions
    await subscriptionService.checkAndRevokeExpiredAdminPermissions();
    
    // Force update trial status
    await subscriptionService.forceUpdateTrialStatus();
    
    // YENİ SİSTEM: Check and clean permissions based on new rules
    await subscriptionService.checkAndCleanPermissions();
    
    console.log('✅ Expired permissions checked and updated with new system');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Expired permissions checked and updated successfully with new system' 
    });
    
  } catch (error) {
    console.error('❌ Error checking expired permissions:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check expired permissions' 
      },
      { status: 500 }
    );
  }
}
