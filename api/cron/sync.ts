import { VercelRequest, VercelResponse } from '@vercel/node';
import { getFirebaseAdmin } from '../_utils/firebase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Check CRON_SECRET to secure the endpoint
  if (process.env.CRON_SECRET) {
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  const admin = getFirebaseAdmin();
  
  console.log('Running Google Sheets sync cron job via Vercel...');
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

        const transactions = transactionsSnapshot.docs.map((txDoc: any) => {
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
    
    return res.status(200).json({ success: true, message: 'Google Sheets sync processed successfully.' });
  } catch (error: any) {
    console.error('Error in Google Sheets sync cron job:', error);
    return res.status(500).json({ error: error.message });
  }
}
