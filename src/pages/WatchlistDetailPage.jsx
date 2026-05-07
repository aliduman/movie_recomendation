import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import MovieCard from '../components/MovieCard';
import { poster } from '../config/tmdb';
import { useWatchlistDetail } from '../hooks/useWatchlist';

export default function WatchlistDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { watchlist, movies, loading } = useWatchlistDetail(id);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-darker">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!watchlist) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="pt-24 pb-12 max-w-5xl mx-auto px-4"
      >
        <Link
          to="/watchlist"
          className="inline-flex items-center gap-2 rounded-2xl glass px-4 py-2 text-sm hover:bg-white/10 transition-colors"
        >
          <FiArrowLeft size={16} />
          {t('watchlist.backToLists')}
        </Link>

        <div className="mt-10 rounded-[2rem] border border-dashed border-white/10 bg-white/5 py-20 text-center">
          <div className="text-5xl mb-4">🫥</div>
          <p className="text-lg text-gray-300">{t('watchlist.notFound')}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-24 pb-12 max-w-7xl mx-auto px-4"
    >
      <Link
        to="/watchlist"
        className="inline-flex items-center gap-2 rounded-2xl glass px-4 py-2 text-sm hover:bg-white/10 transition-colors"
      >
        <FiArrowLeft size={16} />
        {t('watchlist.backToLists')}
      </Link>

      <div className="mt-6 overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80">
        <div className="relative h-64 sm:h-72 bg-dark overflow-hidden">
          {watchlist.coverPosterPath ? (
            <>
              <img
                src={poster(watchlist.coverPosterPath)}
                alt={watchlist.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-darker via-darker/70 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-purple-500/10 to-darker flex items-center justify-center text-6xl">
              🎞️
            </div>
          )}
        </div>

        <div className="relative -mt-20 px-6 pb-6 sm:px-8 sm:pb-8">
          <div className="glass rounded-[2rem] border border-white/10 p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.25em] text-primary/80">{t('watchlist.detailLabel')}</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold">{watchlist.name}</h1>
            <p className="mt-3 text-gray-400">{t('watchlist.movieCount', { count: movies.length })}</p>
          </div>
        </div>
      </div>

      {movies.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-6xl block mb-4">🍿</span>
          <p className="text-gray-400 text-lg">{t('watchlist.detailEmpty')}</p>
        </div>
      ) : (
        <section className="mt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {movies.map((movie) => (
              <MovieCard key={movie.docId || movie.id} movie={movie} />
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}
