import { NextRequest, NextResponse } from 'next/server';
import { collection, doc, getDocs, setDoc, updateDoc, query, where, orderBy, Timestamp, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SubscriptionPlan } from '@/types/user';

// Admin yetki kontrolü
function checkAdminAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  // Admin token kontrolü
  const token = authHeader.replace('Bearer ', '');
  return token === 'admin-super-token-2024'; // Admin token
}

// GET: Tüm abonelik planlarını getir
export async function GET(request: NextRequest) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 401 });
    }

    const plansQuery = query(collection(db, 'subscriptionPlans'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(plansQuery);
    
    const plans: SubscriptionPlan[] = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as SubscriptionPlan[];

    return NextResponse.json({ success: true, plans });
  } catch (error) {
    console.error('Admin subscription plans fetch error:', error);
    return NextResponse.json({ error: 'Abonelik planları getirilemedi' }, { status: 500 });
  }
}

// POST: Yeni abonelik planı oluştur
export async function POST(request: NextRequest) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 401 });
    }

    const body = await request.json();
    const { name, displayName, description, price, currency, duration, features, maxUsage, isActive, isDefault } = body;

    // Validation
    if (!name || !displayName || !price || !currency || !duration) {
      return NextResponse.json({ error: 'Eksik bilgiler' }, { status: 400 });
    }

    if (price <= 0) {
      return NextResponse.json({ error: 'Geçersiz fiyat' }, { status: 400 });
    }

    const newPlan: Omit<SubscriptionPlan, 'id'> = {
      name,
      displayName,
      description: description || '',
      price,
      currency,
      duration,
      features: features || [],
      maxUsage: maxUsage || -1,
      isActive: isActive !== undefined ? isActive : true,
      isDefault: isDefault || false,
      permissions: body.permissions || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      updatedBy: 'admin' // TODO: Gerçek admin UID
    };

    // Eğer yeni plan default ise, diğerlerini default yapma
    if (isDefault) {
      const existingPlansQuery = query(collection(db, 'subscriptionPlans'), where('isDefault', '==', true));
      const existingSnapshot = await getDocs(existingPlansQuery);
      
      for (const doc of existingSnapshot.docs) {
        await updateDoc(doc.ref, { isDefault: false });
      }
    }

    const docRef = doc(collection(db, 'subscriptionPlans'));
    await setDoc(docRef, {
      ...newPlan,
      createdAt: Timestamp.fromDate(newPlan.createdAt),
      updatedAt: Timestamp.fromDate(newPlan.updatedAt)
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Abonelik planı oluşturuldu',
      planId: docRef.id 
    });
  } catch (error) {
    console.error('Admin subscription plan creation error:', error);
    return NextResponse.json({ error: 'Abonelik planı oluşturulamadı' }, { status: 500 });
  }
}

// PUT: Abonelik planı güncelle
export async function PUT(request: NextRequest) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 401 });
    }

    const body = await request.json();
    const { planId, updates } = body;

    if (!planId || !updates) {
      return NextResponse.json({ error: 'Eksik bilgiler' }, { status: 400 });
    }

    // Sadece admin tarafından değiştirilebilir alanlar
    const allowedUpdates = {
      displayName: updates.displayName,
      price: updates.price,
      currency: updates.currency,
      duration: updates.duration,
      features: updates.features,
      maxUsage: updates.maxUsage,
      isActive: updates.isActive,
      isDefault: updates.isDefault,
      updatedAt: new Date(),
      updatedBy: 'admin' // TODO: Gerçek admin UID
    };

    // Eğer plan default yapılıyorsa, diğerlerini default yapma
    if (updates.isDefault) {
      const existingPlansQuery = query(collection(db, 'subscriptionPlans'), where('isDefault', '==', true));
      const existingSnapshot = await getDocs(existingPlansQuery);
      
      for (const doc of existingSnapshot.docs) {
        if (doc.id !== planId) {
          await updateDoc(doc.ref, { isDefault: false });
        }
      }
    }

    await updateDoc(doc(db, 'subscriptionPlans', planId), {
      ...allowedUpdates,
      updatedAt: Timestamp.fromDate(allowedUpdates.updatedAt)
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Abonelik planı güncellendi' 
    });
  } catch (error) {
    console.error('Admin subscription plan update error:', error);
    return NextResponse.json({ error: 'Abonelik planı güncellenemedi' }, { status: 500 });
  }
}

// DELETE: Abonelik planı sil
export async function DELETE(request: NextRequest) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('planId');

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID gerekli' }, { status: 400 });
    }

    // Plan'ı sil
    await deleteDoc(doc(db, 'subscriptionPlans', planId));

    return NextResponse.json({ 
      success: true, 
      message: 'Abonelik planı silindi' 
    });
  } catch (error) {
    console.error('Admin subscription plan deletion error:', error);
    return NextResponse.json({ error: 'Abonelik planı silinemedi' }, { status: 500 });
  }
}
