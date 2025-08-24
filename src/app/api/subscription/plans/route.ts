import { NextResponse } from 'next/server';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SubscriptionPlan } from '@/types/user';

// GET: Aktif abonelik planlarını getir
export async function GET() {
  try {
    console.log('🔍 Fetching subscription plans...');
    
    // Basit query - sadece orderBy ile
    const plansQuery = query(
      collection(db, 'subscriptionPlans'), 
      orderBy('createdAt', 'desc')
    );
    
    console.log('🔍 Query created, fetching documents...');
    const snapshot = await getDocs(plansQuery);
    console.log('🔍 Documents fetched:', snapshot.docs.length);
    
    const plans: SubscriptionPlan[] = snapshot.docs.map(doc => {
      const data = doc.data();
      console.log('🔍 Plan data:', data);
      
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
      };
    }) as SubscriptionPlan[];

    console.log('🔍 Plans processed:', plans.length);
    console.log('🔍 First plan:', plans[0]);

    // Varsayılan planı bul
    const defaultPlan = plans.find(plan => plan.isDefault) || plans[0];

    return NextResponse.json({ 
      success: true, 
      plans,
      defaultPlan 
    });
  } catch (error) {
    console.error('❌ Subscription plans fetch error:', error);
    console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ 
      error: 'Abonelik planları getirilemedi',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
