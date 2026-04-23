import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiStar, FiClock, FiCalendar, FiArrowLeft, FiTv } from 'react-icons/fi';
import { useMovieDetail } from '../hooks/useMovies';
import { useFavorites } from '../hooks/useFavorites';
import { backdrop, poster, profile } from '../config/tmdb';
import MovieCard from '../components/MovieCard';
import WatchProvidersModal from '../components/WatchProvidersModal';
import MovieComments from '../components/MovieComments';

export default function MovieDetailPage() {
  const { id } = useParams();
  const { movie, credits, similar, loading } = useMovieDetail(id);
  const { toggleFavorite, isFavorite } = useFavorites();
  const [watchOpen, setWatchOpen] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);

  if (loading || !movie) {
    return (
      <div className="pt-24 flex justify-center">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const fav = isFavorite(movie.id);
  const director = credits?.crew?.find((c) => c.job === 'Director');
  const cast = credits?.cast?.slice(0, 6) || [];
  const trailer = movie.videos?.results?.find((v) => v.type === 'Trailer' && v.site === 'YouTube');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* Backdrop */}
      <div className="relative h-[60vh] overflow-hidden">
        <img src={backdrop(movie.backdrop_path)} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-darker via-darker/70 to-transparent" />
        <Link
          to="/"
          className="absolute top-20 left-4 z-10 flex items-center gap-2 glass px-4 py-2 rounded-xl text-sm hover:bg-white/10 transition-colors"
        >
          <FiArrowLeft size={16} /> Geri
        </Link>
      </div>

      {/* Detail */}
      <div className="max-w-7xl mx-auto px-4 -mt-40 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-shrink-0"
          >
            <img
              src={poster(movie.poster_path)}
              alt={movie.title}
              className="w-64 rounded-2xl shadow-2xl shadow-primary/10"
            />
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex-1"
          >
            <h1 className="text-3xl sm:text-5xl font-extrabold">{movie.title}</h1>
            {movie.tagline && (
              <p className="text-primary/80 italic mt-2">"{movie.tagline}"</p>
            )}

            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-300">
              <span className="flex items-center gap-1 text-secondary">
                <FiStar className="fill-secondary" /> {movie.vote_average?.toFixed(1)}
              </span>
              <span className="flex items-center gap-1">
                <FiClock size={14} /> {movie.runtime} dk
              </span>
              <span className="flex items-center gap-1">
                <FiCalendar size={14} /> {movie.release_date?.slice(0, 4)}
              </span>
              {director && <span>🎬 {director.name}</span>}
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {movie.genres?.map((g) => (
                <span key={g.id} className="px-3 py-1 rounded-full glass text-xs">{g.name}</span>
              ))}
            </div>

            <p className="mt-6 text-gray-300 leading-relaxed">{movie.overview}</p>

            {/* Butonlar */}
            <div className="flex flex-wrap items-center gap-3 mt-6">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleFavorite(movie)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors ${
                  fav
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'glass hover:bg-white/10'
                }`}
              >
                <FiHeart className={fav ? 'fill-red-400' : ''} />
                {fav ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
              </motion.button>

              {trailer && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setTrailerOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/80 rounded-xl font-semibold transition-colors"
                >
                  ▶ Fragman
                </motion.button>
              )}

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setWatchOpen(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold glass hover:bg-white/10 transition-colors"
              >
                <FiTv size={18} />
                Nereden İzlerim?
              </motion.button>
            </div>

            {/* Oyuncular */}
            {cast.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-bold mb-3">🎭 Oyuncular</h3>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {cast.map((c) => (
                    <Link key={c.id} to={`/person/${c.id}`} className="flex-shrink-0 text-center w-20 hover:opacity-90 transition-opacity">
                      {c.profile_path ? (
                        <img
                          src={profile(c.profile_path)}
                          alt={c.name}
                          className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-white/10"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-dark flex items-center justify-center mx-auto text-xl">🎭</div>
                      )}
                      <p className="text-xs mt-1 line-clamp-1">{c.name}</p>
                      <p className="text-[10px] text-gray-500 line-clamp-1">{c.character}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        <MovieComments movieId={movie.id} />

        {/* Benzer Filmler */}
        {similar.length > 0 && (
          <section className="mt-16 pb-12">
            <h2 className="text-xl font-bold mb-6">🎯 Benzer Filmler</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {similar.map((m, i) => (
                <MovieCard key={m.id} movie={m} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>

      <AnimatePresence>
        {watchOpen && <WatchProvidersModal movie={movie} onClose={() => setWatchOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {trailerOpen && trailer && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setTrailerOpen(false)}
          >
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
            <motion.div
              className="relative w-full max-w-4xl"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl">
                <iframe
                  src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
                  title={`${movie.title} Fragman`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              <button
                onClick={() => setTrailerOpen(false)}
                className="absolute -top-10 right-0 text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1"
              >
                ✕ Kapat
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
