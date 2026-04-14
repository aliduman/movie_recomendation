import { motion } from 'framer-motion';
import { GENRES } from '../hooks/useMovies';

export default function GenreSelector({ selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {GENRES.map((genre) => {
        const active = selected === genre.id;
        return (
          <motion.button
            key={genre.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(genre.id)}
            className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              active ? 'text-white' : 'text-gray-400 hover:text-white glass'
            }`}
          >
            {active && (
              <motion.div
                layoutId="genre-pill"
                className="absolute inset-0 bg-gradient-to-r from-primary to-purple-500 rounded-full"
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              />
            )}
            <span className="relative">
              {genre.emoji} {genre.name}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

