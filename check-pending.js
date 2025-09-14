const admin = require('firebase-admin');

// Firebase Admin SDK initialize (eğer yoksa)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: "https://lnat-try-default-rtdb.firebaseio.com"
  });
}

const db = admin.firestore();

async function checkPendingPayments() {
  try {
    const userId = '7Eszl6lHDbdZPT2LBynUbBXSOIt2';
    
    console.log('🔍 Checking pending payment for user:', userId);
    
    const pendingPaymentDoc = await db.collection('pendingPayments').doc(userId).get();
    
    if (pendingPaymentDoc.exists) {
      const data = pendingPaymentDoc.data();
      console.log('✅ Pending payment found:', data);
    } else {
      console.log('❌ No pending payment found for user');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkPendingPayments();
