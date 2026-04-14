import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiX,
  FiArrowLeft,
  FiArrowRight,
  FiRefreshCw,
  FiExternalLink,
  FiTrash2,
  FiStar,
} from 'react-icons/fi';
import { useRecommendation, MOODS } from '../hooks/useRecommendation';
import { GENRES } from '../hooks/useMovies';
import { poster } from '../config/tmdb';

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

const STEP_LABELS = ['Ruh Hali', 'Tür', 'Film'];

export default function RecommendationWizard({ onClose }) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState(null);

  const { result, loading, error, seenCount, fetchRecommendation, clearSeen } =
    useRecommendation();

  const goTo = (next) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    setSelectedGenre(null);
    goTo(1);
  };

  const handleFetch = (genreId = null) => {
    setSelectedGenre(genreId);
    goTo(2);
    fetchRecommendation(selectedMood.genres, genreId, selectedMood.id);
  };

  const handleAnother = () => {
    fetchRecommendation(selectedMood.genres, selectedGenre, selectedMood.id);
  };

  const handleReset = () => {
    setSelectedMood(null);
    setSelectedGenre(null);
    goTo(0);
  };

  const handleClearSeen = () => {
    clearSeen();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 24 }}
        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl rounded-3xl overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {/* Gradient glow top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-400 to-secondary opacity-80 rounded-t-3xl" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <motion.span
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, repeatDelay: 3 }}
              className="text-2xl"
            >
              🪄
            </motion.span>
            <div>
              <h2 className="font-bold text-base text-white">Film Sihirbazı</h2>
              {seenCount > 0 && (
                <p className="text-[11px] text-gray-500">
                  {seenCount} film daha önce önerildi
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {seenCount > 0 && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleClearSeen}
                title="Görülen filmleri sıfırla"
                className="p-2 rounded-lg text-gray-500 hover:text-yellow-400 hover:bg-yellow-400/10 transition-colors"
              >
                <FiTrash2 size={15} />
              </motion.button>
            )}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
            >
              <FiX size={18} />
            </motion.button>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-1 px-6 mb-4">
          {STEP_LABELS.map((label, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300 ${
                  i === step
                    ? 'bg-primary text-white shadow-md shadow-primary/40'
                    : i < step
                    ? 'bg-primary/50 text-white'
                    : 'bg-white/10 text-gray-600'
                }`}
              >
                {i < step ? '✓' : i + 1}
              </div>
              <span
                className={`text-[11px] hidden sm:inline transition-colors ${
                  i === step ? 'text-white font-medium' : 'text-gray-600'
                }`}
              >
                {label}
              </span>
              {i < STEP_LABELS.length - 1 && (
                <div
                  className={`h-px w-5 mx-1 transition-colors ${
                    i < step ? 'bg-primary/50' : 'bg-white/10'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="px-6 pb-6 min-h-[360px] overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            {/* ── STEP 0: Mood ── */}
            {step === 0 && (
              <motion.div
                key="mood"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                <p className="text-sm text-gray-400 mb-4">
                  Bugün nasıl hissediyorsun? En uygun filmi birlikte bulalım 👇
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {MOODS.map((mood) => (
                    <motion.button
                      key={mood.id}
                      whileHover={{ scale: 1.05, y: -3 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleMoodSelect(mood)}
                      className={`p-3 rounded-2xl text-center bg-gradient-to-br ${mood.color} border border-white/8 ${mood.border} transition-all duration-200 group`}
                    >
                      <motion.span
                        className="text-3xl block mb-1.5"
                        whileHover={{ scale: 1.2 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      >
                        {mood.emoji}
                      </motion.span>
                      <span className="text-xs font-semibold block text-white/90 leading-tight">
                        {mood.label}
                      </span>
                      <span className="text-[10px] text-gray-500 mt-1 block leading-tight">
                        {mood.desc}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── STEP 1: Genre ── */}
            {step === 1 && (
              <motion.div
                key="genre"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{selectedMood?.emoji}</span>
                  <h3 className="font-semibold text-white">{selectedMood?.label}</h3>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  İstersen bir tür seç — ya da direkt geç, sihirbaz halleder 🪄
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {GENRES.map((genre) => {
                    const active = selectedGenre === genre.id;
                    return (
                      <motion.button
                        key={genre.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          setSelectedGenre(active ? null : genre.id)
                        }
                        className={`relative px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                          active
                            ? 'bg-gradient-to-r from-primary to-purple-500 text-white shadow-md shadow-primary/30'
                            : 'text-gray-400 hover:text-white'
                        }`}
                        style={
                          active
                            ? {}
                            : {
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.08)',
                              }
                        }
                      >
                        {genre.emoji} {genre.name}
                      </motion.button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap gap-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => goTo(0)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white transition-colors"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <FiArrowLeft size={14} /> Geri
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleFetch(null)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm text-gray-300 hover:text-white transition-colors"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    Türsüz Devam <FiArrowRight size={14} />
                  </motion.button>

                  {selectedGenre && (
                    <motion.button
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleFetch(selectedGenre)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary to-purple-500 hover:opacity-90 rounded-xl text-sm font-semibold shadow-lg shadow-primary/30 transition-opacity"
                    >
                      Film Bul <FiArrowRight size={14} />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Result ── */}
            {step === 2 && (
              <motion.div
                key="result"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="min-h-[320px]"
              >
                {/* Loading */}
                {loading && (
                  <div className="flex flex-col items-center justify-center py-16 gap-5">
                    <div className="relative w-16 h-16">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Infinity,
                          duration: 1,
                          ease: 'linear',
                        }}
                        className="absolute inset-0 rounded-full border-4 border-primary/30 border-t-primary"
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-xl">
                        🎬
                      </span>
                    </div>
                    <div className="text-center">
                      <p className="text-white font-semibold">Mükemmel film aranıyor...</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {selectedMood?.emoji} {selectedMood?.label} ruh haline göre
                      </p>
                    </div>
                  </div>
                )}

                {/* Error */}
                {error && !loading && (
                  <div className="text-center py-12">
                    <span className="text-5xl block mb-4">😕</span>
                    <p className="text-gray-300 font-medium mb-1">Bir sorun oluştu</p>
                    <p className="text-gray-500 text-sm mb-5">{error}</p>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={handleReset}
                        className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white transition-colors"
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        Yeniden Başla
                      </button>
                      <button
                        onClick={handleAnother}
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/80 rounded-xl text-sm font-semibold transition-colors"
                      >
                        <FiRefreshCw size={14} /> Tekrar Dene
                      </button>
                    </div>
                  </div>
                )}

                {/* Film result */}
                {result && !loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col sm:flex-row gap-5"
                  >
                    {/* Poster */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className="flex-shrink-0 mx-auto sm:mx-0"
                    >
                      {result.poster_path ? (
                        <img
                          src={poster(result.poster_path)}
                          alt={result.title}
                          className="w-36 rounded-2xl shadow-2xl shadow-primary/20"
                        />
                      ) : (
                        <div className="w-36 h-52 rounded-2xl bg-dark flex items-center justify-center text-5xl">
                          🎬
                        </div>
                      )}
                    </motion.div>

                    {/* Info */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 }}
                      className="flex-1"
                    >
                      {/* Mood badge */}
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                          style={{
                            background: 'rgba(109,40,217,0.3)',
                            border: '1px solid rgba(109,40,217,0.4)',
                          }}
                        >
                          {selectedMood?.emoji} {selectedMood?.label}
                        </span>
                        {seenCount > 0 && (
                          <span className="text-[11px] text-gray-600">
                            #{seenCount} öneri
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-extrabold text-white leading-tight">
                        {result.title}
                      </h3>

                      {result._wasRecommendedBefore && (
                        <p className="text-xs text-amber-300 mt-1">
                          Bu film daha once onerildi (toplam {result._recommendedCount} kez)
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-1.5 text-sm">
                        <span className="text-gray-500">
                          {result.release_date?.slice(0, 4)}
                        </span>
                        <span className="flex items-center gap-1 text-secondary">
                          <FiStar className="fill-secondary" size={13} />
                          {result.vote_average?.toFixed(1)}
                        </span>
                      </div>

                      <p className="text-sm text-gray-400 mt-3 leading-relaxed line-clamp-4">
                        {result.overview || 'Açıklama mevcut değil.'}
                      </p>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 mt-5">
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={handleAnother}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-colors"
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                          }}
                        >
                          <FiRefreshCw size={14} /> Başka Film
                        </motion.button>

                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                          <Link
                            to={`/movie/${result.id}`}
                            onClick={onClose}
                            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary to-purple-500 hover:opacity-90 rounded-xl text-sm font-semibold shadow-lg shadow-primary/30 transition-opacity"
                          >
                            <FiExternalLink size={14} /> Detaya Git
                          </Link>
                        </motion.div>

                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={handleReset}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm text-gray-500 hover:text-white transition-colors"
                          style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.06)',
                          }}
                        >
                          <FiArrowLeft size={14} /> Yeni Arama
                        </motion.button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

