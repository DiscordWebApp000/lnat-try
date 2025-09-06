'use client';

import {  useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Lock, Crown } from 'lucide-react';

interface ToolAccessGuardProps {
  children: React.ReactNode;
  toolName: string;
  fallback?: React.ReactNode;
}

export const ToolAccessGuard: React.FC<ToolAccessGuardProps> = ({ 
  children, 
  toolName, 
  fallback 
}) => {
  const { currentUser, hasPermission } = useAuth();
  
  const [canAccess, setCanAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPermission = async () => {
      console.log('🔍 ToolAccessGuard - Checking access for tool:', toolName);
      console.log('🔍 Current user:', currentUser);
      
      if (!currentUser) {
        console.log('🔍 No current user, access denied');
        setCanAccess(false);
        setLoading(false);
        return;
      }
      
      try {
        // Use AuthContext's hasPermission function which handles all permission logic
        const hasAccess = await hasPermission(toolName);
        console.log('🔍 Has permission for', toolName, ':', hasAccess);
        setCanAccess(hasAccess);
      } catch (error) {
        console.error('Error checking permission:', error);
        setCanAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkPermission();
  }, [currentUser, hasPermission, toolName]);

  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!canAccess) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="mb-6">
            <Lock className="mx-auto h-16 w-16 text-red-500 mb-4" />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Tool Erişimi Gerekli
          </h3>
          
          <p className="text-gray-600 mb-6">
            Bu tool&apos;u kullanmak için premium aboneliğe geçmeniz gerekiyor.
          </p>
          
          <div className="space-y-3">
            <Link 
              href="/subscription" 
              className="inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              <Crown className="h-5 w-5 mr-2" />
              Premium&apos;a Geç
            </Link>
            
            <Link 
              href="/dashboard" 
              className="inline-flex items-center justify-center w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Dashboard&apos;a Dön
            </Link>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Premium Avantajları:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Tüm AI tool&apos;larına sınırsız erişim</li>
              <li>• Sınırsız analiz ve değerlendirme</li>
              <li>• Öncelikli teknik destek</li>
              <li>• 7/24 erişim</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};
