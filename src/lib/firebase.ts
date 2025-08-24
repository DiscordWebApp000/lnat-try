import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Development modunda emulator kullanımı (opsiyonel)
// Eğer emulator kullanmak isterseniz, aşağıdaki satırları uncomment edin
/*
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  try {
    // Auth emulator (opsiyonel) - Firebase Console'da Emulator Suite kuruluysa
    // connectAuthEmulator(auth, "http://localhost:9099");
    
    // Firestore emulator (opsiyonel) - Firebase Console'da Emulator Suite kuruluysa
    // connectFirestoreEmulator(db, 'localhost', 8080);
  } catch (error) {
    console.log('Emulator connection failed or already connected:', error);
  }
}
*/

export default app; 