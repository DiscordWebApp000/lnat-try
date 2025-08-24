import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  addDoc,
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';
import * as firebaseAuth from 'firebase/auth';
import { db, auth } from './firebase';
import { User, UserProfile, ExamResult, Permission, UserPermission, Subscription, TrialPeriod } from '@/types/user';
import { SupportTicket, SupportMessage } from '@/types/user';

// Auth Services
export const authService = {
  // Register
  async register(email: string, password: string, firstName: string, lastName: string): Promise<User> {
    try {
      const userCredential = await firebaseAuth.createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const newUser: User = {
        uid: user.uid,
        email: user.email!,
        firstName,
        lastName,
        role: 'user',
        permissions: [],
        createdAt: new Date(),
        lastLoginAt: new Date(),
        isActive: true
      };
      
      // Save to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        ...newUser,
        createdAt: Timestamp.fromDate(newUser.createdAt),
        lastLoginAt: Timestamp.fromDate(newUser.lastLoginAt)
      });
      
      // Create profile
      const profile: UserProfile = {
        uid: user.uid,
        firstName,
        lastName,
        email: user.email!
      };
      
      await setDoc(doc(db, 'userProfiles', user.uid), profile);
      
      // Create trial subscription for new user
      await subscriptionService.createTrialSubscription(user.uid);
      
      // Also create trial period record
      const trialPeriod: TrialPeriod = {
        id: `trial_${user.uid}_${Date.now()}`,
        userId: user.uid,
        grantedBy: 'system',
        grantedAt: new Date(),
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        isActive: true,
        reason: 'Yeni kullanıcı kaydı'
      };
      
      await setDoc(doc(db, 'trialPeriods', trialPeriod.id), {
        ...trialPeriod,
        grantedAt: Timestamp.fromDate(trialPeriod.grantedAt),
        startDate: Timestamp.fromDate(trialPeriod.startDate),
        endDate: Timestamp.fromDate(trialPeriod.endDate)
      });
      
      return newUser;
    } catch (error: unknown) {
      console.error('Registration error:', error);
      throw new Error(error instanceof Error ? error.message : 'An error occurred during registration');
    }
  },

  // Login
  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await firebaseAuth.signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get user information
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      let userWithDates: User;
      
      if (!userDoc.exists()) {
        // If user not found in Firestore, create new profile
        console.log('User not found in Firestore, creating new profile');
        
        const newUser: User = {
          uid: user.uid,
          email: user.email!,
          firstName: user.email!.split('@')[0], // Email'in @ öncesi kısmını ad olarak kullan
          lastName: '',
          role: 'user',
          permissions: [],
          createdAt: new Date(),
          lastLoginAt: new Date(),
          isActive: true
        };
        
        // Save to Firestore
        await setDoc(doc(db, 'users', user.uid), {
          ...newUser,
          createdAt: Timestamp.fromDate(newUser.createdAt),
          lastLoginAt: Timestamp.fromDate(newUser.lastLoginAt)
        });
        
        // Create profile
        const profile: UserProfile = {
          uid: user.uid,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: user.email!
        };
        
        await setDoc(doc(db, 'userProfiles', user.uid), profile);
        
        userWithDates = newUser;
      } else {
        const userData = userDoc.data();
        userWithDates = {
          ...userData,
          createdAt: userData.createdAt?.toDate() || new Date(),
          lastLoginAt: userData.lastLoginAt?.toDate() || new Date()
        } as User;
      }
      
              // Update last login time
        await updateDoc(doc(db, 'users', user.uid), {
        lastLoginAt: Timestamp.fromDate(new Date())
      });
      
      return userWithDates;
    } catch (error: unknown) {
      console.error('Login error:', error);
      throw new Error(error instanceof Error ? error.message : 'An error occurred during login');
    }
  },

  // Logout
  async logout(): Promise<void> {
    await firebaseAuth.signOut(auth);
  },

  // Change password
  async changePassword(newPassword: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user logged in');
    }
    await firebaseAuth.updatePassword(user, newPassword);
  },

  // Send password reset email
  async resetPassword(email: string): Promise<void> {
    await firebaseAuth.sendPasswordResetEmail(auth, email);
  }
};

