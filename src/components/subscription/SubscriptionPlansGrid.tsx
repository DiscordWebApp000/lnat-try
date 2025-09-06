'use client';

import React from 'react';
import { Crown, CheckCircle, Shield, Star } from 'lucide-react';

interface SubscriptionPlansGridProps {
  plans: any[];
  onPlanSelect: (plan: any) => void;
  className?: string;
  id?: string;
}

const SubscriptionPlansGrid: React.FC<SubscriptionPlansGridProps> = ({ 
  plans, 
  onPlanSelect, 
  className = '',
  id
}) => {
  const getPlanGradient = (index: number) => {
    const gradients = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600', 
      'from-green-500 to-green-600',
      'from-orange-500 to-orange-600'
    ];
    return gradients[index % gradients.length];
  };

  const getPlanBadge = (index: number) => {
    const badges = [
      { text: 'Temel', color: 'text-blue-600' },
      { text: 'Popüler', color: 'text-purple-600' },
      { text: 'Gelişmiş', color: 'text-green-600' },
      { text: 'Premium', color: 'text-orange-600' }
    ];
    return badges[index % badges.length];
  };

  const getPlanIcon = (index: number) => {
    const icons = [
      <Crown key="crown-1" className="w-6 h-6" />,
      <Star key="star-1" className="w-6 h-6" />,
      <Shield key="shield-1" className="w-6 h-6" />,
      <Crown key="crown-2" className="w-6 h-6" />
    ];
    return icons[index % icons.length];
  };

  if (!plans || plans.length === 0) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg p-8 border border-gray-200 ${className}`}>
        <div className="text-center">
          <Crown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Abonelik Planları</h3>
          <p className="text-gray-600">Henüz abonelik planı bulunmuyor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-8 border border-gray-200 ${className}`} id={id}>
      <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">All Subscription Packages</h2>
            <p className="text-gray-600">Current subscription plans from Firebase</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center max-w-5xl mx-auto">
        {plans.map((plan: any, index: number) => {
          const isPopular = index === 1;
          
          return (
            <div 
              key={plan.id} 
              className={`relative bg-white rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 w-full ${
                isPopular 
                  ? 'border-blue-400 ring-2 ring-blue-100 max-w-md scale-105 shadow-2xl' 
                  : 'border-gray-200 hover:border-blue-300 max-w-sm'
              }`}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                                          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                          ⭐ Most Popular
                        </div>
                </div>
              )}

              {/* Plan Header */}
              <div className={`${isPopular ? 'p-8' : 'p-6'} rounded-t-xl bg-gradient-to-r ${getPlanGradient(index)} text-white`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className={`${isPopular ? 'text-2xl' : 'text-xl'} font-bold`}>{plan.displayName || plan.name}</h3>
                                            <p className="text-white text-opacity-80 text-sm">Subscription Plan</p>
                  </div>
                  {plan.isActive && (
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Active
                    </div>
                  )}
                </div>
                
                <div className="text-center">
                  <div className={`${isPopular ? 'text-4xl' : 'text-3xl'} font-bold mb-1`}>
                    {plan.price} {plan.currency}
                  </div>
                  <div className="text-sm text-white text-opacity-80">{plan.duration} days</div>
                </div>
              </div>

              {/* Plan Content */}
              <div className={`${isPopular ? 'p-8' : 'p-6'}`}>
                {/* Features */}
                {plan.features && plan.features.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3 text-sm">Özellikler</h4>
                    <div className="space-y-2">
                      {plan.features.map((feature: string, featureIndex: number) => (
                        <div key={featureIndex} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Permissions */}
                {plan.permissions && plan.permissions.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3 text-sm">Erişim İzinleri</h4>
                    <div className="space-y-2">
                      {plan.permissions.map((permId: string) => {
                        const permName = permId === 'question-generator' ? 'Soru Üretici' :
                                       permId === 'writing-evaluator' ? 'Yazı Değerlendirici' :
                                       permId === 'text-question-analysis' ? 'Metin Analizi' : permId;
                        return (
                          <div key={permId} className="flex items-center text-sm text-gray-600">
                            <Shield className="w-4 h-4 text-blue-500 mr-2" />
                            <span>{permName}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Select Button */}
                <button
                  onClick={() => onPlanSelect(plan)}
                  className={`w-full ${isPopular ? 'py-4 px-6' : 'py-3 px-4'} rounded-lg font-semibold ${isPopular ? 'text-base' : 'text-sm'} transition-all duration-200 ${
                    isPopular 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                                          {isPopular ? '⭐ Select This Plan' : 'Select Plan'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubscriptionPlansGrid;