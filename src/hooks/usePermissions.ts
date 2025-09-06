'use client';

import { useAuth } from '@/contexts/AuthContext';

export const usePermissions = () => {
  const {  permissions, permissionsLoading, hasPermission } = useAuth();

  return { 
    permissions, 
    hasPermission, 
    loading: permissionsLoading 
  };
};