'use client';

import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppSelector } from '@/store/hooks';
import Link from 'next/link';
import { Lock, Crown, Clock } from 'lucide-react';

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
  const { currentUser } = useAuth();
  const { subscription } = useAppSelector((state: any) => state.subscription);
  
  const canAccess = useMemo(() => {
    console.log('🔍 ToolAccessGuard - Checking access for tool:', toolName);
    console.log('🔍 Current user:', currentUser);
    console.log('🔍 Subscription:', subscription);
    
    if (!currentUser) {
      console.log('🔍 No current user, access denied');
      return false;
    }
    
    // Premium subscription varsa erişim ver
    if (subscription?.status === 'premium') {
      console.log('🔍 Premium subscription found, access granted');
      return true;
    }
    
    // Trial subscription varsa kontrol et
    if (subscription?.status === 'trial' && subscription.trialEndsAt) {
      const now = new Date();
      const trialEnd = subscription.trialEndsAt;
      const isTrialActive = now < trialEnd;
      console.log('🔍 Trial subscription found, trialEndsAt:', trialEnd, 'isActive:', isTrialActive);
      return isTrialActive;
    }
    
    // Subscription yoksa user document'dan trial süresini kontrol et
    if (currentUser.trialEndsAt) {
      const now = new Date();
      const trialEnd = currentUser.trialEndsAt;
      const isTrialActive = now < trialEnd;
      console.log('🔍 User trial found, trialEndsAt:', trialEnd, 'isActive:', isTrialActive);
      return isTrialActive;
    }
    
    console.log('🔍 No active subscription or trial found, access denied');
    return false;
  }, [currentUser, subscription, toolName]);

  const getTrialDaysLeft = () => {
    if (!subscription?.trialEndsAt) return 0;
    
    const now = new Date();
    const trialEnd = subscription.trialEndsAt;
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };
  
  if (!canAccess) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="mb-6">
            {subscription?.status === 'trial' ? (
              <Clock className="mx-auto h-16 w-16 text-orange-500 mb-4" />
            ) : (
              <Lock className="mx-auto h-16 w-16 text-red-500 mb-4" />
            )}
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {subscription?.status === 'trial' ? 'Trial Süresi Doldu' : 'Tool Erişimi Gerekli'}
          </h3>
          
          {subscription?.status === 'trial' ? (
            <div className="mb-6">
              <p className="text-gray-600 mb-2">
                Trial süreniz sona erdi. Bu tool&apos;u kullanmaya devam etmek için premium aboneliğe geçmeniz gerekiyor.
              </p>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm text-orange-800">
                  Trial süresi: {getTrialDaysLeft()} gün kaldı
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 mb-6">
              Bu tool&apos;u kullanmak için premium aboneliğe geçmeniz gerekiyor.
            </p>
          )}
          
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
