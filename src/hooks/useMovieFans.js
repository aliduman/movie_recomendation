import { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, query, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { mediaCollection } from '../utils/media';

export function useMovieFans(movieId, mediaType = 'movie') {
  const [fans, setFans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!movieId) { setLoading(false); return; }
    const q = query(
      collection(db, mediaCollection(mediaType), String(movieId), 'likedBy'),
      orderBy('likedAt', 'desc'),
      limit(20),
    );
    const unsub = onSnapshot(q, (snap) => {
      setFans(snap.docs.map((d) => ({ uid: d.id, ...d.data() })));
      setLoading(false);
    }, () => { setFans([]); setLoading(false); });
    return () => unsub();
  }, [movieId, mediaType]);

  return { fans, loading };
}
