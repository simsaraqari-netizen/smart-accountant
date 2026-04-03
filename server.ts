import express from 'express';
import { createServer as createViteServer } from 'vite';
import * as admin from 'firebase-admin';
import path from 'path';
import cron from 'node-cron';
import rateLimit from 'express-rate-limit';

// Initialize Firebase Admin
try {
  admin.initializeApp();
  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error);
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

// Helper to calculate next due date
function getNextDueDate(currentDate: Date, frequency: string): Date {
  const next = new Date(currentDate);
  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  return next;
}

// Cron job to check reminders every hour
cron.schedule('0 * * * *', async () => {
  console.log('Running reminder check cron job...');
  try {
    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();
    const oneHourFromNow = admin.firestore.Timestamp.fromMillis(now.toMillis() + 60 * 60 * 1000);

    // Get reminders that are enabled and due within the next hour
    const remindersSnapshot = await db.collection('reminders')
      .where('enabled', '==', true)
      .where('dueDate', '<=', oneHourFromNow)
      .get();

    for (const doc of remindersSnapshot.docs) {
      const reminder = doc.data();
      const userId = reminder.userId;

      // Get user's FCM tokens
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();
      const tokens = userData?.fcmTokens || [];

      if (tokens.length > 0) {
        const message = {
          notification: {
            title: `Reminder: ${reminder.title}`,
            body: reminder.description || 'You have a financial deadline approaching.',
          },
          tokens: tokens,
        };

        try {
          const response = await admin.messaging().sendEachForMulticast(message);
          console.log(`Successfully sent ${response.successCount} notifications for reminder ${doc.id}`);
          
          // Cleanup invalid tokens
          if (response.failureCount > 0) {
            const failedTokens: string[] = [];
            response.responses.forEach((resp, idx) => {
              if (!resp.success) {
                failedTokens.push(tokens[idx]);
              }
            });
            if (failedTokens.length > 0) {
              await db.collection('users').doc(userId).update({
                fcmTokens: admin.firestore.FieldValue.arrayRemove(...failedTokens)
              });
            }
          }
        } catch (error) {
          console.error(`Error sending notifications for reminder ${doc.id}:`, error);
        }
      }

      // Update reminder
      const updateData: any = {
        lastNotified: now
      };

      if (reminder.isRecurring && reminder.frequency) {
        updateData.dueDate = admin.firestore.Timestamp.fromDate(getNextDueDate(reminder.dueDate.toDate(), reminder.frequency));
      } else {
        updateData.enabled = false; // Disable one-time reminders after notification
      }

      await doc.ref.update(updateData);
    }
  } catch (error) {
    console.error('Error in reminder cron job:', error);
  }
});

// Cron job to sync transactions to Google Sheets every day at 00:00
cron.schedule('0 0 * * *', async () => {
  console.log('Running Google Sheets sync cron job...');
  try {
    const db = admin.firestore();
    const settingsSnapshot = await db.collection('settings').where('sheetUrl', '!=', '').get();

    for (const doc of settingsSnapshot.docs) {
      const settings = doc.data();
      const tenantId = doc.id;
      const sheetUrl = settings.sheetUrl;

      if (sheetUrl) {
        // Fetch transactions for this tenantId
        const transactionsSnapshot = await db.collection('transactions')
          .where('userId', '==', tenantId)
          .get();

        const transactions = transactionsSnapshot.docs.map(txDoc => {
          const data = txDoc.data();
          return {
            id: txDoc.id,
            date: data.date instanceof admin.firestore.Timestamp ? data.date.toDate().toISOString() : new Date(data.date).toISOString(),
            category: data.category,
            type: data.type,
            amount: data.amount,
            description: data.description || '',
            personName: data.personName || '',
            isCustodyLinked: data.isCustodyLinked || false,
            custodyAccountId: data.custodyAccountId || '',
            custodyAmount: data.custodyAmount || 0
          };
        });

        // Send to sheetUrl
        try {
          await fetch(sheetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transactions)
          });
          console.log(`Successfully synced transactions for tenant ${tenantId}`);
        } catch (error) {
          console.error(`Error syncing transactions for tenant ${tenantId}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Error in Google Sheets sync cron job:', error);
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use('/api/', limiter);

  // API Routes
  app.post('/api/admin/update-user', async (req, res) => {
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

      res.json({ success: true });
    } catch (error: any) {
      console.error('Update user error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
