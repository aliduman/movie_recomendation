import { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, query, limit } from 'firebase/firestore';
import { db } from '../config/firebase';

export function useMovieFans(movieId) {
  const [fans, setFans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!movieId) { setLoading(false); return; }
    const q = query(
      collection(db, 'movies', String(movieId), 'likedBy'),
      orderBy('likedAt', 'desc'),
      limit(20),
    );
    const unsub = onSnapshot(q, (snap) => {
      setFans(snap.docs.map((d) => ({ uid: d.id, ...d.data() })));
      setLoading(false);
    }, () => { setFans([]); setLoading(false); });
    return () => unsub();
  }, [movieId]);

  return { fans, loading };
}
