import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const serviceAccount = require('./serviceAccountKey.json');

// Get Firebase config from .env.local
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const API_KEY = process.env.VITE_FIREBASE_API_KEY;

async function getAccessToken() {
  // Use service account to get access token
  const { GoogleAuth } = await import('google-auth-library');
  const auth = new GoogleAuth({
    credentials: serviceAccount,
  });
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  return accessToken.token;
}

async function createAdminAccount() {
  const email = 'simsaraqari@gmail.com';
  const password = 'Admin123456';

  try {
    // Create user using Firebase Auth REST API
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/projects/simsar-account-login/accounts:signUp?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
        returnSecureToken: true,
      }),
    });

    const data = await response.json();

    if (data.error) {
      if (data.error.message === 'EMAIL_EXISTS') {
        console.log('⚠️  User already exists in Firebase Auth');
        console.log('📧 Email:', email);
        console.log('🔑 Password: (use your existing password or try resetting it)');
        console.log('');
        console.log('To reset password, use Firebase Console or the app\'s password reset feature');
      } else {
        console.error('❌ Error creating user:', data.error);
      }
      return;
    }

    console.log('✅ Successfully created user in Firebase Auth');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('🆔 Local ID:', data.localId);
    console.log('🔑 ID Token:', data.idToken);
    console.log('');
    console.log('⚠️  IMPORTANT: Save these credentials!');
    console.log('⚠️  You can now login with these credentials in the app');
    console.log('');
    console.log('Note: The user will get admin privileges automatically due to the email override in the code');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createAdminAccount();
