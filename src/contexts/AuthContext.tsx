'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { User } from '@/types/user';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearAuth, fetchUserProfile } from '@/store/slices/authSlice';
import { fetchUserPermissions } from '@/store/slices/permissionsSlice';


interface AuthContextType {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  permissions: string[];
  permissionsLoading: boolean;
  refreshUser: () => Promise<void>;
  hasPermission: (tool: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user: currentUser, loading: authLoading } = useAppSelector((state: any) => state.auth);
  const { userPermissions, loading: permissionsLoading } = useAppSelector((state: any) => state.permissions);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPermissions = useCallback(async (userId: string) => {
    try {
      console.log('🔍 Loading permissions for user:', userId);
      dispatch(fetchUserPermissions(userId));
      console.log('🔍 Dispatched fetchUserPermissions');
    } catch (error) {
      console.error('Error loading permissions:', error);
    }
  }, [dispatch]);

  const refreshUser = useCallback(async () => {
    if (firebaseUser) {
      try {
        await dispatch(fetchUserProfile(firebaseUser.uid));
        // Yetkileri de yenile
        await loadPermissions(firebaseUser.uid);
      } catch (error) {
        console.error('Error refreshing user:', error);
      }
    }
  }, [firebaseUser, dispatch, loadPermissions]);

  const hasPermission = useCallback((tool: string): boolean => {
    console.log('🔍 hasPermission called for tool:', tool);
    console.log('🔍 Current user:', currentUser);
    console.log('🔍 User permissions:', userPermissions);
    
    if (!currentUser) {
      console.log('🔍 No current user, permission denied');
      return false;
    }
    
    // Admin her zaman erişebilir
    if (currentUser.role === 'admin') {
      console.log('🔍 Admin user, permission granted');
      return true;
    }
    
    // Explicit permission varsa kontrol et
    const hasExplicitPermission = userPermissions.some((up: any) => up.permissionId === tool && up.isActive);
    if (hasExplicitPermission) {
      console.log('🔍 Explicit permission found, access granted');
      return true;
    }
    
    // Trial süresi kontrolü
    if (currentUser.trialEndsAt) {
      const now = new Date();
      
      // Timestamp'ı Date'e dönüştür
      let trialEnd: Date;
      if (currentUser.trialEndsAt instanceof Date) {
        trialEnd = currentUser.trialEndsAt;
      } else if (typeof currentUser.trialEndsAt.toDate === 'function') {
        trialEnd = currentUser.trialEndsAt.toDate();
      } else {
        trialEnd = new Date(currentUser.trialEndsAt);
      }
      
      const isTrialActive = now < trialEnd;
      console.log('🔍 Trial check - now:', now, 'trialEnd:', trialEnd, 'isActive:', isTrialActive);
      
      if (isTrialActive) {
        console.log('🔍 Trial is active, permission granted');
        return true;
      }
    }
    
    // Subscription kontrolü
    if (currentUser.subscription?.status === 'premium') {
      console.log('🔍 Premium subscription found, permission granted');
      return true;
    }
    
    if (currentUser.subscription?.status === 'trial' && currentUser.subscription.trialEndsAt) {
      const now = new Date();
      const trialEnd = currentUser.subscription.trialEndsAt;
      const isTrialActive = now < trialEnd;
      console.log('🔍 Subscription trial check - trialEndsAt:', trialEnd, 'isActive:', isTrialActive);
      
      if (isTrialActive) {
        console.log('🔍 Subscription trial is active, permission granted');
        return true;
      }
    }
    
    console.log('🔍 No permission found, access denied');
    return false;
  }, [currentUser, userPermissions]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      
      if (user) {
        try {
          await dispatch(fetchUserProfile(user.uid));
          // Yetkileri yükle
          await loadPermissions(user.uid);
        } catch (error) {
          console.error('Error fetching user data:', error);
          dispatch(clearAuth());
        }
      } else {
        dispatch(clearAuth());
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [dispatch, loadPermissions]);

  const value = {
    currentUser,
    firebaseUser,
    loading: loading || authLoading,
    permissions: userPermissions.map((up: any) => up.permissionId),
    permissionsLoading,
    refreshUser,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 