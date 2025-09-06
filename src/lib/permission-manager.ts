import { User } from '@/types/user';
import { permissionService } from './firebase-services';

export interface UserPermissionInfo {
  hasPermission: boolean;
  source: 'admin' | 'trial' | 'subscription' | 'none';
  permissions: string[];
  trialActive: boolean;
  subscriptionActive: boolean;
}

class PermissionManager {
  private static instance: PermissionManager;

  private constructor() {}

  static getInstance(): PermissionManager {
    if (!PermissionManager.instance) {
      PermissionManager.instance = new PermissionManager();
    }
    return PermissionManager.instance;
  }

  async getUserPermissionInfo(user: User): Promise<UserPermissionInfo> {
    console.log('🔍 PermissionManager: Getting permission info for user:', user.email);
    
    // Admin users have all permissions
    if (user.role === 'admin') {
      console.log('🔍 PermissionManager: User is admin, granting all permissions');
      return {
        hasPermission: true,
        source: 'admin',
        permissions: ['all'],
        trialActive: false,
        subscriptionActive: false
      };
    }

    const now = new Date();
    let trialActive = false;
    let subscriptionActive = false;
    let permissions: string[] = [];
    let source: 'admin' | 'trial' | 'subscription' | 'none' = 'none';

    // Check trial status
    if (user.trialEndsAt) {
      let trialEnd: Date;
      
      if (user.trialEndsAt instanceof Date) {
        trialEnd = user.trialEndsAt;
      } else if (user.trialEndsAt && typeof (user.trialEndsAt as any).toDate === 'function') {
        trialEnd = (user.trialEndsAt as any).toDate();
      } else {
        trialEnd = new Date(user.trialEndsAt);
      }
      
      trialActive = now < trialEnd;
      console.log('🔍 PermissionManager: Trial check:', {
        trialEndsAt: user.trialEndsAt,
        trialEnd,
        now,
        trialActive
      });
    }

    // Check subscription status
    if (user.subscription?.status === 'active') {
      let isSubscriptionActive = true;
      
      if (user.subscription.endDate) {
        let endDate: Date;
        
        if (user.subscription.endDate instanceof Date) {
          endDate = user.subscription.endDate;
        } else if (user.subscription.endDate && typeof (user.subscription.endDate as any).toDate === 'function') {
          endDate = (user.subscription.endDate as any).toDate();
        } else {
          endDate = new Date(user.subscription.endDate);
        }
        
        isSubscriptionActive = now < endDate;
      }
      
      subscriptionActive = isSubscriptionActive;
      console.log('🔍 PermissionManager: Subscription check:', {
        status: user.subscription.status,
        endDate: user.subscription.endDate,
        isSubscriptionActive
      });
    }

    // YENİ SİSTEM: Öncelik sırası
    if (subscriptionActive) {
      // 1. ÖNCE: Subscription varsa, trial'ı yok say
      const subscriptionTools = ['question-generator', 'writing-evaluator', 'text-question-analysis'];
      permissions = subscriptionTools;
      source = 'subscription';
      console.log('🔍 PermissionManager: Subscription active, trial ignored. Permissions:', permissions);
    } else if (trialActive) {
      // 2. SONRA: Trial varsa, tüm tool'ları ver
      const trialTools = ['question-generator', 'writing-evaluator', 'text-question-analysis'];
      permissions = trialTools;
      source = 'trial';
      console.log('🔍 PermissionManager: Trial active, all tools granted. Permissions:', permissions);
    } else {
      // 3. SON: Hiçbiri yoksa, admin permission'larını kontrol et
      const explicitPermissions = await permissionService.getUserPermissions(user.uid);
      if (explicitPermissions.length > 0) {
        permissions = explicitPermissions;
        source = 'admin';
        console.log('🔍 PermissionManager: Only admin permissions found:', permissions);
      } else {
        permissions = [];
        source = 'none';
        console.log('🔍 PermissionManager: No permissions found');
      }
    }

    const hasPermission = permissions.length > 0;

    console.log('🔍 PermissionManager: Final permission info:', {
      hasPermission,
      source,
      permissions,
      trialActive,
      subscriptionActive
    });

    return {
      hasPermission,
      source,
      permissions,
      trialActive,
      subscriptionActive
    };
  }

  async hasPermissionForTool(user: User, tool: string): Promise<boolean> {
    const permissionInfo = await this.getUserPermissionInfo(user);
    
    if (permissionInfo.source === 'admin' && permissionInfo.permissions.includes('all')) {
      return true;
    }
    
    return permissionInfo.permissions.includes(tool);
  }

  async getAllUsersPermissionInfo(users: User[]): Promise<{[userId: string]: UserPermissionInfo}> {
    const results: {[userId: string]: UserPermissionInfo} = {};
    
    for (const user of users) {
      try {
        results[user.uid] = await this.getUserPermissionInfo(user);
      } catch (error) {
        console.error(`Error getting permission info for user ${user.email}:`, error);
        results[user.uid] = {
          hasPermission: false,
          source: 'none',
          permissions: [],
          trialActive: false,
          subscriptionActive: false
        };
      }
    }
    
    return results;
  }

  getPermissionDisplayText(permissionId: string): string {
    const permissionMap: {[key: string]: string} = {
      'question-generator': 'Question Generator',
      'writing-evaluator': 'Writing Evaluator',
      'text-question-analysis': 'Text Question Analysis',
      'all': 'All Tools'
    };
    
    return permissionMap[permissionId] || permissionId;
  }
}

export const permissionManager = PermissionManager.getInstance();