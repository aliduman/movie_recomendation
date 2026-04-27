import { motion } from 'framer-motion';
import MovieCard from './MovieCard';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const GRID_CLASSES = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4';

function SkeletonCard({ className = '' }) {
  return <div className={`aspect-[2/3] rounded-2xl bg-dark animate-pulse skeleton-shimmer ${className}`} />;
}

export default function MovieGrid({ movies, loading, loadingMore = false }) {
  if (loading) {
    return (
      <div className={GRID_CLASSES}>
        {Array.from({ length: 10 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!movies.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-20 text-gray-500"
      >
        <span className="text-5xl block mb-4">🍿</span>
        <p>Henüz film bulunamadı. Bir tür seçmeyi dene!</p>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={GRID_CLASSES}
      >
        {movies.map((movie, i) => (
          <MovieCard key={movie.id} movie={movie} tourId={i === 0 ? 'movie-card' : undefined} />
        ))}
      </motion.div>

      {loadingMore && (
        <div className={`pt-6 ${GRID_CLASSES}`}>
          <SkeletonCard />
          <SkeletonCard className="hidden sm:block" />
          <SkeletonCard className="hidden md:block" />
          <SkeletonCard className="hidden lg:block" />
          <SkeletonCard className="hidden lg:block" />
        </div>
      )}
    </>
  );
}

