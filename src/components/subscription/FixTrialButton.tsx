'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function FixTrialButton() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const fixTrialPeriod = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/fix-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.uid })
      });
      
      const result = await response.json();
      console.log('Trial fix result:', result);
      
      if (result.success) {
        alert('Trial süresi düzeltildi! Sayfayı yenileyin.');
        window.location.reload();
      } else {
        alert('Hata: ' + result.error);
      }
    } catch (error) {
      console.error('Fix trial error:', error);
      alert('Teknik hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={fixTrialPeriod}
      disabled={loading}
      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
    >
      {loading ? 'Düzeltiliyor...' : 'Trial Süresi Düzelt'}
    </button>
  );
}
