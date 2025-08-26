import { NextResponse } from 'next/server';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SubscriptionPlan } from '@/types/user';

// GET: Aktif abonelik planlarını getir
export async function GET() {
  try {
    // Basit query - sadece orderBy ile
    const plansQuery = query(
      collection(db, 'subscriptionPlans'), 
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(plansQuery);
    
    const plans: SubscriptionPlan[] = snapshot.docs.map(doc => {
      const data = doc.data();
      
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
      };
    }) as SubscriptionPlan[];

    // Varsayılan planı bul
    const defaultPlan = plans.find(plan => plan.isDefault) || plans[0];

    return NextResponse.json({ 
      success: true, 
      plans,
      defaultPlan 
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Abonelik planları getirilemedi',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
