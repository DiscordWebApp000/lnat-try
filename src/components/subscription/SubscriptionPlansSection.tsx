'use client';

import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchSubscriptionPlans } from '@/store/slices/subscriptionPlansSlice';
import { useEffect } from 'react';
import { Crown, Star, Zap, Shield, CheckCircle, AlertCircle } from 'lucide-react';

interface SubscriptionPlansSectionProps {
  onPlanSelect: (plan: any) => void;
  className?: string;
}

export default function SubscriptionPlansSection({ onPlanSelect, className = '' }: SubscriptionPlansSectionProps) {
  const dispatch = useAppDispatch();
  const { plans, loading, error } = useAppSelector((state: any) => state.subscriptionPlans);

  useEffect(() => {
    dispatch(fetchSubscriptionPlans());
  }, [dispatch]);

  const getPlanIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Zap className="w-6 h-6" />;
      case 1:
        return <Star className="w-6 h-6" />;
      case 2:
        return <Crown className="w-6 h-6" />;
      default:
        return <Crown className="w-6 h-6" />;
    }
  };

  const getPlanGradient = (index: number) => {
    switch (index) {
      case 0:
        return 'from-blue-500 to-blue-600';
      case 1:
        return 'from-purple-500 to-pink-500';
      case 2:
        return 'from-orange-500 to-red-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getPlanBadge = (index: number) => {
    switch (index) {
      case 0:
        return { text: 'Başlangıç', color: 'bg-blue-100 text-blue-800' };
      case 1:
        return { text: 'Popüler', color: 'bg-purple-100 text-purple-800' };
      case 2:
        return { text: 'Premium', color: 'bg-orange-100 text-orange-800' };
      default:
        return { text: 'Standart', color: 'bg-gray-100 text-gray-800' };
    }
  };

  if (loading) {
    return (
      <div className={`mb-8 ${className}`}>
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Planlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`mb-8 ${className}`}>
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Planlar Yüklenemedi</h3>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className={`mb-8 ${className}`}>
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Henüz abonelik planı bulunmuyor</h3>
          <p className="text-gray-500">Lütfen daha sonra tekrar kontrol edin</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`mb-8 ${className}`}>
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Abonelik Planları</h3>
        <p className="text-gray-600">İhtiyacınıza uygun planı seçin ve premium özelliklerin keyfini çıkarın</p>
      </div>
      
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {plans.map((plan: any, index: number) => {
          const badge = getPlanBadge(index);
          const isPopular = index === 1;
          
          return (
            <div 
              key={plan.id} 
              className={`relative bg-white rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                isPopular ? 'ring-2 ring-purple-500 scale-105' : ''
              }`}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    ⭐ En Popüler
                  </div>
                </div>
              )}
              
              {/* Plan Header */}
              <div className={`p-6 rounded-t-2xl bg-gradient-to-r ${getPlanGradient(index)} text-white`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getPlanIcon(index)}
                    <h4 className="text-xl font-bold">{plan.displayName || plan.name}</h4>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${badge.color} bg-white`}>
                    {badge.text}
                  </span>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">
                    {plan.price} {plan.currency}
                  </div>
                  <div className="text-lg opacity-90">{plan.duration} gün</div>
                </div>
              </div>
              
              {/* Plan Content */}
              <div className="p-6">
                {plan.description && (
                  <p className="text-gray-600 mb-6 text-center text-sm leading-relaxed">
                    {plan.description}
                  </p>
                )}

                {/* Features */}
                {plan.features && plan.features.length > 0 && (
                  <div className="mb-6">
                    <h5 className="font-semibold text-gray-900 mb-3">Özellikler</h5>
                    <ul className="space-y-2">
                      {plan.features.map((feature: string, featureIndex: number) => (
                        <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Permissions */}
                {plan.permissions && plan.permissions.length > 0 && (
                  <div className="mb-6">
                    <h5 className="font-semibold text-gray-900 mb-3">Erişim</h5>
                    <div className="flex flex-wrap gap-2">
                      {plan.permissions.map((permId: string) => {
                        const permName = permId === 'question-generator' ? 'Soru Üretici' :
                                       permId === 'writing-evaluator' ? 'Yazı Değerlendirici' :
                                       permId === 'text-question-analysis' ? 'Metin Analizi' : permId;
                        return (
                          <span key={permId} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Shield className="w-3 h-3 mr-1" />
                            {permName}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Select Button */}
                <button
                  onClick={() => onPlanSelect(plan)}
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                    isPopular 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl' 
                      : `bg-gradient-to-r ${getPlanGradient(index)} hover:opacity-90 text-white`
                  }`}
                >
                  {isPopular ? '⭐ Bu Planı Seç' : 'Planı Seç'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