// User Services
export const userService = {
  // Get user information
  async getUser(uid: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (!userDoc.exists()) {
        console.log(`User ${uid} not found in Firestore`);
        return null;
      }
      
      const userData = userDoc.data();
      return {
        ...userData,
        createdAt: userData.createdAt?.toDate() || new Date(),
        lastLoginAt: userData.lastLoginAt?.toDate() || new Date()
      } as User;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  // Get user profile
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const profileDoc = await getDoc(doc(db, 'userProfiles', uid));
    if (!profileDoc.exists()) {
      return null;
    }
    return profileDoc.data() as UserProfile;
  },

  // Profil güncelle
  async updateProfile(uid: string, profile: Partial<UserProfile>): Promise<void> {
    await updateDoc(doc(db, 'userProfiles', uid), profile);
  },

  // Tüm kullanıcıları getir (admin için)
  async getAllUsers(): Promise<User[]> {
    const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(usersQuery);
    return snapshot.docs.map(doc => {
      const userData = doc.data();
      
      // Firebase Timestamp'leri Date objesine çevir
      let createdAt: Date;
      let lastLoginAt: Date;
      
      if (userData.createdAt && typeof userData.createdAt.toDate === 'function') {
        // Firebase Timestamp objesi
        createdAt = userData.createdAt.toDate();
      } else if (userData.createdAt instanceof Date) {
        // Zaten Date objesi
        createdAt = userData.createdAt;
      } else {
        // Geçersiz tarih, şu anki tarihi kullan
        console.warn(`Invalid createdAt for user ${userData.email}, using current date`);
        createdAt = new Date();
      }
      
      if (userData.lastLoginAt && typeof userData.lastLoginAt.toDate === 'function') {
        // Firebase Timestamp objesi
        lastLoginAt = userData.lastLoginAt.toDate();
      } else if (userData.lastLoginAt instanceof Date) {
        // Zaten Date objesi
        lastLoginAt = userData.lastLoginAt;
      } else {
        // Geçersiz tarih, şu anki tarihi kullan
        console.warn(`Invalid lastLoginAt for user ${userData.email}, using current date`);
        lastLoginAt = new Date();
      }
      
      // Tarih validasyonu
      if (isNaN(createdAt.getTime())) {
        console.warn(`Invalid createdAt for user ${userData.email}, using current date`);
        createdAt = new Date();
      }
      if (isNaN(lastLoginAt.getTime())) {
        console.warn(`Invalid lastLoginAt for user ${userData.email}, using current date`);
        lastLoginAt = new Date();
      }
      
      return {
        ...userData,
        createdAt,
        lastLoginAt
      } as User;
    });
  },

  // Kullanıcı durumunu güncelle
  async updateUserStatus(uid: string, isActive: boolean): Promise<void> {
    await updateDoc(doc(db, 'users', uid), { isActive });
  },

  // Fix incorrect dates for existing users (admin function)
  async fixUserDates(uid: string): Promise<void> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      
      const userData = userDoc.data();
      const now = new Date();
      
      // Check if dates are invalid (like Jan 10, 1972)
      const createdAt = userData.createdAt?.toDate() || now;
      const lastLoginAt = userData.lastLoginAt?.toDate() || now;
      
      // If dates are from 1970s or invalid, update them
      if (createdAt.getFullYear() < 2000 || isNaN(createdAt.getTime())) {
        await updateDoc(doc(db, 'users', uid), {
          createdAt: Timestamp.fromDate(now)
        });
        console.log(`Fixed createdAt for user ${uid}`);
      }
      
      if (lastLoginAt.getFullYear() < 2000 || isNaN(lastLoginAt.getTime())) {
        await updateDoc(doc(db, 'users', uid), {
          lastLoginAt: Timestamp.fromDate(now)
        });
        console.log(`Fixed lastLoginAt for user ${uid}`);
      }
    } catch (error) {
      console.error('Error fixing user dates:', error);
      throw error;
    }
  },

  // Kullanıcı profilini güncelle (hem users hem userProfiles)
  async updateUserProfile(uid: string, userData: Partial<User>): Promise<void> {
    try {
      // Update both users collection and userProfiles collection
      const updateData = {
        ...userData,
        lastLoginAt: Timestamp.fromDate(new Date())
      };
      
      await updateDoc(doc(db, 'users', uid), updateData);
      
      // Also update userProfiles collection
      const profileData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email
      };
      
      await updateDoc(doc(db, 'userProfiles', uid), profileData);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  // Şifre güncelle
  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is currently signed in');
      }
      
      // Re-authenticate user before changing password
      const credential = await firebaseAuth.signInWithEmailAndPassword(auth, user.email!, currentPassword);
      await firebaseAuth.updatePassword(credential.user, newPassword);
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }
};

