'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchUserSubscription } from '@/store/slices/subscriptionSlice';
import { fetchSubscriptionPlans } from '@/store/slices/subscriptionPlansSlice';
import Navbar from '@/components/ui/Navbar';
import SubscriptionStatus from '@/components/subscription/SubscriptionStatus';
import SubscriptionPlansGrid from '@/components/subscription/SubscriptionPlansGrid';
import PaymentModal from '@/components/payment/PaymentModal';
import { AlertCircle } from 'lucide-react';

export default function SubscriptionPage() {
  const { currentUser } = useAuth();
  const dispatch = useAppDispatch();
  const { loading: subscriptionLoading } = useAppSelector((state: any) => state.subscription);
  const { plans: subscriptionPlans, loading: plansLoading, error: plansError } = useAppSelector((state: any) => state.subscriptionPlans);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const loadSubscriptionData = useCallback(async () => {
    if (currentUser) {
      dispatch(fetchUserSubscription(currentUser.uid));
      dispatch(fetchSubscriptionPlans());
    }
  }, [currentUser, dispatch]);

  useEffect(() => {
    if (currentUser) {
      loadSubscriptionData();
    }
  }, [currentUser, loadSubscriptionData]);

  const handlePlanSelect = (plan: any) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
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

  if (subscriptionLoading || plansLoading) {
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Your Subscription Status
          </h1>
          <p className="text-lg text-gray-600">
            Track your access to premium features and trial period
          </p>
        </div>

        {/* Error Messages */}
        {plansError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-800">Error loading subscription plans: {plansError}</p>
            </div>
          </div>
        )}

        {/* Subscription Status Component */}
        <SubscriptionStatus className="mb-8" />

        {/* Firebase Subscription Packages - Detailed View */}
        <SubscriptionPlansGrid plans={subscriptionPlans} onPlanSelect={handlePlanSelect} className="mb-8" />

      </div>

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)} 
        selectedPlan={selectedPlan} 
      />
    </div>
  );
}