import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiStar, FiTv } from 'react-icons/fi';
import { poster } from '../config/tmdb';
import { useFavorites } from '../hooks/useFavorites';
import WatchProvidersModal from './WatchProvidersModal';

const supportsHover =
  typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;

export default function MovieCard({ movie }) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const fav = isFavorite(movie.id);
  const [showProviders, setShowProviders] = useState(false);

  return (
    <>
      <motion.div
        whileHover={supportsHover ? { y: -8, scale: 1.03 } : undefined}
        className="relative group"
      >
        <Link to={`/movie/${movie.id}`} className="block">
          <div className="relative overflow-hidden rounded-2xl aspect-[2/3] bg-dark">
            {movie.poster_path ? (
              <img
                src={poster(movie.poster_path)}
                alt={movie.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl">
                🎬
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 [@media(hover:hover)]:group-hover:opacity-100 transition-opacity duration-300" />

            {/* Hover info */}
            <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100 transition-all duration-300">
              <h3 className="text-sm font-bold line-clamp-2">{movie.title}</h3>
              <div className="flex items-center gap-1 mt-1 text-secondary text-xs">
                <FiStar className="fill-secondary" size={12} />
                <span>{movie.vote_average?.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </Link>

        {/* Favori butonu */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(movie);
          }}
          className={`absolute top-2 right-2 p-2 rounded-full glass transition-colors ${
            fav ? 'text-red-500' : 'text-white/70 hover:text-red-400'
          }`}
        >
          <FiHeart size={16} className={fav ? 'fill-red-500' : ''} />
        </motion.button>

        {/* Nereden İzlerim butonu */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={(e) => {
            e.preventDefault();
            setShowProviders(true);
          }}
          className="absolute top-2 left-2 p-2 rounded-full glass text-white/70 hover:text-primary transition-colors opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
          title="Nereden İzlerim?"
        >
          <FiTv size={16} />
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {showProviders && (
          <WatchProvidersModal
            movie={movie}
            onClose={() => setShowProviders(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
