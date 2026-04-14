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
      return undefined;
    }

    // Eski localStorage verisini tek seferlik Firestore'a taşır.
    const legacyKey = `movie_favorites_${user.uid}`;
    const legacy = JSON.parse(localStorage.getItem(legacyKey) || '[]');
    if (legacy.length > 0) {
      legacy.forEach((movie) => {
        const ref = doc(db, 'users', user.uid, 'favorites', String(movie.id));
        setDoc(
          ref,
          {
            ...movie,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
      });
      localStorage.removeItem(legacyKey);
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
      },
      () => {
        setFavorites([]);
      },
    );

    return () => unsub();
  }, [db, readGuestFavorites, user]);

  const toggleFavorite = useCallback(
    async (movie) => {
      const exists = favorites.some((f) => f.id === movie.id);

      if (!user) {
        if (exists) {
          writeGuestFavorites(favorites.filter((f) => f.id !== movie.id));
        } else {
          writeGuestFavorites([
            ...favorites,
            {
              id: movie.id,
              title: movie.title,
              poster_path: movie.poster_path,
              vote_average: movie.vote_average,
            },
          ]);
        }
        return;
      }

      const ref = doc(db, 'users', user.uid, 'favorites', String(movie.id));
      if (exists) {
        await deleteDoc(ref);
      } else {
        await setDoc(ref, {
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          vote_average: movie.vote_average,
          updatedAt: serverTimestamp(),
        });
      }
    },
    [db, favorites, user, writeGuestFavorites],
  );

  const isFavorite = (id) => favorites.some((f) => f.id === id);

  return { favorites, toggleFavorite, isFavorite };
}

