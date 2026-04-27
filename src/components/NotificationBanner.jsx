import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiX } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

export default function NotificationBanner({ onAllow, onDismiss }) {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="fixed bottom-24 left-0 right-0 mx-auto z-[90] w-[calc(100%-2rem)] max-w-sm"
      >
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl shadow-black/50"
          style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(109,40,217,0.4)', backdropFilter: 'blur(16px)' }}>
          <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <FiBell size={18} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">{t('notification.title')}</p>
            <p className="text-xs text-gray-400 mt-0.5">{t('notification.desc')}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onAllow}
              className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/80 text-white text-xs font-semibold transition-colors"
            >
              {t('notification.allow')}
            </button>
            <button onClick={onDismiss} className="p-1.5 text-gray-500 hover:text-white transition-colors">
              <FiX size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
