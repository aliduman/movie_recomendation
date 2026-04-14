import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlay, FiStar } from 'react-icons/fi';
import tmdb, { backdrop } from '../config/tmdb';

export default function HeroSection() {
  const [movies, setMovies] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    tmdb.get('/trending/movie/day').then(({ data }) => {
      setMovies(data.results.slice(0, 5));
    });
  }, []);

  // Otomatik geçiş
  useEffect(() => {
    if (!movies.length) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % movies.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [movies.length]);

  const movie = movies[current];
  if (!movie) return <div className="h-[85vh] bg-darker" />;

  return (
    <div className="relative h-[85vh] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={movie.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <img
            src={backdrop(movie.backdrop_path)}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-darker via-darker/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-darker/80 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 flex flex-col justify-end pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-primary/80 rounded-full text-xs font-semibold">
                🔥 Trend
              </span>
              <span className="flex items-center gap-1 text-secondary text-sm">
                <FiStar className="fill-secondary" size={14} />
                {movie.vote_average?.toFixed(1)}
              </span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold max-w-2xl leading-tight">
              {movie.title}
            </h1>
            <p className="mt-4 text-gray-300 max-w-xl line-clamp-3 text-sm sm:text-base">
              {movie.overview}
            </p>
            <div className="flex items-center gap-3 mt-6">
              <Link
                to={`/movie/${movie.id}`}
                className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/80 rounded-xl font-semibold transition-colors"
              >
                <FiPlay size={18} />
                Detayları Gör
              </Link>
              <Link
                to="/explore"
                className="px-6 py-3 glass rounded-xl font-semibold hover:bg-white/10 transition-colors"
              >
                Keşfet
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dot indicators */}
        <div className="flex gap-2 mt-8">
          {movies.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? 'w-8 bg-primary' : 'w-4 bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

