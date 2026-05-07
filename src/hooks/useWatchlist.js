import { useState, useEffect, useCallback } from 'react';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { getMediaType, getReleaseDate, getTitle, mediaDocId, parseMediaDocId } from '../utils/media';

const DEFAULT_WATCHLIST_NAME = 'İzlenecekler';

function normalizeMovie(movie) {
  const genreIds = movie.genre_ids?.length
    ? movie.genre_ids
    : movie.genres?.map((genre) => genre.id).filter(Boolean) || [];

  const mediaType = getMediaType(movie);

  return {
    id: movie.id,
    media_type: mediaType,
    title: getTitle(movie),
    name: movie.name || null,
    poster_path: movie.poster_path || null,
    vote_average: movie.vote_average || 0,
    release_date: getReleaseDate(movie) || null,
    ...(genreIds.length ? { genre_ids: genreIds } : {}),
  };
}

async function migrateLegacyWatchlist(userId) {
  const watchlistsRef = collection(db, 'users', userId, 'watchlists');
  const legacyRef = collection(db, 'users', userId, 'watchlist');

  const [watchlistsSnapshot, legacySnapshot] = await Promise.all([
    getDocs(watchlistsRef),
    getDocs(legacyRef),
  ]);

  if (!legacySnapshot.size || watchlistsSnapshot.size) return;

  const watchlistDoc = doc(watchlistsRef);
  const legacyMovies = legacySnapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
  const latestMovie = legacyMovies[0] || null;
  const batch = writeBatch(db);

  batch.set(watchlistDoc, {
    name: DEFAULT_WATCHLIST_NAME,
    movieCount: legacyMovies.length,
    coverPosterPath: latestMovie?.poster_path || null,
    lastMovieTitle: latestMovie?.title || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  legacySnapshot.docs.forEach((legacyDoc) => {
    batch.set(doc(watchlistDoc, 'movies', legacyDoc.id), legacyDoc.data());
    batch.delete(legacyDoc.ref);
  });

  await batch.commit();
}

export function useWatchlists() {
  const { user } = useAuth();
  const [watchlists, setWatchlists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setWatchlists([]);
      setLoading(false);
      return undefined;
    }

    let ignore = false;
    let unsubscribe = () => {};

    const setup = async () => {
      setLoading(true);

      try {
        await migrateLegacyWatchlist(user.uid);
      } catch (error) {
        console.error('İzleme listesi migrasyonu başarısız oldu:', error);
      }

      if (ignore) return;

      const watchlistsRef = collection(db, 'users', user.uid, 'watchlists');
      const q = query(watchlistsRef, orderBy('updatedAt', 'desc'));

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (ignore) return;
          setWatchlists(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
          setLoading(false);
        },
        () => {
          if (ignore) return;
          setWatchlists([]);
          setLoading(false);
        },
      );
    };

    setup();

    return () => {
      ignore = true;
      unsubscribe();
    };
  }, [user]);

  const createWatchlist = useCallback(
    async (name) => {
      if (!user) return null;

      const trimmed = name.trim();
      if (!trimmed) {
        throw new Error('WATCHLIST_NAME_REQUIRED');
      }

      const normalizedName = trimmed.toLocaleLowerCase('tr-TR');

      const duplicate = watchlists.find(
        (watchlist) => watchlist.name.trim().toLocaleLowerCase('tr-TR') === normalizedName,
      );

      if (duplicate) {
        throw new Error('WATCHLIST_NAME_EXISTS');
      }

      const watchlistsRef = collection(db, 'users', user.uid, 'watchlists');
      const docRef = await addDoc(watchlistsRef, {
        name: trimmed,
        movieCount: 0,
        coverPosterPath: null,
        lastMovieTitle: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return docRef.id;
    },
    [user, watchlists],
  );

  const addMovieToWatchlist = useCallback(
    async (watchlistId, movie) => {
      if (!user) return { added: false };

      const watchlist = watchlists.find((item) => item.id === watchlistId);
      if (!watchlist) {
        throw new Error('WATCHLIST_NOT_FOUND');
      }

      const payload = normalizeMovie(movie);
      const watchlistRef = doc(db, 'users', user.uid, 'watchlists', watchlistId);
      const movieRef = doc(watchlistRef, 'movies', mediaDocId(payload.id, payload.media_type));
      const movieSnapshot = await getDoc(movieRef);

      if (movieSnapshot.exists()) {
        return { added: false, watchlistName: watchlist.name };
      }

      const batch = writeBatch(db);
      batch.set(movieRef, {
        ...payload,
        addedAt: serverTimestamp(),
      });
      batch.set(
        watchlistRef,
        {
          movieCount: increment(1),
          coverPosterPath: payload.poster_path,
          lastMovieTitle: payload.title,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      await batch.commit();

      return { added: true, watchlistName: watchlist.name };
    },
    [user, watchlists],
  );

  const getMovieWatchlistIds = useCallback(
    async (movieIdOrItem, mediaType) => {
      if (!user || !watchlists.length) return [];

      const docId = typeof movieIdOrItem === 'object'
        ? mediaDocId(movieIdOrItem)
        : mediaDocId(movieIdOrItem, mediaType || 'movie');

      const listIds = await Promise.all(
        watchlists.map(async (watchlist) => {
          const movieRef = doc(
            db,
            'users',
            user.uid,
            'watchlists',
            watchlist.id,
            'movies',
            docId,
          );
          const snapshot = await getDoc(movieRef);
          return snapshot.exists() ? watchlist.id : null;
        }),
      );

      return listIds.filter(Boolean);
    },
    [user, watchlists],
  );

  return {
    watchlists,
    loading,
    createWatchlist,
    addMovieToWatchlist,
    getMovieWatchlistIds,
  };
}

export function useWatchlistDetail(watchlistId) {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !watchlistId) {
      setWatchlist(null);
      setMovies([]);
      setLoading(false);
      return undefined;
    }

    let metaLoaded = false;
    let moviesLoaded = false;

    const finishLoading = () => {
      if (metaLoaded && moviesLoaded) {
        setLoading(false);
      }
    };

    setLoading(true);

    const watchlistRef = doc(db, 'users', user.uid, 'watchlists', watchlistId);
    const moviesRef = query(collection(watchlistRef, 'movies'), orderBy('addedAt', 'desc'));

    const unsubscribeWatchlist = onSnapshot(
      watchlistRef,
      (snapshot) => {
        setWatchlist(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null);
        metaLoaded = true;
        finishLoading();
      },
      () => {
        setWatchlist(null);
        metaLoaded = true;
        finishLoading();
      },
    );

    const unsubscribeMovies = onSnapshot(
      moviesRef,
      (snapshot) => {
        setMovies(
          snapshot.docs.map((item) => {
            const data = item.data();
            const parsed = parseMediaDocId(item.id);
            return {
              ...data,
              id: data.id ?? parsed.id,
              media_type: data.media_type || parsed.mediaType,
              docId: item.id,
            };
          }),
        );
        moviesLoaded = true;
        finishLoading();
      },
      () => {
        setMovies([]);
        moviesLoaded = true;
        finishLoading();
      },
    );

    return () => {
      unsubscribeWatchlist();
      unsubscribeMovies();
    };
  }, [user, watchlistId]);

  return { watchlist, movies, loading };
}
