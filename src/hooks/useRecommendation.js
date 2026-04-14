import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import tmdb from '../config/tmdb';

const SEEN_KEY = 'wizard_seen';

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

  const storageKey = user ? `${SEEN_KEY}_${user.uid}` : `${SEEN_KEY}_guest`;

  const getSeenIds = useCallback(
    () => JSON.parse(localStorage.getItem(storageKey) || '[]'),
    [storageKey],
  );

  const addSeen = useCallback(
    (id) => {
      const current = getSeenIds();
      if (!current.includes(id)) {
        localStorage.setItem(storageKey, JSON.stringify([...current, id]));
      }
    },
    [storageKey, getSeenIds],
  );

  const clearSeen = useCallback(() => {
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  const fetchRecommendation = useCallback(
    async (moodGenres, extraGenreId = null) => {
      setLoading(true);
      setError(null);
      setResult(null);

      try {
        let seenIds = getSeenIds();

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

        // Hâlâ yoksa görülmüş listeyi sıfırla, tekrar dene
        if (available.length === 0) {
          clearSeen();
          seenIds = [];
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
        addSeen(pick.id);
        setResult(pick);
      } catch {
        setError('Film yüklenirken bir hata oluştu. Bağlantını kontrol et.');
      } finally {
        setLoading(false);
      }
    },
    [getSeenIds, addSeen, clearSeen],
  );

  return {
    result,
    loading,
    error,
    seenCount: getSeenIds().length,
    fetchRecommendation,
    clearSeen,
  };
}

