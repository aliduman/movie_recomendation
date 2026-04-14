import { useState, useEffect, useCallback } from 'react';
import tmdb from '../config/tmdb';

/* TMDB tür ID'leri */
export const GENRES = [
  { id: 28, name: 'Aksiyon', emoji: '💥' },
  { id: 35, name: 'Komedi', emoji: '😂' },
  { id: 18, name: 'Dram', emoji: '🎭' },
  { id: 27, name: 'Korku', emoji: '👻' },
  { id: 878, name: 'Bilim Kurgu', emoji: '🚀' },
  { id: 10749, name: 'Romantik', emoji: '💕' },
  { id: 16, name: 'Animasyon', emoji: '🎨' },
  { id: 53, name: 'Gerilim', emoji: '😰' },
  { id: 99, name: 'Belgesel', emoji: '📚' },
  { id: 14, name: 'Fantastik', emoji: '🧙' },
  { id: 80, name: 'Suç', emoji: '🔪' },
  { id: 36, name: 'Tarih', emoji: '🏛️' },
];

export function useMovies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const fetchTrending = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await tmdb.get('/trending/movie/week');
      setMovies(data.results);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByGenre = useCallback(async (genreId, pageNum = 1) => {
    setLoading(true);
    try {
      const { data } = await tmdb.get('/discover/movie', {
        params: {
          with_genres: genreId,
          sort_by: 'popularity.desc',
          page: pageNum,
        },
      });
      if (pageNum === 1) {
        setMovies(data.results);
      } else {
        setMovies((prev) => [...prev, ...data.results]);
      }
      setPage(pageNum);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  const searchMovies = useCallback(async (query) => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const { data } = await tmdb.get('/search/movie', { params: { query } });
      setMovies(data.results);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  return { movies, loading, page, fetchTrending, fetchByGenre, searchMovies };
}

export function useMovieDetail(id) {
  const [movie, setMovie] = useState(null);
  const [credits, setCredits] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      tmdb.get(`/movie/${id}`, { params: { append_to_response: 'videos' } }),
      tmdb.get(`/movie/${id}/credits`),
      tmdb.get(`/movie/${id}/similar`),
    ])
      .then(([movieRes, creditsRes, similarRes]) => {
        setMovie(movieRes.data);
        setCredits(creditsRes.data);
        setSimilar(similarRes.data.results.slice(0, 8));
      })
      .finally(() => setLoading(false));
  }, [id]);

  return { movie, credits, similar, loading };
}

