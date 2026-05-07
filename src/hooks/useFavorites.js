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
import { getMediaType, getReleaseDate, getTitle, mediaCollection, mediaDocId, parseMediaDocId } from '../utils/media';

const GUEST_KEY = 'movie_favorites_guest';

// Build the persisted shape for a favorite. We persist title fields under
// both `title` and `name` so legacy movie-only consumers keep working while
// TV-aware consumers can use the original field.
function buildPayload(movie) {
  const mediaType = getMediaType(movie);
  return {
    id: movie.id,
    media_type: mediaType,
    title: getTitle(movie),
    name: movie.name || null,
    poster_path: movie.poster_path,
    vote_average: movie.vote_average,
    release_date: getReleaseDate(movie) || null,
    ...(movie.genre_ids?.length ? { genre_ids: movie.genre_ids } : {}),
  };
}

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const readGuestFavorites = useCallback(() => {
    const list = JSON.parse(localStorage.getItem(GUEST_KEY) || '[]');
    return list.map((f) => ({
      ...f,
      media_type: f.media_type || 'movie',
      docId: f.docId || mediaDocId(f.id, f.media_type || 'movie'),
    }));
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

    // Legacy localStorage → Firestore migration. Pre-existing entries are
    // assumed to be movies (the only thing the app supported before).
    const legacyKey = `movie_favorites_${user.uid}`;
    const legacy = JSON.parse(localStorage.getItem(legacyKey) || '[]');
    const guest = readGuestFavorites();
    const toMigrate = [...legacy, ...guest];

    if (toMigrate.length > 0) {
      Promise.all(
        toMigrate.map((movie) => {
          const item = { ...movie, media_type: movie.media_type || 'movie' };
          const ref = doc(db, 'users', user.uid, 'favorites', mediaDocId(item.id, item.media_type));
          return setDoc(
            ref,
            {
              ...buildPayload(item),
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
        const list = snapshot.docs.map((item) => {
          const data = item.data();
          const parsed = parseMediaDocId(item.id);
          const mediaType = data.media_type || parsed.mediaType;
          return {
            ...data,
            id: data.id ?? parsed.id,
            media_type: mediaType,
            docId: item.id,
          };
        });
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
      const mediaType = getMediaType(movie);
      const docId = mediaDocId(movie.id, mediaType);
      const exists = favorites.some((f) => f.docId === docId);
      const payload = buildPayload(movie);

      if (!user) {
        if (exists) {
          writeGuestFavorites(favorites.filter((f) => f.docId !== docId));
        } else {
          writeGuestFavorites([...favorites, { ...payload, docId }]);
        }
        return;
      }

      const ref = doc(db, 'users', user.uid, 'favorites', docId);
      const fanRef = doc(db, mediaCollection(mediaType), String(movie.id), 'likedBy', user.uid);
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

  // Accepts either a docId string ("123" or "tv_456") or a numeric id (legacy
  // movie callers). Numeric callers implicitly target movies.
  const isFavorite = (idOrDocId) => {
    const docId = typeof idOrDocId === 'number' ? String(idOrDocId) : idOrDocId;
    return favorites.some((f) => f.docId === docId);
  };

  return { favorites, loading, toggleFavorite, isFavorite };
}
