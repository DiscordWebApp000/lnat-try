'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PaymentRequest } from '@/lib/payment/payment-types';
import { SubscriptionPlan } from '@/types/user';
import { CreditCard, CheckCircle, AlertCircle, Shield, Loader2, Monitor } from 'lucide-react';

interface IframePaymentFormProps {
  selectedPlan?: any;
}

export default function IframePaymentForm({ selectedPlan: propSelectedPlan }: IframePaymentFormProps = {}) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [iframeToken, setIframeToken] = useState<string | null>(null);
  const [showIframe, setShowIframe] = useState(false);
  const [userPhone, setUserPhone] = useState('');
  const [userFirstName, setUserFirstName] = useState(currentUser?.firstName || '');
  const [userLastName, setUserLastName] = useState(currentUser?.lastName || '');
  const [userAddress, setUserAddress] = useState('');

  // Abonelik planlarını getir
  useEffect(() => {
    const fetchSubscriptionPlans = async () => {
      try {
        setLoadingPlans(true);
        const response = await fetch('/api/subscription/plans');
        
        if (response.ok) {
          const data = await response.json();
          setSubscriptionPlans(data.plans || []);
          
          // Eğer prop olarak plan gelmişse onu kullan, yoksa varsayılan planı seç
          if (propSelectedPlan) {
            console.log('🎯 IFRAME FORM: Using prop selected plan:', propSelectedPlan);
            setSelectedPlan(propSelectedPlan);
          } else if (data.defaultPlan) {
            console.log('🎯 IFRAME FORM: Using default plan:', data.defaultPlan);
            setSelectedPlan(data.defaultPlan);
          } else if (data.plans && data.plans.length > 0) {
            console.log('🎯 IFRAME FORM: Using first plan:', data.plans[0]);
            setSelectedPlan(data.plans[0]);
          }
        } else {
          console.error('Abonelik planları getirilemedi');
        }
      } catch (error) {
        console.error('Abonelik planları yüklenirken hata:', error);
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchSubscriptionPlans();
  }, [propSelectedPlan]);

  // CRITICAL: Her zaman prop'tan gelen planı kullan
  useEffect(() => {
    if (propSelectedPlan) {
      console.log('🎯 IFRAME FORM: Prop changed, updating selected plan:', propSelectedPlan);
      setSelectedPlan(propSelectedPlan);
    }
  }, [propSelectedPlan]);

  // Input validation
  const validateInputs = (): { isValid: boolean; error?: string } => {
    // Ad kontrolü
    if (!userFirstName || userFirstName.length < 2) {
      return { isValid: false, error: 'Geçerli bir ad giriniz (en az 2 karakter)' };
    }
    
    // Soyad kontrolü
    if (!userLastName || userLastName.length < 2) {
      return { isValid: false, error: 'Geçerli bir soyad giriniz (en az 2 karakter)' };
    }
    
    if (!currentUser?.email || !currentUser.email.includes('@')) {
      return { isValid: false, error: 'Geçersiz email' };
    }

    // Telefon numarası kontrolü - PayTR için zorunlu
    if (!userPhone || userPhone.length < 10) {
      return { isValid: false, error: 'Geçerli bir telefon numarası giriniz (en az 10 haneli)' };
    }

    // Adres kontrolü (opsiyonel ama en az 10 karakter)
    if (userAddress && userAddress.length < 10) {
      return { isValid: false, error: 'Adres en az 10 karakter olmalıdır' };
    }

    if (!selectedPlan) {
      return { isValid: false, error: 'Lütfen bir abonelik planı seçin' };
    }
    
    return { isValid: true };
  };

  const handlePayment = async () => {
    if (!currentUser) {
      setError('Kullanıcı girişi gerekli');
      return;
    }

    if (!selectedPlan) {
      setError('Lütfen bir abonelik planı seçin');
      return;
    }
    
    // Input validation
    const validation = validateInputs();
    if (!validation.isValid) {
      setError(validation.error || 'Geçersiz bilgiler');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🎯 FRONTEND: Creating payment request for plan:', {
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        planDisplayName: selectedPlan.displayName,
        planPrice: selectedPlan.price,
        planCurrency: selectedPlan.currency,
        selectedPlan: selectedPlan
      });
      
      // Plan seçimi debug completed
      
      const paymentRequest: PaymentRequest = {
        userId: currentUser.uid,
        amount: selectedPlan.price,
        currency: selectedPlan.currency as 'TRY' | 'USD',
        planType: selectedPlan.name, // Gerçek plan adını kullan
        planId: selectedPlan.id, // Plan ID'sini ekle
        userEmail: currentUser.email,
        userName: `${userFirstName} ${userLastName}`,
        userPhone: userPhone,
        userAddress: userAddress
      };
      
      console.log('🎯 FRONTEND: Payment request created:', paymentRequest);

      const response = await fetch('/api/payment/create-iframe', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.uid}`
        },
        body: JSON.stringify(paymentRequest)
      });
      
      // 401 hatası için özel kontrol
      if (response.status === 401) {
        throw new Error('Kimlik doğrulama hatası. Lütfen tekrar giriş yapın.');
      }
      
      // 403 hatası için özel kontrol
      if (response.status === 403) {
        throw new Error('Yetki hatası. Bu işlem için yetkiniz bulunmuyor.');
      }
      
      let result;
      let responseText;
      try {
        responseText = await response.text();
        result = JSON.parse(responseText);
      } catch {
        throw new Error(`API response parse error: ${responseText}`);
      }
      
      if (!response.ok) {
        throw new Error(`iFrame Payment API error: ${response.status} - ${result?.error || 'Unknown error'}`);
      }
      
      if (result.success && result.iframeData) {
        setSuccess(true);
        setIframeToken(result.iframeData.token);
        setShowIframe(true);
      } else {
        setError(result.error || 'iFrame ödeme formu oluşturulamadı');
      }
    } catch (error) {
      console.error('Payment error:', error);
      
      // Özel hata mesajları
      if (error instanceof Error) {
        if (error.message.includes('Kimlik doğrulama')) {
          setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        } else if (error.message.includes('Yetki')) {
          setError('Bu işlem için yetkiniz bulunmuyor.');
        } else if (error.message.includes('network')) {
          setError('Ağ bağlantı hatası. İnternet bağlantınızı kontrol edin.');
        } else {
          setError('Teknik bir hata oluştu: ' + error.message);
        }
      } else {
        setError('Bilinmeyen bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Giriş Gerekli</h3>
        <p className="text-gray-600 mb-4">
          Ödeme yapmak için giriş yapmanız gerekiyor.
        </p>
      </div>
    );
  }

  if (loadingPlans) {
    return (
      <div className="text-center p-8">
        <Loader2 className="mx-auto h-12 w-12 text-blue-500 mb-4 animate-spin" />
        <h3 className="text-xl font-semibold mb-2">Abonelik Planları Yükleniyor</h3>
        <p className="text-gray-600">Lütfen bekleyin...</p>
      </div>
    );
  }

  if (subscriptionPlans.length === 0) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Abonelik Planı Bulunamadı</h3>
        <p className="text-gray-600 mb-4">
          Şu anda aktif abonelik planı bulunmuyor. Lütfen daha sonra tekrar deneyin.
        </p>
      </div>
    );
  }

  // iFrame ödeme formu gösteriliyorsa
  if (showIframe && iframeToken) {
    return (
      <div className="w-full max-w-7xl mx-auto bg-white rounded-xl shadow-2xl p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <Monitor className="h-12 w-12 text-blue-600" />
            </div>
            <div className="bg-green-100 p-2 rounded-full">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Güvenli Ödeme</h3>
          <p className="text-base sm:text-lg text-gray-600">PayTR güvenli ödeme sistemi ile ödemenizi tamamlayın</p>
        </div>

        {/* iFrame Ödeme Formu */}
        <div className="border-2 border-gray-200 rounded-xl p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-white">
          <div className="mb-4 sm:mb-6">
            <h4 className="font-semibold text-gray-900 mb-3 text-lg">Seçilen Plan:</h4>
            <div className="bg-white rounded-lg p-4 border-2 border-blue-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <span className="font-semibold text-gray-900 text-lg">{selectedPlan?.name}</span>
                  <p className="text-sm text-gray-600 mt-1">{selectedPlan?.duration} gün abonelik</p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">
                    {selectedPlan?.price} {selectedPlan?.currency}
                  </div>
                  <div className="text-xs text-blue-500 font-medium">
                    Premium Erişim
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PayTR iFrame - Scroll ve boyut iyileştirildi */}
          <div className="relative w-full mb-4 sm:mb-6">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <iframe 
                src={`https://www.paytr.com/odeme/guvenli/${iframeToken}`}
                id="paytriframe" 
                frameBorder="0"
                scrolling="yes" 
                style={{ 
                  width: '100%', 
                  height: '700px',
                  border: 'none',
                  borderRadius: '8px',
                  overflow: 'auto'
                }}
                className="w-full"
                title="PayTR Ödeme Formu"
                allow="payment"
              />
            </div>
          </div>

          <div className="text-center">
            <div className="text-sm text-gray-600 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl border border-blue-200 shadow-sm">
              <p className="font-semibold text-blue-800 mb-3 text-base sm:text-lg">💡 <strong>After Payment:</strong></p>
              <ul className="list-none space-y-2 text-blue-700">
                <li className="flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Complete the payment in the above form</span>
                </li>
                <li className="flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-sm sm:text-base">If the payment is successful, you will be automatically redirected</span>
                </li>
                <li className="flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Check your subscription status in the Dashboard</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 text-center">
          <button
            onClick={() => setShowIframe(false)}
            className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-all duration-200 font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-gray-900 to-slate-800 px-8 py-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-6">
          <CreditCard className="h-8 w-8 text-white" />
        </div>
          <h3 className="text-3xl font-bold text-white mb-3">Premium Subscription</h3>
        <p className="text-gray-300 text-lg">Unlimited access to all tools</p>
      </div>

      <div className="p-8">

      {/* Subscription Plan Selection - Only show if plan is not selected via prop */}
      {!propSelectedPlan && (
        <div className="mb-10">
          <h4 className="text-xl font-semibold text-gray-900 mb-6 text-center">Select Plan</h4>
          <div className="space-y-3">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.id}
                className={`border rounded-xl p-5 cursor-pointer transition-all duration-200 ${
                  selectedPlan?.id === plan.id
                    ? 'border-slate-900 bg-slate-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedPlan(plan)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedPlan?.id === plan.id 
                        ? 'border-slate-900 bg-slate-900' 
                        : 'border-gray-300'
                    }`}>
                      {selectedPlan?.id === plan.id && (
                        <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                      <p className="text-sm text-gray-500">{plan.duration} days</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-slate-900">
                      {plan.price} {plan.currency}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seçilen Plan Detayları */}
      {selectedPlan && (
        <div className="bg-slate-50 rounded-xl p-6 mb-8 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">{selectedPlan.name}</h4>
              <p className="text-sm text-gray-500">{selectedPlan.duration} days subscription</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">
                {selectedPlan.price} {selectedPlan.currency}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plan Özellikleri */}
      {selectedPlan && selectedPlan.features && selectedPlan.features.length > 0 && (
        <div className="mb-8">
          <h4 className="font-semibold text-gray-900 mb-4">Features</h4>
          <div className="space-y-2">
            {selectedPlan.features.map((feature, index) => (
              <div key={index} className="flex items-center text-sm text-gray-600">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-3"></div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tool Erişimleri */}
      {selectedPlan && selectedPlan.permissions && selectedPlan.permissions.length > 0 && (
        <div className="mb-8">
          <h4 className="font-semibold text-gray-900 mb-4">Access Permissions</h4>
          <div className="space-y-2">
            {selectedPlan.permissions.map((permId: string) => {
              const permName = permId === 'question-generator' ? 'Question Generator' :
                             permId === 'writing-evaluator' ? 'Writing Evaluator' :
                             permId === 'text-question-analysis' ? 'Text Analysis' : permId;
              return (
                <div key={permId} className="flex items-center text-sm text-gray-600">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-3"></div>
                  <span>{permName}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ad ve Soyad */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div>
          <label htmlFor="userFirstName" className="block text-sm font-medium text-gray-700 mb-2">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="userFirstName"
            value={userFirstName}
            onChange={(e) => setUserFirstName(e.target.value)}
            placeholder="Your first name"
            className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:border-slate-900 focus:outline-none transition-colors duration-200"
            required
          />
        </div>
        <div>
          <label htmlFor="userLastName" className="block text-sm font-medium text-gray-700 mb-2">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="userLastName"
            value={userLastName}
            onChange={(e) => setUserLastName(e.target.value)}
            placeholder="Your last name"
            className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:border-slate-900 focus:outline-none transition-colors duration-200"
            required
          />
        </div>
      </div>

      {/* Adres */}
      <div className="mb-8">
        <label htmlFor="userAddress" className="block text-sm font-medium text-gray-700 mb-2">
          Address <span className="text-gray-500">(Optional)</span>
        </label>
        <textarea
          id="userAddress"
          value={userAddress}
          onChange={(e) => setUserAddress(e.target.value)}
          placeholder="Enter your address (minimum 10 characters)"
          rows={3}
          className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:border-slate-900 focus:outline-none transition-colors duration-200 resize-none"
        />
        <div className="mt-2 text-xs text-gray-500">
          Address field is optional but must be at least 10 characters if filled.
        </div>
      </div>

      {/* Telefon Numarası - PayTR için Zorunlu */}
      <div className="mb-8">
        <label htmlFor="userPhone" className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          id="userPhone"
          value={userPhone}
          onChange={(e) => setUserPhone(e.target.value)}
          placeholder="5XX XXX XX XX"
          className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:border-slate-900 focus:outline-none transition-colors duration-200"
          required
        />
        <div className="mt-2 text-xs text-gray-500">
          Required field for PayTR. Must be at least 10 digits.
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-500 mr-3 flex-shrink-0" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
            <span className="text-green-700 text-sm">
              iFrame payment form created successfully!
            </span>
          </div>
        </div>
      )}

      <button 
        onClick={handlePayment} 
        disabled={loading || success || !selectedPlan}
        className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-gray-400 text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center text-base disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 mr-3 animate-spin" />
            Processing...
          </>
        ) : success ? (
          <>
            <CheckCircle className="h-5 w-5 mr-3" />
            Payment Form Ready
          </>
        ) : !selectedPlan ? (
          <>
            <AlertCircle className="h-5 w-5 mr-3" />
            Select Plan
          </>
        ) : (
          <>
            <Monitor className="h-5 w-5 mr-3" />
            Make Payment
          </>
        )}
      </button>

      <div className="text-xs text-gray-400 text-center mt-8 pt-6 border-t border-gray-100">
        <div className="flex items-center justify-center space-x-4">
          <div className="flex items-center">
            <Shield className="h-4 w-4 text-gray-400 mr-1" />
            <span>SSL Encrypted</span>
          </div>
          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
          <div>PayTR Secure Payment</div>
        </div>
      </div>
      </div>
    </div>
  );
}
