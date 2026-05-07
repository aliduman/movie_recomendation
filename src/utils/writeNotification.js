import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

// Uses deterministic IDs to avoid duplicate/spam notifications.
// Calling this again with the same notifId resets it to unread with fresh content.
export async function sendNotification(targetUid, notifId, data) {
  if (!targetUid || !notifId) return;
  try {
    await setDoc(doc(db, 'users', targetUid, 'notifications', notifId), {
      ...data,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch {}
}
