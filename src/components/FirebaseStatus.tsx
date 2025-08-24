'use client';

import { useEffect, useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { AlertCircle, CheckCircle, Wifi, WifiOff } from 'lucide-react';

export default function FirebaseStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    checkFirebaseConnection();
  }, []);

  const checkFirebaseConnection = async () => {
    try {
      // Auth bağlantısını kontrol et
      if (!auth) {
        throw new Error('Firebase Auth bağlantısı başarısız');
      }

      // Firestore bağlantısını kontrol et
      if (!db) {
        throw new Error('Firebase Firestore bağlantısı başarısız');
      }

      // Basit bir Firestore test sorgusu
      await getDoc(doc(db, 'test', 'connection'));
      
      setStatus('connected');
    } catch (error: unknown) {
      console.error('Firebase connection error:', error);
      setStatus('error');
      
      // Hata mesajını kullanıcı dostu hale getir
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.includes('PERMISSION_DENIED')) {
        setErrorMessage('Firebase güvenlik kuralları henüz ayarlanmamış.');
      } else if (errorMessage.includes('PROJECT_NOT_FOUND')) {
        setErrorMessage('Firebase projesi bulunamadı.');
      } else if (errorMessage.includes('UNAUTHENTICATED')) {
        setErrorMessage('Firebase authentication gerekli.');
      } else {
        setErrorMessage('Firebase bağlantı hatası. Console kurulumunu kontrol edin.');
      }
    }
  };

  if (status === 'checking') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-blue-700 text-sm">Firebase bağlantısı kontrol ediliyor...</span>
        </div>
      </div>
    );
  }

  if (status === 'connected') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <Wifi className="w-4 h-4 text-green-600" />
          <span className="text-green-700 text-sm font-medium">Firebase bağlantısı başarılı!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
      <div className="flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
        <WifiOff className="w-4 h-4 text-red-600 mt-0.5" />
        <div className="flex-1">
          <p className="text-red-700 text-sm font-medium">Firebase bağlantısı başarısız</p>
          <p className="text-red-600 text-xs mt-1">{errorMessage}</p>
          <div className="mt-2 text-xs text-red-600">
            <p>🔧 <strong>Solution:</strong> Complete the following steps in Firebase Console:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Authentication → Enable Email/Password</li>
              <li>Firestore Database → Create in Test mode</li>
              <li>Firestore Rules → Set test rules</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}