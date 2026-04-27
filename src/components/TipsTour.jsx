import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiX, FiCheck } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const STEP_KEYS = [
  { sel: '[data-tour="hero"]',       titleKey: 'tour.hero_title',    descKey: 'tour.hero_desc' },
  { sel: '[data-tour="explore"]',    titleKey: 'tour.explore_title', descKey: 'tour.explore_desc' },
  { sel: '[data-tour="search"]',     titleKey: 'tour.search_title',  descKey: 'tour.search_desc' },
  { sel: '[data-tour="movie-card"]', titleKey: 'tour.card_title',    descKey: 'tour.card_desc' },
  { sel: '[data-tour="wizard"]',     titleKey: 'tour.wizard_title',  descKey: 'tour.wizard_desc' },
];

const PAD = 8;

function findRect(sel) {
  const els = [...document.querySelectorAll(sel)];
  const el = els.find((e) => {
    const r = e.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  });
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

export default function TipsTour({ onDone }) {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState(null);
  const [retries, setRetries] = useState(0);

  const refresh = useCallback(() => {
    setRect(findRect(STEP_KEYS[step].sel));
  }, [step]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const r = findRect(STEP_KEYS[step].sel);
      setRect(r);
      if (!r) setRetries(0);
    }, 80);
    window.addEventListener('resize', refresh);
    window.addEventListener('scroll', refresh, true);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', refresh);
      window.removeEventListener('scroll', refresh, true);
    };
  }, [step, refresh]);

  useEffect(() => {
    if (rect !== null) return;
    if (retries >= 8) { advance(); return; }
    const timer = setTimeout(() => {
      const r = findRect(STEP_KEYS[step].sel);
      if (r) setRect(r);
      else setRetries((n) => n + 1);
    }, 200);
    return () => clearTimeout(timer);
  }, [rect, retries, step]);

  const advance = () => {
    if (step < STEP_KEYS.length - 1) setStep((s) => s + 1);
    else onDone();
  };

  const current = STEP_KEYS[step];
  const isLast = step === STEP_KEYS.length - 1;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const TW = Math.min(292, vw - 24);

  let tooltipTop, tooltipBottom, tooltipLeft;
  let showAbove = false;

  if (rect) {
    const spotTop = rect.top - PAD;
    const spotBottom = rect.top + rect.height + PAD;
    showAbove = spotBottom + 150 > vh;
    tooltipLeft = Math.max(12, Math.min(rect.left + rect.width / 2 - TW / 2, vw - TW - 12));
    if (showAbove) tooltipBottom = vh - spotTop + 10;
    else tooltipTop = spotBottom + 10;
  }

  return (
    <>
      <div className="fixed inset-0 z-[100] cursor-pointer" onClick={advance} />

      {rect && (
        <motion.div
          className="fixed z-[101] rounded-xl pointer-events-none"
          animate={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
          }}
          transition={{ type: 'spring', stiffness: 350, damping: 32 }}
          style={{
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.72)',
            border: '2px solid rgba(124,58,237,0.8)',
          }}
        />
      )}

      <AnimatePresence mode="wait">
        {rect && (
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.93, y: showAbove ? 6 : -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className="fixed z-[102] rounded-2xl p-4 pointer-events-auto"
            style={{
              width: TW,
              top: tooltipTop,
              bottom: tooltipBottom,
              left: tooltipLeft,
              background: 'rgba(10,10,18,0.97)',
              border: '1px solid rgba(124,58,237,0.35)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <button
              onClick={onDone}
              className="absolute top-3 right-3 p-1 rounded-lg text-gray-600 hover:text-white hover:bg-white/10 transition-colors"
            >
              <FiX size={14} />
            </button>

            <h3 className="font-bold text-white text-sm pr-6 leading-snug">{t(current.titleKey)}</h3>
            <p className="text-gray-400 text-xs leading-relaxed mt-1.5">{t(current.descKey)}</p>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
              <div className="flex gap-1.5 items-center">
                {STEP_KEYS.map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ width: i === step ? 16 : 6, opacity: i === step ? 1 : 0.3 }}
                    transition={{ duration: 0.25 }}
                    className="h-1.5 rounded-full"
                    style={{ background: '#7C3AED' }}
                  />
                ))}
              </div>

              <button
                onClick={advance}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#C026D3)' }}
              >
                {isLast ? <><FiCheck size={12} /> {t('tour.done')}</> : <>{t('tour.next')} <FiArrowRight size={12} /></>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
