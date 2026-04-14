import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GenreSelector from '../components/GenreSelector';
import SearchBar from '../components/SearchBar';
import MovieGrid from '../components/MovieGrid';
import { useMovies, GENRES } from '../hooks/useMovies';

export default function ExplorePage() {
  const [selectedGenre, setSelectedGenre] = useState(GENRES[0].id);
  const { movies, loading, fetchByGenre, searchMovies } = useMovies();
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!isSearching) fetchByGenre(selectedGenre);
  }, [selectedGenre, isSearching, fetchByGenre]);

  const handleGenre = useCallback((id) => {
    setIsSearching(false);
    setSelectedGenre(id);
  }, []);

  const handleSearch = useCallback(
    (query) => {
      if (!query) {
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      searchMovies(query);
    },
    [searchMovies],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
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

      <MovieGrid movies={movies} loading={loading} />
    </motion.div>
  );
}