// Exam Results Services
export const examService = {
  // Sınav sonucu kaydet
  async saveExamResult(result: Omit<ExamResult, 'id'>): Promise<string> {
    console.log('saveExamResult called with:', result);
    try {
      const docRef = await addDoc(collection(db, 'examResults'), {
        ...result,
        examDate: Timestamp.fromDate(result.examDate)
      });
      console.log('Exam result saved successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error in saveExamResult:', error);
      throw error;
    }
  },

  // Kullanıcının sınav sonuçlarını getir
  async getUserExamResults(userId: string): Promise<ExamResult[]> {
    console.log('getUserExamResults called for userId:', userId);
    try {
      // Index gerektirmeyen basit query
      const resultsQuery = query(
        collection(db, 'examResults'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(resultsQuery);
      console.log('Found exam results:', snapshot.docs.length);
      
      // Client-side'da sıralama yap
      const results = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        examDate: doc.data().examDate.toDate()
      })) as ExamResult[];
      
      // Date'e göre sırala (en yeni önce)
      results.sort((a, b) => b.examDate.getTime() - a.examDate.getTime());
      
      console.log('Processed and sorted exam results:', results);
      return results;
    } catch (error) {
      console.error('Error in getUserExamResults:', error);
      throw error;
    }
  },

  // Tüm sınav sonuçlarını getir (admin için)
  async getAllExamResults(): Promise<ExamResult[]> {
    try {
      const resultsQuery = collection(db, 'examResults');
      const snapshot = await getDocs(resultsQuery);
      
      const results = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        examDate: doc.data().examDate.toDate()
      })) as ExamResult[];
      
      // Client-side'da sıralama yap
      results.sort((a, b) => b.examDate.getTime() - a.examDate.getTime());
      
      return results;
    } catch (error) {
      console.error('Error in getAllExamResults:', error);
      throw error;
    }
  },

  // Sınav sonucu sil
  async deleteExamResult(resultId: string): Promise<void> {
    await deleteDoc(doc(db, 'examResults', resultId));
  }
};

