import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixUserRole() {
  const email = process.argv[2] || 'simsaraqari@gmail.com';
  
  try {
    // Find user by email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('❌ User not found with email:', email);
      return;
    }
    
    const userDoc = querySnapshot.docs[0];
    const userId = userDoc.id;
    const userData = userDoc.data();
    
    console.log('📋 Current user data:', {
      id: userId,
      email: userData.email,
      role: userData.role,
      username: userData.username
    });
    
    if (userData.role === 'admin') {
      console.log('✅ User is already admin');
      return;
    }
    
    // Update role to admin
    await updateDoc(doc(db, 'users', userId), { role: 'admin' });
    console.log('✅ Successfully updated user role to admin');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixUserRole();
