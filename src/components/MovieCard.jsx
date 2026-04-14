import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiStar } from 'react-icons/fi';
import { poster } from '../config/tmdb';
import { useFavorites } from '../hooks/useFavorites';

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export default function MovieCard({ movie, index = 0 }) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const fav = isFavorite(movie.id);

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -8, scale: 1.03 }}
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Hover info */}
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
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
    </motion.div>
  );
}

