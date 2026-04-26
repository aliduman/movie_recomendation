import { motion } from 'framer-motion';
import { FiX, FiLink, FiShare2 } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { poster } from '../config/tmdb';
import toast from 'react-hot-toast';

export default function ShareModal({ movie, onClose }) {
  const url = `${window.location.origin}/movie/${movie.id}`;
  const shareText = `${movie.title} - MyFlickPick`;

  const shareWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + url)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link kopyalandı!');
      onClose();
    } catch {
      toast.error('Kopyalanamadı');
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title: shareText, url });
      onClose();
    } catch {
      // user cancelled or not supported
    }
  };

  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        className="w-full max-w-sm rounded-3xl overflow-hidden"
        style={{ background: 'rgba(18,18,28,0.98)', border: '1px solid rgba(255,255,255,0.1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <span className="font-bold text-base">Paylaş</span>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <FiX size={18} />
          </button>
        </div>

        {/* Film bilgisi */}
        <div className="flex items-center gap-3 px-5 py-4">
          {movie.poster_path ? (
            <img
              src={poster(movie.poster_path)}
              alt={movie.title}
              className="w-12 h-[72px] rounded-xl object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-[72px] rounded-xl bg-dark flex items-center justify-center text-2xl flex-shrink-0">🎬</div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-sm line-clamp-2 leading-snug">{movie.title}</p>
            {movie.release_date && (
              <p className="text-xs text-gray-500 mt-0.5">{movie.release_date.slice(0, 4)}</p>
            )}
            <p className="text-xs text-gray-600 mt-1 truncate">{url}</p>
          </div>
        </div>

        {/* Paylaşım butonları */}
        <div className="grid grid-cols-3 gap-3 px-5 pb-6">
          <button
            onClick={shareWhatsApp}
            className="flex flex-col items-center gap-2 py-3 rounded-2xl hover:bg-white/5 active:bg-white/10 transition-colors"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#25D366]/15 flex items-center justify-center">
              <FaWhatsapp size={24} className="text-[#25D366]" />
            </div>
            <span className="text-xs text-gray-400">WhatsApp</span>
          </button>

          <button
            onClick={copyLink}
            className="flex flex-col items-center gap-2 py-3 rounded-2xl hover:bg-white/5 active:bg-white/10 transition-colors"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
              <FiLink size={22} className="text-primary" />
            </div>
            <span className="text-xs text-gray-400">Linki Kopyala</span>
          </button>

          {canNativeShare && (
            <button
              onClick={nativeShare}
              className="flex flex-col items-center gap-2 py-3 rounded-2xl hover:bg-white/5 active:bg-white/10 transition-colors"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/8 flex items-center justify-center">
                <FiShare2 size={22} className="text-gray-300" />
              </div>
              <span className="text-xs text-gray-400">Diğer</span>
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
