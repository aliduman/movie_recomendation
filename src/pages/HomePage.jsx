import { useEffect } from 'react';
import { motion } from 'framer-motion';
import HeroSection from '../components/HeroSection';
import MovieGrid from '../components/MovieGrid';
import { useMovies } from '../hooks/useMovies';

export default function HomePage() {
  const { movies, loading, fetchTrending } = useMovies();

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <HeroSection />

      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">🔥 Bu Hafta Trend</h2>
        <MovieGrid movies={movies} loading={loading} />
      </section>
    </motion.div>
  );
}

