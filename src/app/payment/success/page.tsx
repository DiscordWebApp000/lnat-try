'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const callbackId = searchParams.get('callback_id');
  const orderId = searchParams.get('oid'); // PayTR iFrame'den gelen order ID
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  const checkPaymentStatus = useCallback(async () => {
    try {
      // YENİ SİSTEM: Pending payment varsa onu aktive et
      console.log('🔍 SUCCESS PAGE: Checking payment status for orderId:', orderId);
      
      // Eğer webhook çalışmadıysa manuel aktive et
      if (orderId) {
        try {
          const response = await fetch('/api/manual-activate-subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId })
          });
          
          if (response.ok) {
            console.log('✅ SUCCESS PAGE: Subscription manually activated');
          }
        } catch (manualError) {
          console.log('⚠️ SUCCESS PAGE: Manual activation failed:', manualError);
        }
      }
      
      setStatus('success');
      setMessage('Ödeme başarıyla tamamlandı! Aboneliğiniz aktif edildi.');
    } catch {
      setStatus('error');
      setMessage('Ödeme durumu kontrol edilemedi. Lütfen destek ekibiyle iletişime geçin.');
    }
  }, [orderId]);

  useEffect(() => {
    // Callback ID veya Order ID varsa webhook durumunu kontrol et
    if (callbackId || orderId) {
      checkPaymentStatus();
    } else {
      // Hiçbiri yoksa direkt success göster
      setStatus('success');
      setMessage('Ödeme başarıyla tamamlandı! Aboneliğiniz aktif edildi.');
    }
  }, [callbackId, orderId, checkPaymentStatus]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <Loader2 className="mx-auto h-16 w-16 text-blue-500 mb-4 animate-spin" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ödeme İşleniyor</h2>
          <p className="text-gray-600">Lütfen bekleyin, ödeme durumunuz kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Hata Oluştu</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="space-y-3">
            <Link 
              href="/dashboard"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Dashboard&apos;a Git
            </Link>
            <Link 
              href="/subscription"
              className="block w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Abonelik Sayfasına Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Ödeme Başarılı!</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-green-800 mb-2">Premium Aboneliğiniz Aktif!</h3>
          <ul className="text-sm text-green-700 space-y-1 text-left">
            <li>• Tüm AI tool&apos;lara sınırsız erişim</li>
            <li>• Soru üretici</li>
            <li>• Yazı değerlendirici</li>
            <li>• Metin analizi</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Link 
            href="/dashboard"
            className="block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Dashboard&apos;a Git
          </Link>
          <Link 
            href="/question-generator"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Tool&apos;ları Kullanmaya Başla
          </Link>
        </div>

        {(callbackId || orderId) && (
          <p className="text-xs text-gray-500 mt-4">
            Referans ID: {callbackId || orderId}
          </p>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
