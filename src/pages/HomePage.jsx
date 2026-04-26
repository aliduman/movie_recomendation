import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import HeroSection from '../components/HeroSection';
import MovieGrid from '../components/MovieGrid';
import { useMovies } from '../hooks/useMovies';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

export default function HomePage() {
  const { movies, loading, loadingMore, hasMore, fetchTrending, loadMore } = useMovies();
  const [autoLoadEnabled, setAutoLoadEnabled] = useState(false);

  const sentinelRef = useInfiniteScroll({
    enabled: autoLoadEnabled && hasMore && !loading && !loadingMore,
    onLoadMore: loadMore,
  });

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  const startInfiniteScroll = () => {
    setAutoLoadEnabled(true);
    loadMore();
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <HeroSection />

      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">🔥 Bu Hafta Trend</h2>
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
      </section>
    </motion.div>
  );
}

