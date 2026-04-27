import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { GENRES } from '../hooks/useMovies';

export default function GenreSelector({ selected, onSelect }) {
  const { t } = useTranslation();

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
              {genre.emoji} {t(genre.key)}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
