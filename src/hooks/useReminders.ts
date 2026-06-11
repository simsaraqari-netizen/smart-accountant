import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Reminder } from '../types';

export const useReminders = (tenantId: string | null) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(setPermission);
      }
    }
  }, []);

  useEffect(() => {
    if (!tenantId) return;

    const q = query(collection(db, 'reminders'), where('tenantId', '==', tenantId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rems: Reminder[] = [];
      snapshot.forEach(d => rems.push({ id: d.id, ...d.data() } as Reminder));
      setReminders(rems);
    });

    return unsubscribe;
  }, [tenantId]);

  // Check reminders periodically
  useEffect(() => {
    if (reminders.length === 0 || permission !== 'granted') return;

    const checkReminders = () => {
      const now = new Date();
      reminders.forEach(async (reminder) => {
        if (!reminder.enabled) return;

        const dueDate = reminder.dueDate.toDate();
        const lastNotified = reminder.lastNotified?.toDate() || new Date(0);
        
        // If due date is passed and we haven't notified recently (e.g. today)
        if (now >= dueDate && now.getTime() - lastNotified.getTime() > 1000 * 60 * 60 * 12) {
          // Trigger Notification
          new Notification('تذكير: ' + reminder.title, {
            body: reminder.description || 'لديك تذكير مستحق الآن!',
            icon: '/icon.svg'
          });

          // Update last notified
          try {
            await updateDoc(doc(db, 'reminders', reminder.id), {
              lastNotified: Timestamp.fromDate(now)
            });
            
            // If recurring, update the next due date
            if (reminder.isRecurring && reminder.frequency) {
              const nextDate = new Date(dueDate);
              if (reminder.frequency === 'daily') nextDate.setDate(nextDate.getDate() + 1);
              if (reminder.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
              if (reminder.frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
              if (reminder.frequency === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);
              
              await updateDoc(doc(db, 'reminders', reminder.id), {
                dueDate: Timestamp.fromDate(nextDate)
              });
            } else {
              // If not recurring, disable it after notifying
              await updateDoc(doc(db, 'reminders', reminder.id), {
                enabled: false
              });
            }
          } catch (e) {
            console.error("Error updating reminder notification status", e);
          }
        }
      });
    };

    // Check immediately and then every minute
    checkReminders();
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [reminders, permission]);

  return { reminders };
};
