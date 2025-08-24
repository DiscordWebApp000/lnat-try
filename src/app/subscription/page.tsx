'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchUserSubscription } from '@/store/slices/subscriptionSlice';
import Navbar from '@/components/Navbar';
import { Calendar, Clock, CreditCard, Crown, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import PaymentForm from '@/components/PaymentForm';

export default function SubscriptionPage() {
  const { currentUser } = useAuth();
  const dispatch = useAppDispatch();
  const { subscription, loading } = useAppSelector((state: any) => state.subscription);
  const [trialDaysLeft, setTrialDaysLeft] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [subscriptionPlans, setSubscriptionPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSubscription = useCallback(async () => {
    if (currentUser) {
      dispatch(fetchUserSubscription(currentUser.uid));
    }
  }, [currentUser, dispatch]);

  const loadSubscriptionPlans = useCallback(async () => {
    try {
      setLoadingPlans(true);
      console.log('🔍 Loading subscription plans...');
      
      const response = await fetch('/api/subscription/plans');
      console.log('🔍 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Plans data:', data);
        setSubscriptionPlans(data.plans || []);
      } else {
        const errorData = await response.json();
        console.error('❌ Plans fetch error:', errorData);
        setError(`Abonelik planları getirilemedi: ${errorData.error || 'Bilinmeyen hata'}`);
      }
    } catch (error) {
      console.error('❌ Plans fetch error:', error);
      setError('Bağlantı hatası: Abonelik planları yüklenemedi');
    } finally {
      setLoadingPlans(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadSubscription();
      loadSubscriptionPlans();
    }
  }, [currentUser, loadSubscription, loadSubscriptionPlans]);

  // Calculate trial days left when subscription changes
  useEffect(() => {
    if (subscription?.trialEndsAt) {
      const now = new Date();
      let trialEnd: Date;
      
      if (subscription.trialEndsAt instanceof Date) {
        trialEnd = subscription.trialEndsAt;
      } else {
        trialEnd = new Date(subscription.trialEndsAt);
      }
      
      if (!isNaN(trialEnd.getTime())) {
        const diffTime = trialEnd.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setTrialDaysLeft(Math.max(0, diffDays));
      } else {
        setTrialDaysLeft(0);
      }
    }
  }, [subscription]);

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

  useEffect(() => {
    if (currentUser) {
      loadSubscription();
    }
  }, [currentUser, loadSubscription]);

  const getTimeRemaining = (endDate: Date | undefined) => {
    if (!endDate || isNaN(endDate.getTime())) {
      return { days: 0, hours: 0, minutes: 0, expired: true };
    }
    
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    
    if (diffTime <= 0) {
      return { days: 0, hours: 0, minutes: 0, expired: true };
    }
    
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days, hours, minutes, expired: false };
  };

  const formatTimeRemaining = (endDate: Date | undefined) => {
    if (!endDate) {
      return 'No time information';
    }
    
    const time = getTimeRemaining(endDate);
    
    if (time.expired) {
      return 'Expired';
    }
    
    if (time.days > 0) {
      return `${time.days} days ${time.hours} hours`;
    } else if (time.hours > 0) {
      return `${time.hours} hours ${time.minutes} minutes`;
    } else if (time.minutes > 0) {
      return `${time.minutes} minutes`;
    } else {
      return 'Less than 1 minute';
    }
  };

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

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h1>
          <p className="text-gray-600">Please log in to view your subscription information.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar 
        title="Subscription Management"
        description="View your subscription status"
        showBackButton={true}
        backUrl="/dashboard"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Your Subscription Status
          </h1>
          <p className="text-lg text-gray-600">
            Track your access to premium features and trial period
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Current Status Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Current Status</h2>
            <div className="flex items-center gap-2">
              {getStatusIcon(subscription?.status || 'unknown')}
              <span className="text-lg font-semibold text-gray-700">
                {getStatusText(subscription?.status || 'unknown')}
              </span>
            </div>
          </div>

          {/* Sadece aboneliği olmayan kullanıcılara planları göster */}
          {!subscription?.status || subscription.status === 'expired' ? (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mevcut Abonelik Planları</h3>
              {loadingPlans ? (
                <div className="text-center py-4">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Planlar yükleniyor...</p>
                </div>
              ) : subscriptionPlans.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subscriptionPlans.map((plan) => (
                    <div key={plan.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">{plan.displayName}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          plan.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {plan.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <div className="text-2xl font-bold text-blue-600">
                          {plan.price} {plan.currency}
                        </div>
                        <div className="text-sm text-gray-600">{plan.duration} gün</div>
                      </div>

                      {plan.description && (
                        <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
                      )}

                      {plan.permissions && plan.permissions.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-1">Erişim:</p>
                          <div className="flex flex-wrap gap-1">
                            {plan.permissions.map((permId: string) => {
                              const permName = permId === 'question-generator' ? 'Soru Üretici' :
                                             permId === 'writing-evaluator' ? 'Yazı Değerlendirici' :
                                             permId === 'text-question-analysis' ? 'Metin Analizi' : permId;
                              return (
                                <span key={permId} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                  {permName}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {plan.features && plan.features.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Özellikler:</p>
                          <div className="flex flex-wrap gap-1">
                            {plan.features.map((feature: string, index: number) => (
                              <span key={index} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Henüz abonelik planı bulunmuyor
                </div>
              )}
            </div>
          ) : (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Aktif Aboneliğiniz Var</h3>
              <p className="text-green-700">
                Şu anda aktif bir aboneliğiniz bulunuyor. Premium özelliklerin keyfini çıkarın!
              </p>
            </div>
          )}

          {subscription?.status === 'trial' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-900">Trial Period Active</h3>
                  <p className="text-blue-700">
                    {subscription.trialEndsAt ? formatTimeRemaining(subscription.trialEndsAt) : 'No time information'}
                  </p>
                  {subscription.trialEndsAt && (
                    <p className="text-blue-600 text-sm mt-1">
                      Ends: {formatDate(subscription.trialEndsAt)}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Countdown Timer */}
              {subscription.trialEndsAt && (
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-900 mb-3 text-center">Time Remaining</h4>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="text-center">
                      <div className="bg-blue-100 rounded-lg p-2">
                        <div className="text-xl font-bold text-blue-600">{timeRemaining.days}</div>
                        <div className="text-xs text-blue-700">Days</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="bg-blue-100 rounded-lg p-2">
                        <div className="text-xl font-bold text-blue-600">{timeRemaining.hours.toString().padStart(2, '0')}</div>
                        <div className="text-xs text-blue-700">Hours</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="bg-blue-100 rounded-lg p-2">
                        <div className="text-xl font-bold text-blue-600">{timeRemaining.minutes.toString().padStart(2, '0')}</div>
                        <div className="text-xs text-blue-700">Minutes</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="bg-blue-100 rounded-lg p-2">
                        <div className="text-xl font-bold text-blue-600">{timeRemaining.seconds.toString().padStart(2, '0')}</div>
                        <div className="text-xs text-blue-700">Seconds</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Start Date</p>
                  <p className="font-medium text-gray-900">
                    {subscription ? formatDate(subscription.startDate) : 'Unknown'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">End Date</p>
                  <p className="font-medium text-gray-900">
                    {subscription ? formatDate(subscription.endDate) : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Plan</p>
                  <p className="font-medium text-gray-900">
                    {subscription?.plan === 'free' ? 'Free Trial' : subscription?.plan || 'Unknown'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Auto Renewal</p>
                  <p className="font-medium text-gray-900">
                    {subscription?.autoRenew ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Premium Features</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Crown className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Question Generator</h3>
              <p className="text-sm text-gray-600">
                Automatic question generation from texts
              </p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Crown className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Text Analysis</h3>
              <p className="text-sm text-gray-600">
                Text and question analysis
              </p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Crown className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Writing Evaluator</h3>
              <p className="text-sm text-gray-600">
                Writing evaluation and feedback
              </p>
            </div>
          </div>
        </div>

        {/* Upgrade Card */}
        {subscription?.status === 'trial' && trialDaysLeft <= 3 && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Upgrade to Premium</h2>
            <p className="text-lg mb-6 opacity-90">
              Your trial period is ending soon. Subscribe for unlimited access to premium features.
            </p>
            <button 
              onClick={() => document.getElementById('payment-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Go Premium
            </button>
          </div>
        )}

        {/* Payment Form Section */}
        <div id="payment-section" className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Premium Abonelik</h2>
          <PaymentForm />
        </div>

        {/* Info Card */}
        <div className="bg-gray-50 rounded-2xl p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Information</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• New users get a 1-week free trial period</li>
            <li>• During the trial period, you can access all premium features</li>
            <li>• You need to upgrade to a premium plan after the trial period ends</li>
            <li>• Additional trial time can be granted by an admin</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
