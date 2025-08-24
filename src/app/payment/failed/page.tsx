'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { XCircle, AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function PaymentFailedPage() {
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setOrderId(urlParams.get('order'));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Failed Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Ödeme Başarısız</h1>
            <p className="text-xl text-gray-600">Ödeme işlemi tamamlanamadı</p>
          </div>

          {/* Order Details */}
          {orderId && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Detayları</h2>
              <div className="text-sm text-gray-600">
                <p><strong>Sipariş ID:</strong> {orderId}</p>
                <p><strong>Durum:</strong> <span className="text-red-600 font-semibold">Başarısız</span></p>
                <p><strong>Tarih:</strong> {new Date().toLocaleDateString('tr-TR')}</p>
              </div>
            </div>
          )}

          {/* Error Information */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
              Olası Nedenler
            </h2>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• Kart bilgileri yanlış girildi</p>
              <p>• Kart limiti yetersiz</p>
              <p>• 3D Secure doğrulaması başarısız</p>
              <p>• Banka tarafından işlem reddedildi</p>
              <p>• Teknik bir hata oluştu</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link 
              href="/subscription" 
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Tekrar Dene
            </Link>
            
            <Link 
              href="/dashboard" 
              className="inline-flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Dashboard&apos;a Dön
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-sm text-gray-500">
            <p>Ödeme işlemi sırasında herhangi bir ücret tahsil edilmez.</p>
            <p>Kartınızda sadece 1₺ tutarında test işlemi görünebilir.</p>
            <p>Sorun devam ederse destek ekibimizle iletişime geçin.</p>
          </div>

          {/* Support Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Destek</h3>
            <p className="text-sm text-blue-700">
              Ödeme ile ilgili sorunlarınız için: <strong>destek@yourdomain.com</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
