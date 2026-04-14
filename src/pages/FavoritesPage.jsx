import { motion } from 'framer-motion';
import MovieCard from '../components/MovieCard';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../contexts/AuthContext';

export default function FavoritesPage() {
  const { favorites } = useFavorites();
  const { user } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-24 pb-12 max-w-7xl mx-auto px-4"
    >
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
          ❤️ Favori Filmlerim
        </h1>
        <p className="text-gray-400">
          {user?.displayName
            ? `${user.displayName}'in koleksiyonu`
            : 'Koleksiyonun'}
        </p>
      </div>

      {favorites.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20"
        >
          <span className="text-6xl block mb-4">💔</span>
          <p className="text-gray-500 text-lg">Henüz favori film eklemedin.</p>
          <p className="text-gray-600 text-sm mt-1">
            Keşfet sayfasından beğendiğin filmleri kaydet!
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {favorites.map((movie, i) => (
            <MovieCard key={movie.id} movie={movie} index={i} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

