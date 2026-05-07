import { useState, useEffect, useCallback } from 'react';
import {
  collection, onSnapshot, orderBy, query, limit,
  updateDoc, doc, writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setNotifications([]); setLoading(false); return; }
    const q = query(
      collection(db, 'users', user.uid, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(50),
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setNotifications(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      () => { setNotifications([]); setLoading(false); },
    );
    return () => unsub();
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = useCallback(async (id) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'notifications', id), { read: true });
  }, [user]);

  const markAllRead = useCallback(async () => {
    if (!user) return;
    const unread = notifications.filter((n) => !n.read);
    if (!unread.length) return;
    const batch = writeBatch(db);
    unread.forEach((n) =>
      batch.update(doc(db, 'users', user.uid, 'notifications', n.id), { read: true })
    );
    await batch.commit();
  }, [notifications, user]);

  return { notifications, loading, unreadCount, markRead, markAllRead };
}
