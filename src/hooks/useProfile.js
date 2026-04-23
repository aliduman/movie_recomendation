import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot, collection, orderBy, query } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth } from '../config/firebase';

export function useProfile(uid) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    const unsub = onSnapshot(doc(db, 'users', uid), (snap) => {
      setProfile(snap.exists() ? { uid, ...snap.data() } : { uid });
      setLoading(false);
    });
    return () => unsub();
  }, [uid]);

  return { profile, loading };
}

export function usePublicFavorites(uid) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    const q = query(collection(db, 'users', uid, 'favorites'), orderBy('updatedAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setFavorites(snap.docs.map((d) => ({ id: Number(d.id), ...d.data() })));
      setLoading(false);
    }, () => { setFavorites([]); setLoading(false); });
    return () => unsub();
  }, [uid]);

  return { favorites, loading };
}

export async function saveProfile(uid, data) {
  await setDoc(doc(db, 'users', uid), data, { merge: true });
  if (data.displayName && auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName: data.displayName });
  }
}
