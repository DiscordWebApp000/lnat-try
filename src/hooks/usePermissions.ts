'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { permissionService } from '@/lib/firebase-services';

export const usePermissions = () => {
  const { currentUser } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPermissions = async () => {
      if (!currentUser) {
        setPermissions([]);
        setLoading(false);
        return;
      }

      try {
        const userPermissions = [];
        const tools = ['text-question-analysis', 'question-generator', 'writing-evaluator'];
        
        for (const tool of tools) {
          const hasPermission = await permissionService.checkUserPermission(currentUser.uid, tool);
          if (hasPermission) {
            userPermissions.push(tool);
          }
        }
        
        setPermissions(userPermissions);
      } catch (error) {
        console.error('Error checking permissions:', error);
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    checkPermissions();
  }, [currentUser]);

  const hasPermission = (tool: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    return permissions.includes(tool);
  };

  return { permissions, hasPermission, loading };
};