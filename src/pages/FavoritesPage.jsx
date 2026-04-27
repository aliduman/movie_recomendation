import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import MovieCard from '../components/MovieCard';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../contexts/AuthContext';
import { GENRES } from '../hooks/useMovies';

export default function FavoritesPage() {
  const { favorites, loading } = useFavorites();
  const { user } = useAuth();
  const [selectedGenre, setSelectedGenre] = useState(null);
  const { t } = useTranslation();

  const availableGenres = useMemo(() => {
    const ids = new Set(favorites.flatMap((f) => f.genre_ids || []));
    return GENRES.filter((g) => ids.has(g.id));
  }, [favorites]);

  const filtered = useMemo(() => {
    if (!selectedGenre) return favorites;
    return favorites.filter((f) => f.genre_ids?.includes(selectedGenre));
  }, [favorites, selectedGenre]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-24 pb-12 max-w-7xl mx-auto px-4"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">❤️ {t('favorites.title')}</h1>
        <p className="text-gray-400">
          {user?.displayName ? `${user.displayName} ${t('favorites.subtitle')}` : t('favorites.subtitle')}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : favorites.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20"
        >
          <span className="text-6xl block mb-4">💔</span>
          <p className="text-gray-500 text-lg">{t('favorites.empty')}</p>
          <p className="text-gray-600 text-sm mt-1">{t('favorites.emptyHint')}</p>
        </motion.div>
      ) : (
        <>
          {availableGenres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setSelectedGenre(null)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  !selectedGenre ? 'bg-gradient-to-r from-primary to-purple-500 text-white shadow-md shadow-primary/30' : 'text-gray-400 hover:text-white'
                }`}
                style={!selectedGenre ? {} : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                🎬 {t('favorites.all')} ({favorites.length})
              </button>

              {availableGenres.map((genre) => {
                const count = favorites.filter((f) => f.genre_ids?.includes(genre.id)).length;
                const active = selectedGenre === genre.id;
                return (
                  <button
                    key={genre.id}
                    onClick={() => setSelectedGenre(active ? null : genre.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                      active ? 'bg-gradient-to-r from-primary to-purple-500 text-white shadow-md shadow-primary/30' : 'text-gray-400 hover:text-white'
                    }`}
                    style={active ? {} : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    {genre.emoji} {t(genre.key)} ({count})
                  </button>
                );
              })}
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              {t('favorites.noneInCategory')}
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filtered.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
