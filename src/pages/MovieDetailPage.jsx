import { useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiStar, FiClock, FiCalendar, FiArrowLeft, FiTv, FiShare2, FiExternalLink, FiBookmark } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { useMovieDetail } from '../hooks/useMovies';
import { useFavorites } from '../hooks/useFavorites';
import { useMovieFans } from '../hooks/useMovieFans';
import { useAuth } from '../contexts/AuthContext';
import { backdrop, poster, profile } from '../config/tmdb';
import { getReleaseDate, getTitle, mediaDocId } from '../utils/media';
import MovieCard from '../components/MovieCard';
import WatchProvidersModal from '../components/WatchProvidersModal';
import MovieComments from '../components/MovieComments';
import MovieChat from '../components/MovieChat';
import ShareModal from '../components/ShareModal';
import WatchlistSelector from '../components/WatchlistSelector';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

export default function MovieDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const mediaType = location.pathname.startsWith('/tv/') ? 'tv' : 'movie';
  const { movie, credits, similar, similarHasMore, loadingMoreSimilar, loadMoreSimilar, loading } = useMovieDetail(id, mediaType);
  const { toggleFavorite, isFavorite } = useFavorites();
  const { fans } = useMovieFans(id, mediaType);
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [watchOpen, setWatchOpen] = useState(false);
  const [watchlistSelectorOpen, setWatchlistSelectorOpen] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [playOpen, setPlayOpen] = useState(false);
  const [infiniteScrollActive, setInfiniteScrollActive] = useState(false);

  const sentinelRef = useInfiniteScroll({
    enabled: infiniteScrollActive && similarHasMore && !loadingMoreSimilar,
    onLoadMore: loadMoreSimilar,
  });

  if (loading || !movie) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-darker">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const fav = isFavorite(mediaDocId(movie.id, mediaType));
  const title = getTitle(movie);
  const releaseYear = getReleaseDate(movie).slice(0, 4);
  const runtime = mediaType === 'tv' ? movie.episode_run_time?.[0] : movie.runtime;
  const director = credits?.crew?.find((c) => c.job === 'Director');
  const creator = movie.created_by?.[0];
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
          <FiArrowLeft size={16} /> {t('movie.back')}
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
              alt={title}
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
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl sm:text-5xl font-extrabold">{title}</h1>
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${
                  mediaType === 'tv'
                    ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40'
                    : 'bg-primary/30 text-primary border border-primary/40'
                }`}
              >
                {t(mediaType === 'tv' ? 'badge.tv' : 'badge.movie')}
              </span>
            </div>
            {movie.tagline && (
              <p className="text-primary/80 italic mt-2">"{movie.tagline}"</p>
            )}

            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-300">
              <span className="flex items-center gap-1 text-secondary">
                <FiStar className="fill-secondary" /> {movie.vote_average?.toFixed(1)}
              </span>
              {runtime ? (
                <span className="flex items-center gap-1">
                  <FiClock size={14} /> {runtime} dk
                </span>
              ) : null}
              {mediaType === 'tv' && movie.number_of_seasons ? (
                <span className="flex items-center gap-1">
                  📺 {movie.number_of_seasons} sezon · {movie.number_of_episodes} bölüm
                </span>
              ) : null}
              {releaseYear && (
                <span className="flex items-center gap-1">
                  <FiCalendar size={14} /> {releaseYear}
                </span>
              )}
              {director && <span>🎬 {director.name}</span>}
              {!director && creator && <span>🎬 {creator.name}</span>}
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
                onClick={() => {
                  if (!user) { navigate('/login'); return; }
                  toggleFavorite(movie);
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors ${
                  fav
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'glass hover:bg-white/10'
                }`}
              >
                <FiHeart className={fav ? 'fill-red-400' : ''} />
                {fav ? t('movie.removeFavorite') : t('movie.addFavorite')}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  if (!user) { navigate('/login'); return; }
                  setWatchlistSelectorOpen(true);
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors glass hover:bg-white/10"
              >
                <FiBookmark />
                {t('movie.addWatchlist')}
              </motion.button>

              {trailer && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setTrailerOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/80 rounded-xl font-semibold transition-colors"
                >
                  ▶ {t('movie.trailer')}
                </motion.button>
              )}

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setWatchOpen(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold glass hover:bg-white/10 transition-colors"
              >
                <FiTv size={18} />
                {t('movie.whereToWatch')}
              </motion.button>

              {movie.imdb_id && (
                <>
                  <motion.a
                    whileTap={{ scale: 0.9 }}
                    href={`https://www.imdb.com/title/${movie.imdb_id}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-colors"
                    style={{ background: '#F5C518', color: '#000' }}
                  >
                    <span className="font-black text-sm leading-none">IMDb</span>
                    <FiExternalLink size={15} />
                  </motion.a>

                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setPlayOpen(true)}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-white transition-colors"
                    style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)' }}
                  >
                    ▶ {t('movie.watch')}
                  </motion.button>
                </>
              )}

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShareOpen(true)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold glass hover:bg-white/10 transition-colors"
              >
                <FiShare2 size={18} />
                {t('movie.share')}
              </motion.button>
            </div>

            {/* Oyuncular */}
            {cast.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-bold mb-3">🎭 {t('movie.cast')}</h3>
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

        {/* Bu filmi beğenenler */}
        {fans.length > 0 && (
          <section className="mt-12">
            <h3 className="text-lg font-bold mb-4">❤️ {t('movie.fans')}
              <span className="ml-2 text-sm font-normal text-gray-500">{fans.length} {t('movie.people')}</span>
            </h3>
            <div className="flex flex-wrap gap-3">
              {fans.map((fan) => (
                <Link key={fan.uid} to={`/profile/${fan.uid}`} title={fan.displayName}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl glass hover:bg-white/10 transition-colors">
                  {fan.photoURL ? (
                    <img src={fan.photoURL} alt={fan.displayName} className="w-7 h-7 rounded-full border border-white/10 flex-shrink-0" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs flex-shrink-0">👤</div>
                  )}
                  <span className="text-sm text-gray-300">{fan.displayName}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <MovieComments movieId={movie.id} movieTitle={title} mediaType={mediaType} />

        {/* Benzer Filmler */}
        {similar.length > 0 && (
          <section className="mt-16 pb-12">
            <h2 className="text-xl font-bold mb-6">🎯 {t('movie.similar')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {similar.map((m) => (
                <MovieCard key={m.id} movie={m} />
              ))}
            </div>

            {/* Daha fazla / infinite scroll */}
            {similarHasMore && !infiniteScrollActive && (
              <div className="flex justify-center mt-8">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setInfiniteScrollActive(true);
                    loadMoreSimilar();
                  }}
                  className="px-8 py-3 rounded-xl glass hover:bg-white/10 font-semibold transition-colors"
                >
                  {t('explore.loadMore')}
                </motion.button>
              </div>
            )}

            {infiniteScrollActive && (
              <>
                {loadingMoreSimilar && (
                  <div className="flex justify-center mt-8">
                    <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                  </div>
                )}
                <div ref={sentinelRef} className="h-4" />
              </>
            )}
          </section>
        )}
      </div>

      <AnimatePresence>
        {watchOpen && <WatchProvidersModal movie={movie} onClose={() => setWatchOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {shareOpen && <ShareModal movie={movie} onClose={() => setShareOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {watchlistSelectorOpen && (
          <WatchlistSelector movie={movie} onClose={() => setWatchlistSelectorOpen(false)} />
        )}
      </AnimatePresence>

      <MovieChat movieId={movie.id} movieTitle={title} mediaType={mediaType} />

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
              <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl relative">
                <iframe
                  src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
                  title={`${title} Fragman`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
                {user && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setWatchlistSelectorOpen(true);
                    }}
                    className="absolute bottom-3 right-3 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors shadow-lg bg-black/70 text-gray-200 hover:bg-black/90 backdrop-blur-sm"
                  >
                    <FiBookmark size={13} />
                    {t('movie.addWatchlist')}
                  </motion.button>
                )}
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

      {/* PlayIMDB Modal */}
      <AnimatePresence>
        {playOpen && movie.imdb_id && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPlayOpen(false)}
          >
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
            <motion.div
              className="relative w-full max-w-5xl"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl bg-black">
                <iframe
                  src={`https://www.playimdb.com/title/${movie.imdb_id}/`}
                  title={title}
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              <button
                onClick={() => setPlayOpen(false)}
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