// Permission Services
export const permissionService = {
  // Kullanıcıya yetki ver
  async grantPermission(userId: string, permissionId: string, grantedBy: string): Promise<void> {
    const userPermission: UserPermission = {
      userId,
      permissionId,
      grantedBy,
      grantedAt: new Date(),
      isActive: true
    };
    
    await addDoc(collection(db, 'userPermissions'), userPermission);
    
    // Kullanıcının permissions array'ini güncelle
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data() as User;
      const updatedPermissions = [...userData.permissions, permissionId];
      await updateDoc(doc(db, 'users', userId), { permissions: updatedPermissions });
    }
  },

  // Kullanıcının yetkisini kaldır
  async revokePermission(userId: string, permissionId: string): Promise<void> {
    // UserPermissions koleksiyonundan kaldır
    const permissionsQuery = query(
      collection(db, 'userPermissions'),
      where('userId', '==', userId),
      where('permissionId', '==', permissionId)
    );
    const snapshot = await getDocs(permissionsQuery);
    snapshot.docs.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
    
    // Kullanıcının permissions array'ini güncelle
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data() as User;
      const updatedPermissions = userData.permissions.filter(p => p !== permissionId);
      await updateDoc(doc(db, 'users', userId), { permissions: updatedPermissions });
    }
  },

  // Kullanıcının yetkilerini kontrol et
  async checkUserPermission(userId: string, tool: string): Promise<boolean> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return false;
    }
    
    const userData = userDoc.data() as User;
    
    // Admin tüm yetkilere sahip
    if (userData.role === 'admin') {
      return true;
    }
    
          // Trial süresi kontrolü
      if (userData.trialEndsAt) {
        let trialEndsAt: Date;
        const trialData = userData.trialEndsAt;
        if (trialData instanceof Date) {
          trialEndsAt = trialData;
        } else if (trialData && typeof (trialData as any).toDate === 'function') {
          trialEndsAt = (trialData as any).toDate();
        } else {
          trialEndsAt = new Date(trialData as any);
        }
        if (trialEndsAt > new Date()) {
          return true; // Trial süresi aktif, tüm tool'lara erişim
        }
      }
    
    // Kullanıcının yetkilerini kontrol et
    const permissionsQuery = query(
      collection(db, 'userPermissions'),
      where('userId', '==', userId),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(permissionsQuery);
    
    for (const permissionDoc of snapshot.docs) {
      const permissionData = permissionDoc.data() as UserPermission;
      
      // ExpiresAt kontrolü
      if (permissionData.expiresAt) {
        let expiresAt: Date;
        const expData = permissionData.expiresAt;
        if (expData && typeof (expData as any).toDate === 'function') {
          expiresAt = (expData as any).toDate();
        } else {
          expiresAt = expData as Date;
        }
        if (expiresAt < new Date()) {
          continue; // Süresi dolmuş permission'ı atla
        }
      }
      
      const permission = await getDoc(doc(db, 'permissions', permissionData.permissionId));
      
      if (permission.exists()) {
        const permissionInfo = permission.data() as Permission;
        if (permissionInfo.tool === tool || permissionInfo.tool === 'all') {
          return true;
        }
      }
    }
    
    return false;
  },

  // Yeni yetki oluştur
  async createPermission(permission: Omit<Permission, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'permissions'), permission);
    return docRef.id;
  },

  // Yetki sil
  async deletePermission(permissionId: string): Promise<void> {
    await deleteDoc(doc(db, 'permissions', permissionId));
  },

  // Tüm yetkileri getir
  async getAllPermissions(): Promise<Permission[]> {
    const permissionsQuery = query(collection(db, 'permissions'));
    const snapshot = await getDocs(permissionsQuery);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Permission[];
  },

  // Temporarily grant permission for a specific duration
  async grantTemporaryPermission(userId: string, permissionId: string, grantedBy: string, expiresAt: Date): Promise<void> {
          const userPermission: Omit<UserPermission, 'expiresAt'> & { expiresAt: Timestamp } = {
        userId,
        permissionId,
        grantedBy,
        grantedAt: new Date(),
        isActive: true,
        expiresAt: Timestamp.fromDate(expiresAt)
      };
    await addDoc(collection(db, 'userPermissions'), userPermission);

    // Update user's permissions array
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const currentPermissions = userDoc.data().permissions || [];
      if (!currentPermissions.includes(permissionId)) {
        await updateDoc(userRef, {
          permissions: [...currentPermissions, permissionId]
        });
      }
    }
  },

  // Get user permissions from user document
  async getUserPermissions(userId: string): Promise<string[]> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return [];
    }
    
    const userData = userDoc.data() as User;
    return userData.permissions || [];
  }
};

