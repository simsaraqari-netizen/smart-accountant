import { VercelRequest, VercelResponse } from '@vercel/node';
import { getFirebaseAdmin } from '../_utils/firebase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const admin = getFirebaseAdmin();

  try {
    const { uid, newUsername, newPassword, adminToken } = req.body;
    
    if (!adminToken) {
      return res.status(401).json({ error: 'Missing admin token' });
    }

    // Verify admin token
    const decodedToken = await admin.auth().verifyIdToken(adminToken);
    
    if (!decodedToken.email_verified) {
      return res.status(403).json({ error: 'Unauthorized: Email must be verified' });
    }
    
    // Check if requester is admin in Firestore
    const adminDoc = await admin.firestore().collection('users').doc(decodedToken.uid).get();
    let isAdmin = false;
    
    if (adminDoc.exists && adminDoc.data()?.role === 'admin') {
      isAdmin = true;
    } else {
      // Check default admins
      const allowedEmails = ["simsaraqari@gmail.com", "mostafasoliman550@gmail.com", "simsar@internal.app", "admin@internal.app"];
      if (allowedEmails.includes(decodedToken.email?.toLowerCase() || '')) {
        isAdmin = true;
      }
    }

    if (!isAdmin) {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }

    const updateData: any = {};
    
    if (newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      updateData.password = newPassword;
    }

    if (newUsername) {
      // Format email
      const trimmed = newUsername.trim().toLowerCase();
      const authEmail = trimmed.includes('@') ? trimmed : `${trimmed}@internal.app`;
      updateData.email = authEmail;
      updateData.displayName = newUsername;
      
      // Update Firestore user doc
      await admin.firestore().collection('users').doc(uid).update({
        username: newUsername,
        email: authEmail,
        displayName: newUsername
      });
    }

    if (Object.keys(updateData).length > 0) {
      await admin.auth().updateUser(uid, updateData);
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Update user error:', error);
    return res.status(500).json({ error: error.message });
  }
}
