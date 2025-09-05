import { NextResponse } from 'next/server';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SubscriptionPlan } from '@/types/user';

// POST: Premium plan oluştur
export async function POST() {
  try {
    const premiumPlan: Omit<SubscriptionPlan, 'id'> = {
      name: 'Premium Abonelik',
      description: 'Tüm özelliklere erişim',
      price: 100, // 1 TL (kuruş cinsinden)
      currency: 'TRY',
      duration: 30, // 30 gün
      features: [
        'Sınırsız soru üretimi',
        'Gelişmiş analiz araçları',
        'Öncelikli destek',
        'Tüm AI modelleri'
      ],
      isDefault: true,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'subscriptionPlans'), premiumPlan);

    return NextResponse.json({ 
      success: true, 
      message: 'Premium plan oluşturuldu',
      planId: docRef.id
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Premium plan oluşturulamadı',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
