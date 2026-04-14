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
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [mode, setMode] = useState('trending');
  const [selectedGenreId, setSelectedGenreId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const hasMore = page < totalPages;

  const mergeUniqueById = (prev, next) => {
    const seen = new Set(prev.map((item) => item.id));
    const filtered = next.filter((item) => !seen.has(item.id));
    return [...prev, ...filtered];
  };

  const runPagedRequest = useCallback(
    async ({ endpoint, params = {}, pageNum = 1, append = false }) => {
      if (append) setLoadingMore(true);
      else setLoading(true);

      try {
        const { data } = await tmdb.get(endpoint, {
          params: {
            ...params,
            page: pageNum,
          },
        });

        const results = data.results || [];
        setMovies((prev) => (append ? mergeUniqueById(prev, results) : results));
        setPage(pageNum);
        setTotalPages(data.total_pages || 1);
      } finally {
        if (append) setLoadingMore(false);
        else setLoading(false);
      }
    },
    [],
  );

  const fetchTrending = useCallback(async () => {
    setMode('trending');
    setSelectedGenreId(null);
    setSearchQuery('');
    await runPagedRequest({ endpoint: '/trending/movie/week', pageNum: 1 });
  }, [runPagedRequest]);

  const fetchByGenre = useCallback(async (genreId, pageNum = 1) => {
    setMode('genre');
    setSelectedGenreId(genreId);
    setSearchQuery('');
    await runPagedRequest({
      endpoint: '/discover/movie',
      params: {
        with_genres: genreId,
        sort_by: 'popularity.desc',
      },
      pageNum,
      append: pageNum > 1,
    });
  }, [runPagedRequest]);

  const searchMovies = useCallback(async (query) => {
    if (!query.trim()) return;
    setMode('search');
    setSelectedGenreId(null);
    setSearchQuery(query);
    await runPagedRequest({
      endpoint: '/search/movie',
      params: { query },
      pageNum: 1,
    });
  }, [runPagedRequest]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return;

    const nextPage = page + 1;

    if (mode === 'trending') {
      await runPagedRequest({
        endpoint: '/trending/movie/week',
        pageNum: nextPage,
        append: true,
      });
      return;
    }

    if (mode === 'genre' && selectedGenreId) {
      await runPagedRequest({
        endpoint: '/discover/movie',
        params: {
          with_genres: selectedGenreId,
          sort_by: 'popularity.desc',
        },
        pageNum: nextPage,
        append: true,
      });
      return;
    }

    if (mode === 'search' && searchQuery) {
      await runPagedRequest({
        endpoint: '/search/movie',
        params: { query: searchQuery },
        pageNum: nextPage,
        append: true,
      });
    }
  }, [hasMore, loading, loadingMore, mode, page, runPagedRequest, searchQuery, selectedGenreId]);

  return {
    movies,
    loading,
    loadingMore,
    page,
    hasMore,
    fetchTrending,
    fetchByGenre,
    searchMovies,
    loadMore,
  };
}

export function useMovieDetail(id) {
  const [movie, setMovie] = useState(null);
  const [credits, setCredits] = useState(null);
  const [providers, setProviders] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      tmdb.get(`/movie/${id}`, { params: { append_to_response: 'videos' } }),
      tmdb.get(`/movie/${id}/credits`),
      tmdb.get(`/movie/${id}/watch/providers`),
      tmdb.get(`/movie/${id}/similar`),
    ])
      .then(([movieRes, creditsRes, providersRes, similarRes]) => {
        setMovie(movieRes.data);
        setCredits(creditsRes.data);
        setProviders(providersRes.data?.results || null);
        setSimilar(similarRes.data.results.slice(0, 8));
      })
      .finally(() => setLoading(false));
  }, [id]);

  return { movie, credits, providers, similar, loading };
}

export function usePersonDetail(id) {
  const [person, setPerson] = useState(null);
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    Promise.all([
      tmdb.get(`/person/${id}`),
      tmdb.get(`/person/${id}/movie_credits`),
    ])
      .then(([personRes, creditsRes]) => {
        setPerson(personRes.data);

        const movies = (creditsRes.data?.cast || [])
          .filter((movie) => movie.poster_path)
          .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
          .slice(0, 12);

        setCredits(movies);
      })
      .finally(() => setLoading(false));
  }, [id]);

  return { person, credits, loading };
}

