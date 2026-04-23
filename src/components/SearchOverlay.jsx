import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX, FiStar } from 'react-icons/fi';
import tmdb, { poster } from '../config/tmdb';

function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function SearchOverlay({ onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const debounced = useDebounce(query);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (debounced.length < 3) { setResults([]); return; }
    setLoading(true);
    tmdb
      .get('/search/movie', { params: { query: debounced, page: 1 } })
      .then(({ data }) => setResults(data.results?.slice(0, 8) || []))
      .finally(() => setLoading(false));
  }, [debounced]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[60] flex flex-col items-center pt-24 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

        <motion.div
          className="relative w-full max-w-2xl"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Input */}
          <div className="relative">
            <FiSearch
              className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Film adı yaz..."
              className="w-full pl-14 pr-14 py-4 rounded-2xl bg-[#1a1a1a] border border-white/10 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 text-lg transition-all placeholder-gray-500"
            />
            {query ? (
              <button
                onClick={() => setQuery('')}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                <FiX size={20} />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                <FiX size={20} />
              </button>
            )}
          </div>

          {/* Hint */}
          {query.length > 0 && query.length < 3 && (
            <p className="text-center text-sm text-gray-500 mt-4">
              Aramak için en az 3 karakter yaz...
            </p>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex justify-center mt-6">
              <div className="w-6 h-6 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}

          {/* Results */}
          <AnimatePresence>
            {!loading && results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="mt-3 bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
              >
                {results.map((movie, i) => (
                  <Link
                    key={movie.id}
                    to={`/movie/${movie.id}`}
                    onClick={onClose}
                    className="flex items-center gap-4 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                  >
                    {/* Poster */}
                    <div className="flex-shrink-0 w-10 h-14 rounded-lg overflow-hidden bg-dark">
                      {movie.poster_path ? (
                        <img
                          src={poster(movie.poster_path)}
                          alt={movie.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">🎬</div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{movie.title}</p>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                        {movie.release_date && (
                          <span>{movie.release_date.slice(0, 4)}</span>
                        )}
                        {movie.vote_average > 0 && (
                          <span className="flex items-center gap-1 text-secondary">
                            <FiStar size={10} className="fill-secondary" />
                            {movie.vote_average.toFixed(1)}
                          </span>
                        )}
                        {movie.genre_ids?.length > 0 && (
                          <span className="truncate">{movie.genre_ids.slice(0, 2).join(', ')}</span>
                        )}
                      </div>
                    </div>

                    <span className="text-gray-600 text-xs flex-shrink-0">→</span>
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {!loading && debounced.length >= 3 && results.length === 0 && (
            <p className="text-center text-sm text-gray-500 mt-6">
              "{debounced}" için sonuç bulunamadı.
            </p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
