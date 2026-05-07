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

const GUEST_KEY = 'movie_favorites_guest';

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const readGuestFavorites = useCallback(() => {
    return JSON.parse(localStorage.getItem(GUEST_KEY) || '[]');
  }, []);

  const writeGuestFavorites = useCallback((list) => {
    localStorage.setItem(GUEST_KEY, JSON.stringify(list));
    setFavorites(list);
  }, []);

  useEffect(() => {
    if (!user) {
      setFavorites(readGuestFavorites());
      setLoading(false);
      return undefined;
    }

    setLoading(true);

    // Eski localStorage verisini tek seferlik Firestore'a taşır.
    const legacyKey = `movie_favorites_${user.uid}`;
    const legacy = JSON.parse(localStorage.getItem(legacyKey) || '[]');
    const guest = readGuestFavorites();
    const toMigrate = [...legacy, ...guest];

    if (toMigrate.length > 0) {
      Promise.all(
        toMigrate.map((movie) => {
          const ref = doc(db, 'users', user.uid, 'favorites', String(movie.id));
          return setDoc(
            ref,
            {
              id: movie.id,
              title: movie.title,
              poster_path: movie.poster_path,
              vote_average: movie.vote_average,
              updatedAt: serverTimestamp(),
            },
            { merge: true },
          );
        }),
      ).finally(() => {
        localStorage.removeItem(legacyKey);
        localStorage.removeItem(GUEST_KEY);
      });
    }

    const favoritesRef = collection(db, 'users', user.uid, 'favorites');
    const q = query(favoritesRef, orderBy('updatedAt', 'desc'));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((item) => ({
          id: Number(item.id),
          ...item.data(),
        }));
        setFavorites(list);
        setLoading(false);
      },
      () => {
        setFavorites([]);
        setLoading(false);
      },
    );

    return () => unsub();
  }, [readGuestFavorites, user]);

  const toggleFavorite = useCallback(
    async (movie) => {
      const exists = favorites.some((f) => f.id === movie.id);

      const payload = {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        ...(movie.genre_ids?.length ? { genre_ids: movie.genre_ids } : {}),
      };

      if (!user) {
        if (exists) {
          writeGuestFavorites(favorites.filter((f) => f.id !== movie.id));
        } else {
          writeGuestFavorites([...favorites, payload]);
        }
        return;
      }

      const ref = doc(db, 'users', user.uid, 'favorites', String(movie.id));
      const fanRef = doc(db, 'movies', String(movie.id), 'likedBy', user.uid);
      if (exists) {
        await deleteDoc(ref);
        await deleteDoc(fanRef);
      } else {
        await setDoc(ref, { ...payload, updatedAt: serverTimestamp() });
        await setDoc(fanRef, {
          uid: user.uid,
          displayName: user.displayName || user.email?.split('@')[0] || 'Kullanıcı',
          photoURL: user.photoURL || '',
          likedAt: serverTimestamp(),
        });
      }
    },
    [favorites, user, writeGuestFavorites],
  );

  const isFavorite = (id) => favorites.some((f) => f.id === id);

  return { favorites, loading, toggleFavorite, isFavorite };
}

