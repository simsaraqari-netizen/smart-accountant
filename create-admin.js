import admin from 'firebase-admin';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function listUsers() {
  try {
    const snapshot = await db.collection('users').get();
    
    if (snapshot.empty) {
      console.log('❌ No users found in Firestore');
      return;
    }

    console.log('📋 Existing users in Firestore:');
    console.log('================================');
    
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`📧 Email: ${data.email || data.username}`);
      console.log(`👤 Username: ${data.username}`);
      console.log(`🔑 Role: ${data.role}`);
      console.log(`🆔 ID: ${doc.id}`);
      console.log(`🏠 Tenant ID: ${data.tenantId}`);
      console.log('---');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

listUsers();
