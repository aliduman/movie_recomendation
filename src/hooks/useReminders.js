import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';

export function useReminders(watchlistId) {
  const { user } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setReminders([]);
      setLoading(false);
      return undefined;
    }

    const q = query(
      collection(db, 'users', user.uid, 'reminders'),
      orderBy('dueAt', 'asc'),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setReminders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      () => {
        setReminders([]);
        setLoading(false);
      },
    );

    return () => unsub();
  }, [user]);

  const filtered = useMemo(() => {
    if (!watchlistId) return reminders;
    return reminders.filter((r) => r.watchlistId === watchlistId);
  }, [reminders, watchlistId]);

  const createReminder = useCallback(
    async ({ watchlistId: listId, watchlistName, dueAt, message }) => {
      if (!user) return null;
      if (!listId) throw new Error('REMINDER_LIST_REQUIRED');

      const dueDate = dueAt instanceof Date ? dueAt : new Date(dueAt);
      if (Number.isNaN(dueDate.getTime())) {
        throw new Error('REMINDER_INVALID_DATE');
      }
      if (dueDate.getTime() <= Date.now()) {
        throw new Error('REMINDER_PAST');
      }

      const trimmedMessage = (message || '').trim();
      const remindersRef = collection(db, 'users', user.uid, 'reminders');
      const docRef = await addDoc(remindersRef, {
        watchlistId: listId,
        watchlistName: watchlistName || '',
        message: trimmedMessage || null,
        dueAt: Timestamp.fromDate(dueDate),
        fired: false,
        createdAt: serverTimestamp(),
      });

      return docRef.id;
    },
    [user],
  );

  const deleteReminder = useCallback(
    async (reminderId) => {
      if (!user || !reminderId) return;
      await deleteDoc(doc(db, 'users', user.uid, 'reminders', reminderId));
    },
    [user],
  );

  return {
    reminders: filtered,
    allReminders: reminders,
    loading,
    createReminder,
    deleteReminder,
  };
}
