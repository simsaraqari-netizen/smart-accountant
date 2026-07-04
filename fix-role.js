import admin from 'firebase-admin';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixUserRole() {
  const email = process.argv[2] || 'simsaraqari@gmail.com';
  
  try {
    // Find user by email
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();
    
    if (snapshot.empty) {
      console.log('❌ User not found with email:', email);
      return;
    }
    
    const userDoc = snapshot.docs[0];
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
    await usersRef.doc(userId).update({ role: 'admin' });
    console.log('✅ Successfully updated user role to admin');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixUserRole();
