'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function FirebaseTest() {
  const [status, setStatus] = useState('Testing...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testFirebase();
  }, []);

  const testFirebase = async () => {
    try {
     
      
      // Test dokümanını oku
      const testDocs = await getDocs(collection(db, 'test'));
      
      if (testDocs.size > 0) {
        setStatus('✅ Firebase bağlantısı başarılı!');
      } else {
        setStatus('⚠️ Firebase bağlantısı var ama veri okunamadı');
      }
    } catch (error: unknown) {
      console.error('Firebase test error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      setStatus('❌ Firebase bağlantısı başarısız');
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="font-semibold mb-2">Firebase Bağlantı Testi</h3>
      <p className="text-sm text-gray-600 mb-2">{status}</p>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-2">
          <p className="text-red-700 text-xs">{error}</p>
        </div>
      )}
    </div>
  );
}