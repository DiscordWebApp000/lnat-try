'use client';

import { useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { Clock, Crown, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface SubscriptionStatusProps {
  className?: string;
}

export default function SubscriptionStatus({ className = '' }: SubscriptionStatusProps) {
  const { subscription, loading } = useAppSelector((state: any) => state.subscription);
  const [timeRemaining, setTimeRemaining] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({ 
    days: 0, 
    hours: 0, 
    minutes: 0, 
    seconds: 0 
  });

  // Countdown timer effect
  useEffect(() => {
    if (!subscription?.trialEndsAt) return;

    const timer = setInterval(() => {
      const now = new Date();
      let trialEnd: Date;
      
      if (subscription.trialEndsAt instanceof Date) {
        trialEnd = subscription.trialEndsAt;
      } else if (subscription.trialEndsAt) {
        trialEnd = new Date(subscription.trialEndsAt);
      } else {
        trialEnd = new Date();
      }
      
      if (isNaN(trialEnd.getTime())) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
        return;
      }
      
      const diffTime = trialEnd.getTime() - now.getTime();
      
      if (diffTime <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
        return;
      }
      
      const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffTime % (1000 * 60)) / 1000);
      
      setTimeRemaining({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [subscription?.trialEndsAt]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'trial':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'expired':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'trial':
        return 'Trial Period';
      case 'active':
        return 'Active';
      case 'expired':
        return 'Expired';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscription status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Your Subscription Status</h2>
        <div className="flex items-center gap-2">
          {getStatusIcon(subscription?.status || 'unknown')}
          <span className="text-lg font-semibold text-gray-700">
            {getStatusText(subscription?.status || 'unknown')}
          </span>
        </div>
      </div>

      {/* Kullanıcının Mevcut Aboneliği */}
      {subscription && (
        <div className="mb-8">
          <div className={`rounded-2xl p-6 border-2 ${
            subscription.status === 'active' 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
              : subscription.status === 'trial'
              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
              : 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-full ${
                subscription.status === 'active' 
                  ? 'bg-green-500' 
                  : subscription.status === 'trial'
                  ? 'bg-blue-500'
                  : 'bg-gray-500'
              }`}>
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {subscription.planName === 'trial' ? 'Deneme Planı' : subscription.planName || 'Premium Plan'}
                </h3>
                <p className="text-sm text-gray-600">
                  {subscription.status === 'active' 
                    ? 'Aktif aboneliğiniz bulunuyor' 
                    : subscription.status === 'trial'
                    ? 'Deneme süreniz devam ediyor'
                    : 'Aboneliğiniz bulunmuyor'
                  }
                </p>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${
                  subscription.status === 'active' 
                    ? 'text-green-600' 
                    : subscription.status === 'trial'
                    ? 'text-blue-600'
                    : 'text-gray-600'
                }`}>
                  {subscription.status === 'trial' ? 'Ücretsiz' : 'Premium'}
                </div>
                <div className="text-sm text-gray-500">
                  {subscription.status === 'trial' ? '7 Gün' : 'Aktif'}
                </div>
              </div>
            </div>

            {/* Abonelik Detayları */}
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Start Date:</span>
                  <span className="font-medium text-gray-700">{formatDate(subscription.startDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">End Date:</span>
                  <span className="font-medium text-gray-700">{formatDate(subscription.endDate)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Auto Renew:</span>
                  <span className={`font-medium ${subscription.autoRenew ? 'text-green-600' : 'text-gray-600'}`}>
                    {subscription.autoRenew ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan ID:</span>
                  <span className="font-mono text-xs text-gray-700">{subscription.planId}</span>
                </div>
              </div>
            </div>

            {/* Trial Countdown - Sadece trial durumunda göster */}
            {subscription.status === 'trial' && subscription.trialEndsAt && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <div className="text-center mb-3">
                  <h4 className="text-sm font-medium text-blue-900">Remaining Time</h4>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center">
                    <div className="bg-blue-100 rounded-lg p-2">
                      <div className="text-lg font-bold text-blue-600">{timeRemaining.days}</div>
                      <div className="text-xs text-blue-700">Day</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-blue-100 rounded-lg p-2">
                      <div className="text-lg font-bold text-blue-600">{timeRemaining.hours.toString().padStart(2, '0')}</div>
                      <div className="text-xs text-blue-700">Hour</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-blue-100 rounded-lg p-2">
                      <div className="text-lg font-bold text-blue-600">{timeRemaining.minutes.toString().padStart(2, '0')}</div>
                      <div className="text-xs text-blue-700">Minute</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-blue-100 rounded-lg p-2">
                      <div className="text-lg font-bold text-blue-600">{timeRemaining.seconds.toString().padStart(2, '0')}</div>
                      <div className="text-xs text-blue-700">Second</div>
                    </div>
                  </div>
                </div>
                <div className="text-center mt-2 text-xs text-blue-600">
                  End: {formatDate(subscription.trialEndsAt)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active subscription message */}
      {subscription?.status === 'active' && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Active Subscription</h3>
          <p className="text-green-700">
            You have an active subscription. Enjoy the premium features!
          </p>
        </div>
      )}
    </div>
  );
}