// Subscription Services
export const subscriptionService = {
  // Create trial subscription for new user
  async createTrialSubscription(userId: string): Promise<void> {
    try {
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 7); // 1 week trial
      
      const subscription: Subscription = {
        id: `trial_${userId}`,
        userId,
        status: 'trial',
        planId: 'trial',
        planName: 'trial',
        startDate: new Date(),
        endDate: trialEndsAt,
        trialEndsAt,
        autoRenew: false,
        permissions: [],
        paymentHistory: []
      };
      
      // Save subscription
      await setDoc(doc(db, 'subscriptions', subscription.id), {
        ...subscription,
        startDate: Timestamp.fromDate(subscription.startDate),
        endDate: Timestamp.fromDate(subscription.endDate),
        trialEndsAt: subscription.trialEndsAt ? Timestamp.fromDate(subscription.trialEndsAt) : undefined
      });
      
      // Update user with trial end date
      await updateDoc(doc(db, 'users', userId), {
        trialEndsAt: Timestamp.fromDate(trialEndsAt)
      });
      
      // Grant all permissions for trial period
      const allPermissions = await permissionService.getAllPermissions();
      for (const permission of allPermissions) {
        await permissionService.grantTemporaryPermission(userId, permission.id, 'system', trialEndsAt);
      }
      
      console.log(`Trial subscription created for user ${userId}`);
    } catch (error) {
      console.error('Error creating trial subscription:', error);
      throw error;
    }
  },

  // Grant trial period by admin
  async grantTrialPeriod(userId: string, grantedBy: string, reason?: string): Promise<{ newEndDate: Date, daysAdded: number }> {
    try {
      console.log('🔍 Granting trial period to user:', userId);
      
      // Get current user data to check existing trial
      const userDoc = await getDoc(doc(db, 'users', userId));
      let currentTrialEnd: Date | null = null;
      let newTrialEnd: Date;
      const daysAdded = 7;
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Check if user has existing trial
        if (userData.trialEndsAt) {
          // Convert existing trial date
          if (userData.trialEndsAt instanceof Date) {
            currentTrialEnd = userData.trialEndsAt;
          } else if (typeof userData.trialEndsAt.toDate === 'function') {
            currentTrialEnd = userData.trialEndsAt.toDate();
          } else {
            currentTrialEnd = new Date(userData.trialEndsAt);
          }
          
          console.log('🔍 Current trial end date:', currentTrialEnd);
          
          // If trial is still active, extend it by 1 week
          if (currentTrialEnd && currentTrialEnd > new Date()) {
            newTrialEnd = new Date(currentTrialEnd);
            newTrialEnd.setDate(newTrialEnd.getDate() + 7);
            console.log('🔍 Extending existing trial by 7 days. New end date:', newTrialEnd);
          } else {
            // Trial expired, give new 1 week from now
            newTrialEnd = new Date();
            newTrialEnd.setDate(newTrialEnd.getDate() + 7);
            console.log('🔍 Trial expired, creating new 7-day trial from now:', newTrialEnd);
          }
        } else {
          // No existing trial, create new 1 week trial
          newTrialEnd = new Date();
          newTrialEnd.setDate(newTrialEnd.getDate() + 7);
          console.log('🔍 No existing trial, creating new 7-day trial:', newTrialEnd);
        }
      } else {
        // User not found, create new 1 week trial
        newTrialEnd = new Date();
        newTrialEnd.setDate(newTrialEnd.getDate() + 7);
        console.log('🔍 User not found, creating new 7-day trial:', newTrialEnd);
      }
      
      const trialPeriod: TrialPeriod = {
        id: `trial_${userId}_${Date.now()}`,
        userId,
        grantedBy,
        grantedAt: new Date(),
        startDate: new Date(),
        endDate: newTrialEnd,
        isActive: true,
        reason: reason || 'Admin tarafından verildi'
      };
      
      // Save trial period
      await setDoc(doc(db, 'trialPeriods', trialPeriod.id), {
        ...trialPeriod,
        grantedAt: Timestamp.fromDate(trialPeriod.grantedAt),
        startDate: Timestamp.fromDate(trialPeriod.startDate),
        endDate: Timestamp.fromDate(trialPeriod.endDate)
      });
      
      // Create or update subscription for trial
      const subscription: Subscription = {
        id: `trial_${userId}`,
        userId,
        status: 'trial',
        planId: 'trial',
        planName: 'trial',
        startDate: new Date(),
        endDate: newTrialEnd,
        trialEndsAt: newTrialEnd,
        autoRenew: false,
        permissions: [],
        paymentHistory: []
      };
      
      await setDoc(doc(db, 'subscriptions', subscription.id), {
        ...subscription,
        startDate: Timestamp.fromDate(subscription.startDate),
        endDate: Timestamp.fromDate(subscription.endDate),
        trialEndsAt: Timestamp.fromDate(subscription.trialEndsAt!)
      });
      
      // Update user with new trial end date
      await updateDoc(doc(db, 'users', userId), {
        trialEndsAt: Timestamp.fromDate(newTrialEnd)
      });
      
      // Grant all permissions for trial period
      const allPermissions = await permissionService.getAllPermissions();
      for (const permission of allPermissions) {
        await permissionService.grantTemporaryPermission(userId, permission.id, grantedBy, newTrialEnd);
      }
      
      console.log(`Trial period granted to user ${userId} by admin ${grantedBy}. New end date:`, newTrialEnd);
      
      return {
        newEndDate: newTrialEnd,
        daysAdded
      };
    } catch (error) {
      console.error('Error granting trial period:', error);
      throw error;
    }
  },

  // Get user subscription
  async getUserSubscription(userId: string): Promise<Subscription | null> {
    try {
      console.log('🔍 getUserSubscription called for userId:', userId);
      
      const subscriptionDoc = await getDoc(doc(db, 'subscriptions', `trial_${userId}`));
      console.log('🔍 Subscription document exists:', subscriptionDoc.exists());
      
      if (!subscriptionDoc.exists()) {
        console.log('🔍 No subscription document found, returning null');
        return null;
      }
      
      const subscriptionData = subscriptionDoc.data();
      console.log('🔍 Raw subscription data:', subscriptionData);
      
      const subscription = {
        ...subscriptionData,
        startDate: subscriptionData.startDate?.toDate() || new Date(),
        endDate: subscriptionData.endDate?.toDate() || new Date(),
        trialEndsAt: subscriptionData.trialEndsAt?.toDate(),
        lastPaymentDate: subscriptionData.lastPaymentDate?.toDate(),
        nextPaymentDate: subscriptionData.nextPaymentDate?.toDate()
      } as Subscription;
      
      console.log('🔍 Processed subscription:', subscription);
      return subscription;
    } catch (error) {
      console.error('🔍 Error getting user subscription:', error);
      return null;
    }
  },

  // Check if user has active subscription or trial
  async hasActiveAccess(userId: string): Promise<boolean> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        return false;
      }
      
      const userData = userDoc.data();
      
      // Check trial end date from user document
      if (userData.trialEndsAt) {
        let trialEndsAt: Date;
        if (userData.trialEndsAt instanceof Date) {
          trialEndsAt = userData.trialEndsAt;
        } else if (typeof userData.trialEndsAt.toDate === 'function') {
          trialEndsAt = userData.trialEndsAt.toDate();
        } else {
          trialEndsAt = new Date(userData.trialEndsAt);
        }
        
        if (trialEndsAt > new Date()) {
          return true; // Trial is still active
        }
      }
      
      // Also check trialPeriods collection
      const trialPeriodsQuery = query(
        collection(db, 'trialPeriods'),
        where('userId', '==', userId),
        where('isActive', '==', true)
      );
      const trialSnapshot = await getDocs(trialPeriodsQuery);
      
      for (const trialDoc of trialSnapshot.docs) {
        const trialData = trialDoc.data();
        if (trialData.endDate) {
          let endDate: Date;
          if (trialData.endDate instanceof Date) {
            endDate = trialData.endDate;
          } else if (typeof trialData.endDate.toDate === 'function') {
            endDate = trialData.endDate.toDate();
          } else {
            endDate = new Date(trialData.endDate);
          }
          
          if (endDate > new Date()) {
            return true; // Trial period is still active
          }
        }
      }
      
      // Check subscription
      const subscription = await this.getUserSubscription(userId);
      if (subscription && subscription.status === 'active') {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking user access:', error);
      return false;
    }
  },

  // Force update trial status for all users (admin function)
  async forceUpdateTrialStatus(): Promise<void> {
    try {
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      
      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        if (userData.trialEndsAt) {
          let trialEndsAt: Date;
          if (userData.trialEndsAt instanceof Date) {
            trialEndsAt = userData.trialEndsAt;
          } else if (typeof userData.trialEndsAt.toDate === 'function') {
            trialEndsAt = userData.trialEndsAt.toDate();
          } else {
            trialEndsAt = new Date(userData.trialEndsAt);
          }
          
          // If trial has expired, update user status
          if (trialEndsAt <= new Date()) {
            await updateDoc(doc(db, 'users', userDoc.id), {
              trialEndsAt: null
            });
            console.log(`Trial expired for user ${userDoc.id}`);
          }
        }
      }
    } catch (error) {
      console.error('Error updating trial status:', error);
      throw error;
    }
  }
};

