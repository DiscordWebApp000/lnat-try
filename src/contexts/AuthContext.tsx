'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { User } from '@/types/user';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearAuth, fetchUserProfile } from '@/store/slices/authSlice';
import { fetchUserPermissions } from '@/store/slices/permissionsSlice';
import { permissionManager } from '@/lib/permission-manager';


interface AuthContextType {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  permissions: string[];
  permissionsLoading: boolean;
  refreshUser: () => Promise<void>;
  hasPermission: (tool: string) => Promise<boolean>;
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
      dispatch(fetchUserPermissions(userId));
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

  const hasPermission = useCallback(async (tool: string): Promise<boolean> => {
    if (!currentUser) {
      return false;
    }
    
    try {
      return await permissionManager.hasPermissionForTool(currentUser, tool);
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }, [currentUser]);

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
    permissions: userPermissions, // userPermissions artık string array'i
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