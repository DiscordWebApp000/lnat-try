'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const callbackId = searchParams.get('callback_id');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Ödeme Başarısız</h2>
        <p className="text-gray-600 mb-6">
          Ödeme işlemi tamamlanamadı. Lütfen tekrar deneyin veya farklı bir ödeme yöntemi kullanın.
        </p>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-red-800 mb-2">Olası Nedenler:</h3>
          <ul className="text-sm text-red-700 space-y-1 text-left">
            <li>• Yetersiz bakiye</li>
            <li>• Kart bilgileri hatalı</li>
            <li>• Banka tarafından işlem reddedildi</li>
            <li>• Ağ bağlantı sorunu</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Link 
            href="/subscription"
            className="block w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Tekrar Dene
          </Link>
          <Link 
            href="/dashboard"
            className="block w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Dashboard&apos;a Dön
          </Link>
        </div>

        {callbackId && (
          <p className="text-xs text-gray-500 mt-4">
            Referans ID: {callbackId}
          </p>
        )}

        <div className="mt-6 text-sm text-gray-500">
          <p>Sorun devam ederse destek ekibiyle iletişime geçin.</p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    }>
      <PaymentFailedContent />
    </Suspense>
  );
}
