import { VercelRequest, VercelResponse } from '@vercel/node';
import { getFirebaseAdmin } from '../_utils/firebase';

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Check CRON_SECRET to secure the endpoint
  if (process.env.CRON_SECRET) {
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  const admin = getFirebaseAdmin();
  
  console.log('Running reminder check cron job via Vercel...');
  try {
    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();
    const oneDayFromNow = admin.firestore.Timestamp.fromMillis(now.toMillis() + 24 * 60 * 60 * 1000);

    // Get reminders that are enabled and due within the next 24 hours
    const remindersSnapshot = await db.collection('reminders')
      .where('enabled', '==', true)
      .where('dueDate', '<=', oneDayFromNow)
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
            response.responses.forEach((resp: any, idx: number) => {
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
    
    return res.status(200).json({ success: true, message: 'Reminders processed successfully.' });
  } catch (error: any) {
    console.error('Error in reminder cron job:', error);
    return res.status(500).json({ error: error.message });
  }
}
