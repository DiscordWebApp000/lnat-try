import { NextResponse } from 'next/server';
import { subscriptionService, userService } from '@/lib/firebase-services';

export async function POST() {
  try {
    console.log('🔍 Saving permission status to database...');
    
    // Get all users
    const users = await userService.getAllUsers();
    console.log(`🔍 Found ${users.length} users to process`);
    
    // Save permission status to database
    await subscriptionService.savePermissionStatusToDatabase(users);
    
    console.log('✅ Permission status saved to database successfully');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Permission status saved to database successfully',
      usersProcessed: users.length
    });
    
  } catch (error) {
    console.error('❌ Error saving permission status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save permission status to database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
