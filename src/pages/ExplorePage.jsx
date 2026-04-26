import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GenreSelector from '../components/GenreSelector';
import SearchBar from '../components/SearchBar';
import MovieGrid from '../components/MovieGrid';
import { useMovies, GENRES } from '../hooks/useMovies';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

export default function ExplorePage() {
  const [selectedGenre, setSelectedGenre] = useState(GENRES[0].id);
  const [autoLoadEnabled, setAutoLoadEnabled] = useState(false);
  const {
    movies,
    loading,
    loadingMore,
    hasMore,
    fetchByGenre,
    searchMovies,
    loadMore,
  } = useMovies();
  const [isSearching, setIsSearching] = useState(false);

  const sentinelRef = useInfiniteScroll({
    enabled: autoLoadEnabled && hasMore && !loading && !loadingMore,
    onLoadMore: loadMore,
  });

  useEffect(() => {
    if (!isSearching) fetchByGenre(selectedGenre);
  }, [selectedGenre, isSearching, fetchByGenre]);

  const handleGenre = useCallback((id) => {
    setIsSearching(false);
    setAutoLoadEnabled(false);
    setSelectedGenre(id);
  }, []);

  const handleSearch = useCallback(
    (query) => {
      if (!query) {
        setIsSearching(false);
        setAutoLoadEnabled(false);
        return;
      }
      setIsSearching(true);
      setAutoLoadEnabled(false);
      searchMovies(query);
    },
    [searchMovies],
  );

  const startInfiniteScroll = () => {
    setAutoLoadEnabled(true);
    loadMore();
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-24 pb-12 max-w-7xl mx-auto px-4"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
          🎯 Film Keşfet
        </h1>
        <p className="text-gray-400">Ruh haline göre mükemmel filmi bul</p>
      </div>

      <div className="space-y-6 mb-10">
        <SearchBar onSearch={handleSearch} />
        {!isSearching && (
          <GenreSelector selected={selectedGenre} onSelect={handleGenre} />
        )}
      </div>

      <MovieGrid movies={movies} loading={loading} loadingMore={loadingMore} />

      {hasMore && !autoLoadEnabled && (
        <div className="flex justify-center pt-6">
          <button
            type="button"
            onClick={startInfiniteScroll}
            className="glass px-5 py-2 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Daha fazla film gör
          </button>
        </div>
      )}

      {hasMore && autoLoadEnabled && <div ref={sentinelRef} className="h-10" />}
    </motion.div>
  );
}

