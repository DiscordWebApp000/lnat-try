'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PaymentRequest } from '@/lib/payment/payment-types';
import { SubscriptionPlan } from '@/types/user';
import { CreditCard, CheckCircle, AlertCircle, Shield, Loader2 } from 'lucide-react';

export default function PaymentForm() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string>('');
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(true);

  // CSRF token oluştur
  useEffect(() => {
    const generateCSRFToken = () => {
      const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
      setCsrfToken(token);
    };
    
    generateCSRFToken();
  }, []);

  // Abonelik planlarını getir
  useEffect(() => {
    const fetchSubscriptionPlans = async () => {
      try {
        setLoadingPlans(true);
        const response = await fetch('/api/subscription/plans');
        
        if (response.ok) {
          const data = await response.json();
          setSubscriptionPlans(data.plans || []);
          
          // Varsayılan planı seç
          if (data.defaultPlan) {
            setSelectedPlan(data.defaultPlan);
          } else if (data.plans && data.plans.length > 0) {
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
  }, []);

  // Input validation
  const validateInputs = (): { isValid: boolean; error?: string } => {
    if (!currentUser?.firstName || currentUser.firstName.length < 2) {
      return { isValid: false, error: 'Geçersiz ad' };
    }
    
    if (!currentUser?.lastName || currentUser.lastName.length < 2) {
      return { isValid: false, error: 'Geçersiz soyad' };
    }
    
    if (!currentUser?.email || !currentUser.email.includes('@')) {
      return { isValid: false, error: 'Geçersiz email' };
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
      const paymentRequest: PaymentRequest = {
        userId: currentUser.uid,
        amount: selectedPlan.price, // Veritabanından gelen fiyat
        currency: selectedPlan.currency as 'TRY' | 'USD', // Veritabanından gelen currency
        planType: selectedPlan.name as 'premium', // Veritabanından gelen plan tipi
        userEmail: currentUser.email,
        userName: `${currentUser.firstName} ${currentUser.lastName}`
      };

      // PayTR Link API kullanarak ödeme linki oluştur
      console.log('🔗 Creating payment link with PayTR Link API...');
      console.log('🔗 Request URL:', '/api/payment/create-link');
      console.log('🔗 Request data:', paymentRequest);
      console.log('🔗 Current user:', currentUser);
      console.log('🔗 User UID:', currentUser.uid);
      
      const response = await fetch('/api/payment/create-link', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.uid}` // Kullanıcı kimlik doğrulama
        },
        body: JSON.stringify(paymentRequest)
      });
      
      console.log('🔗 Payment Link API response status:', response.status);
      console.log('🔗 Payment Link API response status text:', response.statusText);
      console.log('🔗 Payment Link API response headers:', Object.fromEntries(response.headers.entries()));
      console.log('🔗 Response URL:', response.url);
      
      // Response body'yi text olarak al
      const responseText = await response.text();
      console.log('🔗 Response body (raw):', responseText);
      
      // 401 hatası için özel kontrol
      if (response.status === 401) {
        console.error('🔗 401 Unauthorized Error Details:');
        console.error('🔗 Status:', response.status);
        console.error('🔗 Status Text:', response.statusText);
        console.error('🔗 Headers:', Object.fromEntries(response.headers.entries()));
        console.error('🔗 Body:', responseText);
        throw new Error('Kimlik doğrulama hatası. Lütfen tekrar giriş yapın.');
      }
      
      // 403 hatası için özel kontrol
      if (response.status === 403) {
        throw new Error('Yetki hatası. Bu işlem için yetkiniz bulunmuyor.');
      }
      
      let result;
      try {
        result = JSON.parse(responseText);
        console.log('🔗 Payment Link API parsed result:', result);
      } catch (parseError) {
        console.error('🔗 JSON parse error:', parseError);
        throw new Error(`API response parse error: ${responseText}`);
      }
      
      if (!response.ok) {
        throw new Error(`Payment Link API error: ${response.status} - ${result?.error || 'Unknown error'}`);
      }
      
      if (result.success && result.paymentUrl) {
        setSuccess(true);
        
        // PayTR Link API'den gelen ödeme URL'ine yönlendir
        console.log('🔗 Redirecting to PayTR payment page...');
        console.log('🔗 Payment URL:', result.paymentUrl);
        console.log('🔗 Link ID:', result.token);
        
        // Kullanıcıyı PayTR'ın ödeme sayfasına yönlendir
        window.location.href = result.paymentUrl;
        
        // 5 saniye sonra dashboard'a yönlendir (webhook işlenmesi için)
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 5000);
      } else {
        setError(result.error || 'Ödeme linki oluşturulamadı');
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

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-4">
          <CreditCard className="h-12 w-12 text-blue-500 mr-3" />
          <Shield className="h-8 w-8 text-green-500" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Premium Abonelik</h3>
        <p className="text-gray-600">Tüm tool&apos;lara sınırsız erişim</p>
      </div>

      {/* Abonelik Plan Seçimi */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Abonelik Planı Seçin
        </label>
        <div className="space-y-2">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.id}
              className={`border rounded-lg p-3 cursor-pointer transition-all ${
                selectedPlan?.id === plan.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedPlan(plan)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{plan.name}</h4>
                  <p className="text-sm text-gray-600">{plan.duration} gün</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">
                    {plan.price} {plan.currency}
                  </div>
                  <div className="text-xs text-gray-500">
                    Abonelik
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seçilen Plan Detayları */}
      {selectedPlan && (
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Seçilen Plan:</span>
            <span className="text-2xl font-bold text-blue-600">
              {selectedPlan.price} {selectedPlan.currency}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {selectedPlan.duration} gün • {selectedPlan.name}
          </div>
        </div>
      )}

      {/* Plan Özellikleri */}
      {selectedPlan && selectedPlan.features && selectedPlan.features.length > 0 && (
        <div className="space-y-3 mb-6">
          <h4 className="font-medium text-gray-900">Plan Özellikleri:</h4>
          {selectedPlan.features.map((feature, index) => (
            <div key={index} className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tool Erişimleri */}
      {selectedPlan && selectedPlan.permissions && selectedPlan.permissions.length > 0 && (
        <div className="space-y-3 mb-6">
          <h4 className="font-medium text-gray-900">Tool Erişimleri:</h4>
          {selectedPlan.permissions.map((permId: string) => {
            const permName = permId === 'question-generator' ? 'Soru Üretici' :
                           permId === 'writing-evaluator' ? 'Yazı Değerlendirici' :
                           permId === 'text-question-analysis' ? 'Metin Analizi' : permId;
            return (
              <div key={permId} className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-sm text-gray-700">{permName}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Sabit özellikler kaldırıldı - artık dinamik plan verileri kullanılıyor */}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-sm text-green-700">Ödeme linki oluşturuldu! PayTR sayfasına yönlendiriliyorsunuz...</span>
          </div>
        </div>
      )}

      <button 
        onClick={handlePayment} 
        disabled={loading || success || !selectedPlan}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            İşleniyor...
          </>
        ) : success ? (
          <>
            <CheckCircle className="h-5 w-5 mr-2" />
            Ödeme Başlatıldı
          </>
        ) : !selectedPlan ? (
          <>
            <AlertCircle className="h-5 w-5 mr-2" />
            Plan Seçin
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5 mr-2" />
            Premium&apos;a Geç
          </>
        )}
      </button>

      <div className="text-xs text-gray-500 text-center mt-4 space-y-1">
        <div>Güvenli ödeme ile korunmaktadır.</div>
        <div>PayTR Link API altyapısı kullanılmaktadır.</div>
        <div className="flex items-center justify-center mt-2">
          <Shield className="h-4 w-4 text-green-500 mr-1" />
          SSL Şifreli Bağlantı
        </div>
      </div>

      {/* CSRF Token (gizli) */}
      <input type="hidden" name="csrf_token" value={csrfToken} />
    </div>
  );
}
