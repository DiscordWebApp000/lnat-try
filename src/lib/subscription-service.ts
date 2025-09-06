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
  
  // Kullanıcının kalan trial süresini hesapla
  async getRemainingTrialTime(userId: string): Promise<number> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) {
        return 0;
      }
      
      const userData = userDoc.data();
      const now = new Date();
      
      // User document'ındaki trialEndsAt'ı kontrol et
      if (userData.trialEndsAt) {
        let trialEnd: Date;
        
        if (userData.trialEndsAt instanceof Date) {
          trialEnd = userData.trialEndsAt;
        } else if (userData.trialEndsAt && typeof userData.trialEndsAt.toDate === 'function') {
          trialEnd = userData.trialEndsAt.toDate();
        } else {
          trialEnd = new Date(userData.trialEndsAt);
        }
        
        if (!isNaN(trialEnd.getTime()) && trialEnd > now) {
          const remainingMs = trialEnd.getTime() - now.getTime();
          const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
          console.log('🔍 Remaining trial time:', remainingDays, 'days');
          return Math.max(0, remainingDays);
        }
      }
      
      // Trial subscription'ı da kontrol et
      const trialSubscriptionDoc = await getDoc(doc(db, 'subscriptions', `trial_${userId}`));
      
      if (trialSubscriptionDoc.exists()) {
        const trialData = trialSubscriptionDoc.data();
        let trialEnd: Date;
        
        if (trialData.trialEndsAt) {
          if (trialData.trialEndsAt instanceof Date) {
            trialEnd = trialData.trialEndsAt;
          } else if (trialData.trialEndsAt && typeof trialData.trialEndsAt.toDate === 'function') {
            trialEnd = trialData.trialEndsAt.toDate();
          } else {
            trialEnd = new Date(trialData.trialEndsAt);
          }
          
          if (!isNaN(trialEnd.getTime()) && trialEnd > now) {
            const remainingMs = trialEnd.getTime() - now.getTime();
            const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
            console.log('🔍 Remaining trial time from subscription:', remainingDays, 'days');
            return Math.max(0, remainingDays);
          }
        }
      }
      
      return 0;
    } catch (error) {
      console.error('Error calculating remaining trial time:', error);
      return 0;
    }
  }

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
      console.log('🔍 SubscriptionService: Plan aranıyor:', { planId, userId });
      console.log('🔍 Plan ID type:', typeof planId);
      console.log('🔍 Plan ID value:', planId);
      console.log('🔍 Plan ID length:', planId.length);
      
      // Plan bilgisini al - document ID'ye göre direkt arama
      const planDocRef = doc(db, 'subscriptionPlans', planId);
      const planDoc = await getDoc(planDocRef);
      
      if (!planDoc.exists()) {
        console.error('❌ SubscriptionService: Plan bulunamadı:', planId);
        throw new Error(`Plan bulunamadı: ${planId}`);
      }
      
      console.log('✅ SubscriptionService: Plan bulundu:', planDoc.data());
      
      const planData = planDoc.data();
      const plan: SubscriptionPlan = {
        ...planData,
        id: planDoc.id, // Document ID'yi kullan
        createdAt: planData.createdAt?.toDate ? planData.createdAt.toDate() : planData.createdAt,
        updatedAt: planData.updatedAt?.toDate ? planData.updatedAt.toDate() : planData.updatedAt
      } as SubscriptionPlan;
      
      console.log('🔍 Plan details for subscription:', {
        id: plan.id,
        name: plan.name,
        displayName: plan.displayName,
        description: plan.description,
        price: plan.price,
        currency: plan.currency,
        duration: plan.duration,
        features: plan.features,
        maxUsage: plan.maxUsage
      });
      
      console.log('🔍 Raw plan data from Firestore:', planData);
      
      // Plan data'sında eksik field'ları kontrol et
      if (!plan.displayName) {
        console.warn('⚠️ Plan displayName eksik, name kullanılıyor');
        plan.displayName = plan.name;
      }
      if (!plan.description) {
        console.warn('⚠️ Plan description eksik, boş string kullanılıyor');
        plan.description = '';
      }
      if (!plan.features) {
        console.warn('⚠️ Plan features eksik, boş array kullanılıyor');
        plan.features = [];
      }
      if (plan.maxUsage === undefined) {
        console.warn('⚠️ Plan maxUsage eksik, 0 kullanılıyor');
        plan.maxUsage = 0;
      }
      
      // Kalan trial süresini hesapla (sadece bilgi için)
      const remainingTrialDays = await this.getRemainingTrialTime(userId);
      console.log('🔍 Remaining trial days (will be removed):', remainingTrialDays);
      
      // Subscription oluştur - sadece plan süresini kullan
      const subscriptionId = `sub_${userId}_${Date.now()}`;
      const now = new Date();
      const totalDuration = plan.duration; // Sadece plan süresi
      const endDate = new Date(now.getTime() + (totalDuration * 24 * 60 * 60 * 1000));
      
      console.log('🔍 Subscription duration calculation:', {
        planDuration: plan.duration,
        remainingTrialDays,
        totalDuration,
        startDate: now,
        endDate
      });
      
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
        nextPaymentDate: endDate,
        // Plan detayları
        planDisplayName: plan.displayName,
        planDescription: plan.description,
        planPrice: plan.price,
        planCurrency: plan.currency,
        planFeatures: plan.features,
        planMaxUsage: plan.maxUsage,
        // Plan süresi bilgisi (trial kaldırıldı)
        originalPlanDuration: plan.duration,
        totalDuration: totalDuration
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
        nextPaymentDate: Timestamp.fromDate(subscription.nextPaymentDate!),
        // Plan süresi bilgisi (trial kaldırıldı)
        originalPlanDuration: subscription.originalPlanDuration,
        totalDuration: subscription.totalDuration
      });
      
      await setDoc(doc(db, 'subscriptionPayments', payment.id), {
        ...payment,
        paymentDate: Timestamp.fromDate(payment.paymentDate),
        createdAt: Timestamp.fromDate(payment.createdAt),
        updatedAt: Timestamp.fromDate(payment.updatedAt)
      });
      
      // User'ı güncelle
      console.log('👤 SubscriptionService: User güncelleniyor:', { userId, subscriptionId });
      await this.updateUserSubscriptionData(userId, subscription);
      
      console.log('🎉 SubscriptionService: Subscription başarıyla oluşturuldu!');
      
    } catch (error) {
      console.error('❌ SubscriptionService: Hata:', error);
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
      
      // User'ı güncelle - subscription object'ini tamamen değiştir
      const subscriptionData = {
        id: subscription.id,
        status: subscription.status,
        planId: subscription.planId,
        planName: subscription.planName,
        startDate: Timestamp.fromDate(subscription.startDate),
        endDate: Timestamp.fromDate(subscription.endDate),
        autoRenew: subscription.autoRenew,
        permissions: subscription.permissions,
        // Plan detaylarını da ekle - subscription'dan gelen gerçek değerleri kullan
        planDetails: {
          displayName: subscription.planDisplayName,
          description: subscription.planDescription,
          price: subscription.planPrice,
          currency: subscription.planCurrency,
          duration: subscription.originalPlanDuration,
          features: subscription.planFeatures,
          maxUsage: subscription.planMaxUsage
        },
        // Plan süresi bilgisi (trial kaldırıldı)
        originalPlanDuration: subscription.originalPlanDuration,
        totalDuration: subscription.totalDuration
      };
      
      console.log('👤 SubscriptionService: User güncelleniyor:', { 
        userId, 
        subscriptionId: subscription.id,
        subscriptionData,
        planDetails: subscriptionData.planDetails
      });
      
      await updateDoc(userDoc, {
        currentSubscriptionPlanId: subscription.planId,
        subscriptionPermissions: subscription.permissions,
        lastSubscriptionDate: Timestamp.fromDate(subscription.startDate),
        totalSubscriptions: 1, // TODO: Increment existing value
        subscription: subscriptionData,
        // YENİ SİSTEM: Subscription alındığında trial'ı sil
        trialEndsAt: null
      });
      
      console.log('✅ SubscriptionService: User başarıyla güncellendi!');
      
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


