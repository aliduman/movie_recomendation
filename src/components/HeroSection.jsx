import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlay, FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import tmdb, { backdrop } from '../config/tmdb';

export default function HeroSection() {
  const [movies, setMovies] = useState([]);
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(null);

  useEffect(() => {
    tmdb.get('/trending/movie/day').then(({ data }) => {
      setMovies(data.results.slice(0, 5));
    });
  }, []);

  useEffect(() => {
    if (!movies.length) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % movies.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [movies.length]);

  const [direction, setDirection] = useState(1);

  const prev = () => { setDirection(-1); setCurrent((c) => (c - 1 + movies.length) % movies.length); };
  const next = () => { setDirection(1); setCurrent((c) => (c + 1) % movies.length); };

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) { delta > 0 ? next() : prev(); }
    touchStartX.current = null;
  };

  const movie = movies[current];
  if (!movie) return <div className="h-[68vh] sm:h-[85vh] bg-darker" />;

  return (
    <div
      className="relative h-[68vh] sm:h-[85vh] overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={movie.id}
          custom={direction}
          variants={{
            enter: (d) => ({ x: d > 0 ? '100%' : '-100%' }),
            center: { x: 0 },
            exit: (d) => ({ x: d > 0 ? '-100%' : '100%' }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5, ease: 'easeInOut' }}
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

      {/* Left / Right buttons */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white transition-colors backdrop-blur-sm"
        aria-label="Önceki"
      >
        <FiChevronLeft size={24} />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white transition-colors backdrop-blur-sm"
        aria-label="Sonraki"
      >
        <FiChevronRight size={24} />
      </button>

      {/* Content */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 flex flex-col justify-end pb-12 sm:pb-20">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={movie.id}
            custom={direction}
            variants={{
              enter: (d) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: (d) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: 'easeInOut' }}
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
            <h1 className="text-3xl sm:text-6xl font-extrabold max-w-2xl leading-tight">
              {movie.title}
            </h1>
            <p className="mt-4 text-gray-300 max-w-xl line-clamp-2 sm:line-clamp-3 text-sm sm:text-base">
              {movie.overview}
            </p>
            <div className="flex items-center gap-3 mt-5 sm:mt-6">
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
        <div className="flex gap-2 mt-6 sm:mt-8">
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
