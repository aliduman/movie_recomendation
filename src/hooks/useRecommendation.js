import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import tmdb from '../config/tmdb';
import { db } from '../config/firebase';

const SEEN_KEY = 'wizard_seen_guest';

function readGuestHistory() {
  return JSON.parse(localStorage.getItem(SEEN_KEY) || '{}');
}

function writeGuestHistory(history) {
  localStorage.setItem(SEEN_KEY, JSON.stringify(history));
}

function upsertGuestRecommendation(movie, moodId, genreId) {
  const movieId = String(movie.id);
  const current = readGuestHistory();
  const prev = current[movieId];
  const nextCount = (prev?.recommendedCount || 0) + 1;

  current[movieId] = {
    movieId: movie.id,
    title: movie.title,
    poster_path: movie.poster_path || null,
    recommendedCount: nextCount,
    lastMoodId: moodId || null,
    lastGenreId: genreId || null,
    lastRecommendedAt: Date.now(),
  };

  writeGuestHistory(current);

  return {
    history: current,
    wasRecommendedBefore: Boolean(prev),
    recommendedCount: nextCount,
  };
}

export const MOODS = [
  {
    id: 'happy',
    label: 'Mutlu & Neşeli',
    emoji: '😄',
    desc: 'Güldürsün, iyi hissettirsin',
    genres: [35, 16, 12],
    color: 'from-yellow-500/20 to-orange-500/20',
    border: 'hover:border-yellow-500/50',
  },
  {
    id: 'excited',
    label: 'Heyecan İstiyorum',
    emoji: '🤩',
    desc: 'Aksiyon, gerilim, nefes kesici',
    genres: [28, 53, 12],
    color: 'from-red-500/20 to-pink-500/20',
    border: 'hover:border-red-500/50',
  },
  {
    id: 'emotional',
    label: 'Duygusal',
    emoji: '🥺',
    desc: 'Derin bir hikaye, dokunsun',
    genres: [18, 10749],
    color: 'from-blue-500/20 to-indigo-500/20',
    border: 'hover:border-blue-500/50',
  },
  {
    id: 'scary',
    label: 'Korku Gecesi',
    emoji: '👻',
    desc: 'Korkutulsun, gerilimli olsun',
    genres: [27, 53],
    color: 'from-purple-900/30 to-gray-900/30',
    border: 'hover:border-purple-500/50',
  },
  {
    id: 'thoughtful',
    label: 'Düşündürsün',
    emoji: '🤔',
    desc: 'Belgesel, tarih, derin dramalar',
    genres: [99, 18, 36],
    color: 'from-teal-500/20 to-cyan-500/20',
    border: 'hover:border-teal-500/50',
  },
  {
    id: 'adventure',
    label: 'Macera',
    emoji: '🧭',
    desc: 'Yeni dünyalar, fantastik yolculuklar',
    genres: [12, 878, 14],
    color: 'from-green-500/20 to-emerald-500/20',
    border: 'hover:border-green-500/50',
  },
  {
    id: 'romantic',
    label: 'Romantik',
    emoji: '💕',
    desc: 'Aşk, tutku ve güzel anlar',
    genres: [10749, 18],
    color: 'from-pink-500/20 to-rose-500/20',
    border: 'hover:border-pink-500/50',
  },
  {
    id: 'crime',
    label: 'Suç & Gizem',
    emoji: '🕵️',
    desc: 'Dedektif, gizem, suç dünyası',
    genres: [80, 53],
    color: 'from-gray-600/20 to-slate-700/20',
    border: 'hover:border-gray-400/50',
  },
];

