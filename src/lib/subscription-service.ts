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

  // Kullanıcıya abonelik planını aktif et - BASIT VE SADE SİSTEM
  async activateSubscription(
    userId: string, 
    planId: string, 
    paymentData: {
      paymentId: string;
      linkId: string;
      amount: number;
      currency: string;
    }
  ): Promise<void> {
    try {
      console.log('🔥 SIMPLE ACTIVATION: Starting activation for user:', userId);
      
      // 1. Pending payment'ı al
      const pendingPaymentDoc = await getDoc(doc(db, 'pendingPayments', userId));
      
      if (!pendingPaymentDoc.exists()) {
        throw new Error('❌ Pending payment bulunamadı!');
      }
      
      const pendingData = pendingPaymentDoc.data();
      console.log('🎯 SIMPLE: Pending data:', pendingData);
      
      // 2. Plan bilgilerini pending'den al
      const actualPlanId = pendingData.planId;
      const planType = pendingData.planType;
      const planAmount = pendingData.amount;
      
      console.log('🔥 SIMPLE: Using plan from pending:', {
        planId: actualPlanId,
        planType: planType,
        amount: planAmount
      });
      
      // 3. Plan document'ini al
      console.log('🔍 SIMPLE: Searching for plan document:', {
        collection: 'subscriptionPlans',
        documentId: actualPlanId,
        fullPath: `subscriptionPlans/${actualPlanId}`
      });
      
      const planDoc = await getDoc(doc(db, 'subscriptionPlans', actualPlanId));
      
      console.log('🔍 SIMPLE: Plan document query result:', {
        exists: planDoc.exists(),
        id: planDoc.id,
        hasData: !!planDoc.data()
      });
      
      if (!planDoc.exists()) {
        console.error('❌ SIMPLE: Plan document bulunamadı! Firestore da mevcut planları kontrol edin');
        
        // Tüm planları listele
        console.log('🔍 SIMPLE: Listing all available plans...');
        const allPlansSnapshot = await getDocs(collection(db, 'subscriptionPlans'));
        
        console.log('📋 SIMPLE: Available plans in Firestore:');
        allPlansSnapshot.forEach(doc => {
          const data = doc.data();
          console.log(`  - ID: ${doc.id}, Name: ${data.name}, DisplayName: ${data.displayName}`);
        });
        
        throw new Error(`❌ Plan document bulunamadı: ${actualPlanId}`);
      }
      
      const planData = planDoc.data();
      console.log('✅ SIMPLE: Plan found and loaded:', {
        documentId: planDoc.id,
        planData: {
          name: planData.name,
          displayName: planData.displayName,
          price: planData.price,
          duration: planData.duration,
          currency: planData.currency
        }
      });
      
      // 4. Plan object'ini oluştur
      const plan: SubscriptionPlan = {
        id: planDoc.id,
        name: planData.name,
        displayName: planData.displayName,
        description: planData.description || '',
        price: planData.price,
        currency: planData.currency,
        duration: planData.duration,
        features: planData.features || [],
        maxUsage: planData.maxUsage || 0,
        permissions: planData.permissions || [],
        isActive: planData.isActive,
        isDefault: planData.isDefault,
        createdAt: planData.createdAt?.toDate ? planData.createdAt.toDate() : new Date(),
        updatedAt: planData.updatedAt?.toDate ? planData.updatedAt.toDate() : new Date(),
        updatedBy: planData.updatedBy || 'system'
      };
      
      // 5. Subscription oluştur - BASİT
      const subscriptionId = `sub_${userId}_${Date.now()}`;
      const now = new Date();
      const endDate = new Date(now.getTime() + (plan.duration * 24 * 60 * 60 * 1000));
      
      console.log('🔥 SIMPLE: Creating subscription with plan:', {
        subscriptionId,
        userId,
        planId: plan.id,
        planName: plan.name,
        planDisplayName: plan.displayName,
        duration: plan.duration
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
        planDisplayName: plan.displayName,
        planDescription: plan.description,
        planPrice: plan.price,
        planCurrency: plan.currency,
        planFeatures: plan.features,
        planMaxUsage: plan.maxUsage,
        originalPlanDuration: plan.duration,
        totalDuration: plan.duration
      };
      
      // 6. Payment record oluştur
      const payment: SubscriptionPayment = {
        id: `pay_${Date.now()}`,
        subscriptionId,
        userId,
        planId: plan.id,
        amount: planAmount, // Pending'den gelen amount
        currency: 'TRY',
        paymentMethod: 'paytr-iframe',
        paymentId: paymentData.paymentId,
        linkId: paymentData.linkId,
        status: 'success',
        paymentDate: now,
        planName: plan.name,
        planDisplayName: plan.displayName,
        permissions: plan.permissions,
        createdAt: now,
        updatedAt: now
      };
      
      console.log('🔥 SIMPLE: CRITICAL - About to save to database:', {
        'SELECTED PLAN (from pending)': {
          planId: actualPlanId,
          planType: planType,
          amount: planAmount
        },
        'PLAN OBJECT (from Firestore)': {
          id: plan.id,
          name: plan.name,
          displayName: plan.displayName,
          price: plan.price
        },
        'SUBSCRIPTION OBJECT (will be saved)': {
          id: subscription.id,
          planId: subscription.planId,
          planName: subscription.planName,
          planDisplayName: subscription.planDisplayName,
          planPrice: subscription.planPrice
        },
        'PAYMENT OBJECT (will be saved)': {
          id: payment.id,
          planId: payment.planId,
          planName: payment.planName,
          amount: payment.amount
        },
        'DOCUMENT PATH': `subscriptions/${subscriptionId}`,
        'VERIFICATION': {
          'pending.planId === plan.id': actualPlanId === plan.id,
          'plan.id === subscription.planId': plan.id === subscription.planId,
          'subscription.planId === payment.planId': subscription.planId === payment.planId
        }
      });
      
      // 7. Firestore'a kaydet
      console.log('💾 SIMPLE: Writing subscription to Firestore...');
      const subscriptionDocData = {
        ...subscription,
        startDate: Timestamp.fromDate(subscription.startDate),
        endDate: Timestamp.fromDate(subscription.endDate),
        lastPaymentDate: Timestamp.fromDate(subscription.lastPaymentDate!),
        nextPaymentDate: Timestamp.fromDate(subscription.nextPaymentDate!)
      };
      
      console.log('💾 SIMPLE: Final subscription document data:', {
        id: subscriptionDocData.id,
        userId: subscriptionDocData.userId,
        planId: subscriptionDocData.planId,
        planName: subscriptionDocData.planName,
        planDisplayName: subscriptionDocData.planDisplayName,
        planPrice: subscriptionDocData.planPrice
      });
      
      await setDoc(doc(db, 'subscriptions', subscriptionId), subscriptionDocData);
      
      await setDoc(doc(db, 'subscriptionPayments', payment.id), {
        ...payment,
        paymentDate: Timestamp.fromDate(payment.paymentDate),
        createdAt: Timestamp.fromDate(payment.createdAt),
        updatedAt: Timestamp.fromDate(payment.updatedAt)
      });
      
      // 8. User'ı güncelle
      await this.updateUserSubscriptionData(userId, subscription);
      
      console.log('🎉 SIMPLE: Subscription başarıyla oluşturuldu!', {
        subscriptionId,
        'FINAL SAVED PLAN': {
          id: plan.id,
          name: plan.name,
          displayName: plan.displayName,
          price: plan.price
        },
        'ORIGINAL PENDING PLAN': {
          id: actualPlanId,
          type: planType,
          amount: planAmount
        },
        'SUCCESS': plan.id === actualPlanId ? '✅ CORRECT PLAN SAVED' : '❌ WRONG PLAN SAVED'
      });
      
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