// Support Services
export const supportService = {
  // Create a new support ticket
  async createTicket(ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'lastMessageAt' | 'isReadByAdmin' | 'isReadByUser'>): Promise<string> {
    try {
      const ticketData = {
        ...ticket,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
        lastMessageAt: Timestamp.fromDate(new Date()),
        // Ticket oluşturulduğunda admin'e bildirim gönder, user'a değil
        isReadByAdmin: false, // Admin'e bildirim
        isReadByUser: true    // User kendi ticket'ını görmüş sayılır
      };
      
      const docRef = await addDoc(collection(db, 'supportTickets'), ticketData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating support ticket:', error);
      throw new Error('Failed to create support ticket');
    }
  },

  // Get user's support tickets
  async getUserTickets(userId: string): Promise<SupportTicket[]> {
    try {
      // Index gerektirmeyen basit query
      const q = query(
        collection(db, 'supportTickets'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      
      // Client-side'da sıralama yap
      const tickets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        lastMessageAt: doc.data().lastMessageAt?.toDate() || new Date()
      })) as SupportTicket[];
      
      // lastMessageAt'a göre sırala (en yeni önce)
      tickets.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
      
      return tickets;
    } catch (error) {
      console.error('Error getting user tickets:', error);
      return [];
    }
  },

  // Get all support tickets (admin)
  async getAllTickets(): Promise<SupportTicket[]> {
    try {
      // Index gerektirmeyen basit query
      const snapshot = await getDocs(collection(db, 'supportTickets'));
      
      // Client-side'da sıralama yap
      const tickets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        lastMessageAt: doc.data().lastMessageAt?.toDate() || new Date()
      })) as SupportTicket[];
      
      // lastMessageAt'a göre sırala (en yeni önce)
      tickets.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
      
      return tickets;
    } catch (error) {
      console.error('Error getting all tickets:', error);
      return [];
    }
  },

  // Get ticket messages
  async getTicketMessages(ticketId: string): Promise<SupportMessage[]> {
    try {
      // Index gerektirmeyen basit query
      const q = query(
        collection(db, 'supportMessages'),
        where('ticketId', '==', ticketId)
      );
      const snapshot = await getDocs(q);
      
      // Client-side'da sıralama yap
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as SupportMessage[];
      
      // createdAt'a göre sırala (eski önce)
      messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      
      return messages;
    } catch (error) {
      console.error('Error getting ticket messages:', error);
      return [];
    }
  },

  // Send a message
  async sendMessage(message: Omit<SupportMessage, 'id' | 'createdAt'>): Promise<string> {
    try {
      const messageData = {
        ...message,
        createdAt: Timestamp.fromDate(new Date())
      };
      
      const docRef = await addDoc(collection(db, 'supportMessages'), messageData);
      
      // Update ticket's lastMessageAt and read status
      const ticketRef = doc(db, 'supportTickets', message.ticketId);
      const updateData: { 
        lastMessageAt: Timestamp;
        updatedAt: Timestamp;
        isReadByUser?: boolean;
        isReadByAdmin?: boolean;
      } = {
        lastMessageAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      };

      // Sadece admin mesaj attığında user'a bildirim gönder
      if (message.senderType === 'admin') {
        updateData.isReadByUser = false; // User'a bildirim göster
        updateData.isReadByAdmin = true; // Admin kendi mesajını gördü
      } else {
        // User mesaj attığında admin'e bildirim gönder
        updateData.isReadByAdmin = false; // Admin'e bildirim göster
        // isReadByUser'ı değiştirme - user kendi mesajını görmüş sayılır
      }

      await updateDoc(ticketRef, updateData);
      
      return docRef.id;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message');
    }
  },

  // Update ticket status (admin)
  async updateTicketStatus(ticketId: string, status: SupportTicket['status']): Promise<void> {
    try {
      const ticketRef = doc(db, 'supportTickets', ticketId);
      await updateDoc(ticketRef, {
        status,
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error updating ticket status:', error);
      throw new Error('Failed to update ticket status');
    }
  },

  // Mark ticket as read
  async markTicketAsRead(ticketId: string, isAdmin: boolean): Promise<void> {
    try {
      const ticketRef = doc(db, 'supportTickets', ticketId);
      if (isAdmin) {
        await updateDoc(ticketRef, { isReadByAdmin: true });
      } else {
        await updateDoc(ticketRef, { isReadByUser: true });
      }
    } catch (error) {
      console.error('Error marking ticket as read:', error);
    }
  }
}; 