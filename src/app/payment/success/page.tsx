'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Crown, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function PaymentSuccessPage() {
  const [orderId, setOrderId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setOrderId(urlParams.get('order'));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      window.location.href = '/dashboard';
    }
  }, [countdown]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Ödeme Başarılı!</h1>
            <p className="text-xl text-gray-600">Premium aboneliğiniz aktif edildi</p>
          </div>

          {/* Order Details */}
          {orderId && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Detayları</h2>
              <div className="text-sm text-gray-600">
                <p><strong>Sipariş ID:</strong> {orderId}</p>
                <p><strong>Durum:</strong> <span className="text-green-600 font-semibold">Başarılı</span></p>
                <p><strong>Tarih:</strong> {new Date().toLocaleDateString('tr-TR')}</p>
              </div>
            </div>
          )}

          {/* Premium Benefits */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-center">
              <Crown className="w-5 h-5 text-yellow-500 mr-2" />
              Premium Avantajlarınız
            </h2>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-1">AI Tool&apos;ları</h3>
                <p>Tüm AI tool&apos;larına sınırsız erişim</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-1">Sınırsız Analiz</h3>
                <p>Analiz ve değerlendirme limiti yok</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-1">Öncelikli Destek</h3>
                <p>7/24 teknik destek</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Dashboard&apos;a Git
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            
            <div className="text-sm text-gray-500">
              {countdown > 0 ? (
                <p>{countdown} saniye sonra otomatik yönlendirileceksiniz...</p>
              ) : (
                <p>Yönlendiriliyorsunuz...</p>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-sm text-gray-500">
            <p>Herhangi bir sorun yaşarsanız destek ekibimizle iletişime geçin.</p>
            <p>Abonelik bilgileriniz email adresinize gönderildi.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
