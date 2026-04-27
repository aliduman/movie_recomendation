import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import { FiPlay, FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import tmdb, { backdrop } from '../config/tmdb';

export default function HeroSection() {
  const [movies, setMovies] = useState([]);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const x = useMotionValue(0);
  const dragged = useRef(false);
  const timerRef = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    tmdb.get('/trending/movie/day').then(({ data }) => {
      setMovies(data.results.slice(0, 5));
    });
  }, []);

  const resetTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setDirection(1);
      setCurrent((c) => (c + 1) % movies.length);
    }, 6000);
  };

  useEffect(() => {
    if (!movies.length) return;
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, [movies.length]);

  const goTo = (index, dir) => {
    setDirection(dir);
    setCurrent(index);
    animate(x, 0, { type: 'spring', stiffness: 400, damping: 35 });
    resetTimer();
  };

  const prev = () => goTo((current - 1 + movies.length) % movies.length, -1);
  const next = () => goTo((current + 1) % movies.length, 1);

  const handleDragEnd = (_, info) => {
    dragged.current = true;
    setTimeout(() => { dragged.current = false; }, 100);
    if (info.offset.x < -50 || info.velocity.x < -350) next();
    else if (info.offset.x > 50 || info.velocity.x > 350) prev();
    else animate(x, 0, { type: 'spring', stiffness: 400, damping: 35 });
  };

  const movie = movies[current];
  if (!movie) return <div className="h-[68vh] sm:h-[85vh] bg-darker" />;

  return (
    <div className="relative h-[68vh] sm:h-[85vh] overflow-hidden select-none">

      {/* Background fade */}
      <AnimatePresence>
        <motion.div
          key={`bg-${movie.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <img src={backdrop(movie.backdrop_path)} alt="" className="w-full h-full object-cover" draggable={false} />
          <div className="absolute inset-0 bg-gradient-to-t from-darker via-darker/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-darker/80 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Draggable content layer */}
      <motion.div
        className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        style={{ x }}
        onDragEnd={handleDragEnd}
      >
        <div className="h-full max-w-7xl mx-auto px-4 flex flex-col justify-end pb-12 sm:pb-20 pointer-events-none">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`content-${movie.id}`}
              custom={direction}
              variants={{
                enter: (d) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
                center: { x: 0, opacity: 1 },
                exit: (d) => ({ x: d > 0 ? -40 : 40, opacity: 0 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-primary/80 rounded-full text-xs font-semibold">
                  🔥 {t('hero.trend')}
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
              <div className="flex items-center gap-3 mt-5 sm:mt-6 pointer-events-auto">
                <Link
                  to={`/movie/${movie.id}`}
                  onClick={(e) => dragged.current && e.preventDefault()}
                  className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/80 rounded-xl font-semibold transition-colors"
                >
                  <FiPlay size={18} />
                  {t('hero.details')}
                </Link>
                <Link
                  to="/explore"
                  onClick={(e) => dragged.current && e.preventDefault()}
                  className="px-6 py-3 glass rounded-xl font-semibold hover:bg-white/10 transition-colors"
                >
                  {t('hero.explore')}
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dot indicators */}
          <div data-tour="hero" className="flex gap-2 mt-6 sm:mt-8 pointer-events-auto">
            {movies.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i, i > current ? 1 : -1)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? 'w-8 bg-primary' : 'w-4 bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Prev / Next */}
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
    </div>
  );
}