export function useRecommendation() {
  const { user } = useAuth();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [historyMap, setHistoryMap] = useState({});

  useEffect(() => {
    if (!user) {
      setHistoryMap(readGuestHistory());
      return undefined;
    }

    const historyRef = collection(db, 'users', user.uid, 'recommendations');
    const unsub = onSnapshot(
      historyRef,
      (snapshot) => {
        const next = {};
        snapshot.docs.forEach((item) => {
          next[item.id] = item.data();
        });
        setHistoryMap(next);
      },
      (err) => {
        // Firestore dinleme engellenirse sihirbazı guest modunda çalıştır.
        console.warn('Recommendation history listener failed:', err?.code || err?.message);
        setHistoryMap(readGuestHistory());
      },
    );

    return () => unsub();
  }, [user]);

  const seenIds = useMemo(
    () => Object.keys(historyMap).map((id) => Number(id)),
    [historyMap],
  );

  const registerRecommendation = useCallback(
    async (movie, moodId, genreId) => {
      const movieId = String(movie.id);

      if (!user) {
        const guestMeta = upsertGuestRecommendation(movie, moodId, genreId);
        setHistoryMap(guestMeta.history);

        return {
          wasRecommendedBefore: guestMeta.wasRecommendedBefore,
          recommendedCount: guestMeta.recommendedCount,
        };
      }

      try {
        const ref = doc(db, 'users', user.uid, 'recommendations', movieId);
        const snap = await getDoc(ref);
        const prevData = snap.exists() ? snap.data() : null;
        const nextCount = (prevData?.recommendedCount || 0) + 1;

        await setDoc(
          ref,
          {
            movieId: movie.id,
            title: movie.title,
            poster_path: movie.poster_path || null,
            recommendedCount: nextCount,
            lastMoodId: moodId || null,
            lastGenreId: genreId || null,
            lastRecommendedAt: serverTimestamp(),
          },
          { merge: true },
        );

        return {
          wasRecommendedBefore: Boolean(prevData),
          recommendedCount: nextCount,
        };
      } catch (err) {
        // Firestore yazma hatasında film önerisini düşürme, local fallback kullan.
        console.warn('Recommendation persist failed, fallback guest history:', err?.code || err?.message);
        const guestMeta = upsertGuestRecommendation(movie, moodId, genreId);
        setHistoryMap(guestMeta.history);
        return {
          wasRecommendedBefore: guestMeta.wasRecommendedBefore,
          recommendedCount: guestMeta.recommendedCount,
        };
      }
    },
    [user],
  );

  const clearSeen = useCallback(async () => {
    if (!user) {
      localStorage.removeItem(SEEN_KEY);
      setHistoryMap({});
      return;
    }

    try {
      const historyRef = collection(db, 'users', user.uid, 'recommendations');
      const snapshot = await getDocs(historyRef);
      await Promise.all(snapshot.docs.map((item) => deleteDoc(item.ref)));
    } catch (err) {
      console.warn('Recommendation clear failed, clearing guest history instead:', err?.code || err?.message);
      localStorage.removeItem(SEEN_KEY);
      setHistoryMap({});
    }
  }, [user]);

  const fetchRecommendation = useCallback(
    async (moodGenres, extraGenreId = null, moodId = null) => {
      setLoading(true);
      setError(null);
      setResult(null);

      try {
        // Genre: extraGenreId varsa onu, yoksa mood'dan rastgele biri
        const primaryGenre =
          extraGenreId ||
          moodGenres[Math.floor(Math.random() * moodGenres.length)];

        let available = [];
        let triedPages = new Set();

        // En fazla 4 sayfa dene
        while (available.length === 0 && triedPages.size < 4) {
          let page;
          do {
            page = Math.floor(Math.random() * 5) + 1;
          } while (triedPages.has(page));
          triedPages.add(page);

          const { data } = await tmdb.get('/discover/movie', {
            params: {
              with_genres: primaryGenre,
              sort_by: 'popularity.desc',
              'vote_count.gte': 80,
              page,
            },
          });
          available = data.results.filter((m) => !seenIds.includes(m.id));
        }

        // Hâlâ yoksa eski önerilere de izin ver.
        if (available.length === 0) {
          const { data } = await tmdb.get('/discover/movie', {
            params: {
              with_genres: primaryGenre,
              sort_by: 'popularity.desc',
              'vote_count.gte': 80,
              page: 1,
            },
          });
          available = data.results;
        }

        if (available.length === 0) {
          setError('Bu kombinasyon için uygun film bulunamadı. Farklı bir ruh hali seç!');
          return;
        }

        const pick = available[Math.floor(Math.random() * available.length)];
        const recommendationMeta = await registerRecommendation(
          pick,
          moodId,
          primaryGenre,
        );

        setResult({
          ...pick,
          _wasRecommendedBefore: recommendationMeta.wasRecommendedBefore,
          _recommendedCount: recommendationMeta.recommendedCount,
        });
      } catch (err) {
        console.error('Recommendation fetch failed:', err?.code || err?.message);
        setError('Film yüklenirken bir hata oluştu. Lütfen tekrar dene.');
      } finally {
        setLoading(false);
      }
    },
    [registerRecommendation, seenIds],
  );

  return {
    result,
    loading,
    error,
    seenCount: seenIds.length,
    fetchRecommendation,
    clearSeen,
  };
}

