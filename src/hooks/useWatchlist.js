import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';

export function useWatchlist() {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setWatchlist([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);

    const watchlistRef = collection(db, 'users', user.uid, 'watchlist');
    const q = query(watchlistRef, orderBy('addedAt', 'desc'));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((item) => ({
          id: Number(item.id),
          ...item.data(),
        }));
        setWatchlist(list);
        setLoading(false);
      },
      () => {
        setWatchlist([]);
        setLoading(false);
      },
    );

    return () => unsub();
  }, [user]);

  const toggleWatchlist = useCallback(
    async (movie) => {
      if (!user) return;

      const exists = watchlist.some((m) => m.id === movie.id);
      const ref = doc(db, 'users', user.uid, 'watchlist', String(movie.id));

      const payload = {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        ...(movie.genre_ids?.length ? { genre_ids: movie.genre_ids } : {}),
      };

      if (exists) {
        await deleteDoc(ref);
      } else {
        await setDoc(ref, { ...payload, addedAt: serverTimestamp() });
      }
    },
    [watchlist, user],
  );

  const isInWatchlist = useCallback(
    (id) => watchlist.some((m) => m.id === id),
    [watchlist],
  );

  return { watchlist, loading, toggleWatchlist, isInWatchlist };
}
