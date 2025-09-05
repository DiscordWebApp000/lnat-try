import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { User, Subscription, SubscriptionPlan, SubscriptionPayment } from '@/types/user';

export class SubscriptionService {
  
  // Kullanıcıya abonelik planını aktif et
  async activateSubscription(
    userId: string, 
    planId: string, 
    paymentData: {
      paymentId: string;
      linkId: string; // iFrame'de merchant_oid kullanılıyor
      amount: number;
      currency: string;
    }
  ): Promise<void> {
    try {
      // Plan bilgisini al - document ID'ye göre direkt arama
      const planDocRef = doc(db, 'subscriptionPlans', planId);
      const planDoc = await getDoc(planDocRef);
      
      if (!planDoc.exists()) {
        throw new Error(`Plan bulunamadı: ${planId}`);
      }
      
      const planData = planDoc.data();
      const plan: SubscriptionPlan = {
        ...planData,
        id: planDoc.id, // Document ID'yi kullan
        createdAt: planData.createdAt?.toDate ? planData.createdAt.toDate() : planData.createdAt,
        updatedAt: planData.updatedAt?.toDate ? planData.updatedAt.toDate() : planData.updatedAt
      } as SubscriptionPlan;
      
      // Subscription oluştur
      const subscriptionId = `sub_${userId}_${Date.now()}`;
      const now = new Date();
      const endDate = new Date(now.getTime() + (plan.duration * 24 * 60 * 60 * 1000));
      
      const subscription: Subscription = {
        id: subscriptionId,
        userId,
        status: 'active',
        planId: plan.id,
        planName: plan.name,
        startDate: now,
        endDate,
        autoRenew: true,
        permissions: plan.permissions,
        paymentHistory: [],
        lastPaymentDate: now,
        nextPaymentDate: endDate
      };
      
      // Payment record oluştur
      const payment: SubscriptionPayment = {
        id: `pay_${Date.now()}`,
        subscriptionId,
        userId,
        planId: plan.id,
        amount: paymentData.amount,
        currency: paymentData.currency,
        paymentMethod: 'paytr-iframe', // iFrame sistemi
        paymentId: paymentData.paymentId,
        linkId: paymentData.linkId, // merchant_oid
        status: 'success',
        paymentDate: now,
        planName: plan.name,
        planDisplayName: plan.displayName,
        permissions: plan.permissions,
        createdAt: now,
        updatedAt: now
      };
      
      // Firestore'a kaydet
      await setDoc(doc(db, 'subscriptions', subscriptionId), {
        ...subscription,
        startDate: Timestamp.fromDate(subscription.startDate),
        endDate: Timestamp.fromDate(subscription.endDate),
        lastPaymentDate: Timestamp.fromDate(subscription.lastPaymentDate!),
        nextPaymentDate: Timestamp.fromDate(subscription.nextPaymentDate!)
      });
      
      await setDoc(doc(db, 'subscriptionPayments', payment.id), {
        ...payment,
        paymentDate: Timestamp.fromDate(payment.paymentDate),
        createdAt: Timestamp.fromDate(payment.createdAt),
        updatedAt: Timestamp.fromDate(payment.updatedAt)
      });
      
      // User'ı güncelle
      await this.updateUserSubscriptionData(userId, subscription);
      
    } catch (error) {
      throw error;
    }
  }
  
  // User'ın subscription bilgilerini güncelle
  async updateUserSubscriptionData(
    userId: string, 
    subscription: Subscription
  ): Promise<void> {
    try {
      const userDoc = doc(db, 'users', userId);
      
      // User'ı güncelle
      await updateDoc(userDoc, {
        currentSubscriptionPlanId: subscription.planId,
        subscriptionPermissions: subscription.permissions,
        lastSubscriptionDate: Timestamp.fromDate(subscription.startDate),
        totalSubscriptions: 1, // TODO: Increment existing value
        'subscription.id': subscription.id,
        'subscription.status': subscription.status,
        'subscription.planId': subscription.planId,
        'subscription.startDate': Timestamp.fromDate(subscription.startDate),
        'subscription.endDate': Timestamp.fromDate(subscription.endDate)
      });
      
    } catch (error) {
      throw error;
    }
  }
  
  // Kullanıcının aktif subscription'ını kontrol et
  async getUserActiveSubscription(userId: string): Promise<SubscriptionPlan | null> {
    try {
      // User'ın aktif subscription'ını bul
      const subscriptionsQuery = query(
        collection(db, 'subscriptions'),
        where('userId', '==', userId),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );
      
      const subscriptionsSnapshot = await getDocs(subscriptionsQuery);
      
      if (subscriptionsSnapshot.empty) {
        return null;
      }
      
      const subscription = subscriptionsSnapshot.docs[0].data() as Subscription;
      
      // Plan bilgisini al
      const planQuery = query(
        collection(db, 'subscriptionPlans'),
        where('id', '==', subscription.planId)
      );
      
      const planSnapshot = await getDocs(planQuery);
      
      if (planSnapshot.empty) {
        return null;
      }
      
      return planSnapshot.docs[0].data() as SubscriptionPlan;
      
    } catch {
      return null;
    }
  }
  
  // Admin permission verme
  async grantAdminPermissions(
    userId: string, 
    permissions: string[], 
    grantedBy: string,
    reason?: string
  ): Promise<void> {
    try {
      const userDoc = doc(db, 'users', userId);
      
      // Mevcut permissions'ları al ve birleştir
      const existingPermissions = await this.getUserPermissions(userId);
      const newPermissions = [...new Set([...existingPermissions, ...permissions])];
      
      await updateDoc(userDoc, {
        permissions: newPermissions,
        updatedAt: Timestamp.fromDate(new Date())
      });
      
      // Permission log'u kaydet
      await setDoc(doc(db, 'permissionLogs', `log_${Date.now()}`), {
        userId,
        permissions,
        grantedBy,
        reason: reason || 'Admin tarafından verildi',
        type: 'admin_grant',
        createdAt: Timestamp.fromDate(new Date())
      });
      
    } catch {
      throw new Error('Admin permission grant failed');
    }
  }
  
  // Kullanıcının tüm permissions'larını al
  async getUserPermissions(userId: string): Promise<string[]> {
    try {
      const userSnapshot = await getDocs(query(collection(db, 'users'), where('uid', '==', userId)));
      
      if (userSnapshot.empty) {
        return [];
      }
      
      const userData = userSnapshot.docs[0].data() as User;
      const permissions: string[] = [];
      
      // Admin permissions
      if (userData.permissions) {
        permissions.push(...userData.permissions);
      }
      
      // Subscription permissions
      if (userData.subscriptionPermissions) {
        permissions.push(...userData.subscriptionPermissions);
      }
      
      // Trial permissions (eğer trial aktifse)
      if (userData.trialEndsAt && new Date() < userData.trialEndsAt) {
        permissions.push('question-generator', 'writing-evaluator', 'text-question-analysis');
      }
      
      return [...new Set(permissions)];
      
    } catch {
      return [];
    }
  }
}

export const subscriptionService = new SubscriptionService();


