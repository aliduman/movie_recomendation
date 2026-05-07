import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiBell, FiUserPlus, FiMessageSquare, FiMessageCircle, FiCheck, FiHeart } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../hooks/useNotifications';

const TYPE_CONFIG = {
  follow:  { icon: FiUserPlus,      color: 'text-purple-400', bg: 'bg-purple-400/15' },
  dm:      { icon: FiMessageSquare, color: 'text-blue-400',   bg: 'bg-blue-400/15'   },
  comment: { icon: FiMessageCircle, color: 'text-yellow-400', bg: 'bg-yellow-400/15' },
  chat:    { icon: FiMessageCircle, color: 'text-green-400',  bg: 'bg-green-400/15'  },
  like:    { icon: FiHeart,         color: 'text-red-400',    bg: 'bg-red-400/15'    },
};

function timeAgo(ts, t) {
  if (!ts) return '';
  const sec = Math.floor((Date.now() - (ts.toMillis?.() ?? ts)) / 1000);
  if (sec < 60) return t('comments.justNow');
  if (sec < 3600) return t('comments.minutesAgo', { count: Math.floor(sec / 60) });
  if (sec < 86400) return t('comments.hoursAgo', { count: Math.floor(sec / 3600) });
  return t('comments.daysAgo', { count: Math.floor(sec / 86400) });
}

function notifLink(n) {
  switch (n.type) {
    case 'follow': return `/profile/${n.fromUid}`;
    case 'dm':     return `/profile/${n.fromUid}`;
    case 'comment':
    case 'chat':   return n.movieId ? `/movie/${n.movieId}` : '/';
    default:       return '/';
  }
}

function NotifItem({ n, onClick, t }) {
  const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.comment;
  const Icon = cfg.icon;

  let text = '';
  switch (n.type) {
    case 'follow':  text = t('notifications.follow', { name: n.fromName }); break;
    case 'dm':      text = t('notifications.dm',     { name: n.fromName }); break;
    case 'comment': text = t('notifications.comment', { name: n.fromName, movie: n.movieTitle || '' }); break;
    case 'chat':    text = t('notifications.chat',    { name: n.fromName, movie: n.movieTitle || '' }); break;
    default:        text = n.body || '';
  }

  return (
    <Link
      to={notifLink(n)}
      onClick={onClick}
      className={`flex gap-3 px-5 py-4 hover:bg-white/5 transition-colors border-b border-white/[0.05] ${!n.read ? 'bg-white/[0.03]' : ''}`}
    >
      <div className="flex-shrink-0 relative mt-0.5">
        {n.fromPhoto ? (
          <img src={n.fromPhoto} alt="" className="w-10 h-10 rounded-full object-cover border border-white/10" />
        ) : (
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${cfg.bg}`}>
            <Icon size={18} className={cfg.color} />
          </div>
        )}
        <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center ${cfg.bg} border-2 border-[#0f0f0f]`}>
          <Icon size={10} className={cfg.color} />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${n.read ? 'text-gray-400' : 'text-white font-medium'}`}>
          {text}
        </p>
        {n.preview && (
          <p className="text-xs text-gray-500 mt-0.5 truncate">"{n.preview}"</p>
        )}
        <p className="text-xs text-gray-600 mt-1">{timeAgo(n.createdAt, t)}</p>
      </div>

      {!n.read && (
        <div className="flex-shrink-0 mt-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
        </div>
      )}
    </Link>
  );
}

export default function NotificationSidebar({ open, onClose }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { notifications, loading, unreadCount, markAllRead, markRead } = useNotifications();

  // Mark all as read when sidebar opens
  useEffect(() => {
    if (open && unreadCount > 0) {
      markAllRead();
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close on navigation
  useEffect(() => {
    onClose();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed top-0 right-0 h-full w-80 z-[61] flex flex-col shadow-2xl"
            style={{ background: '#0f0f0f', borderLeft: '1px solid rgba(255,255,255,0.08)' }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-2">
                <FiBell size={17} className="text-primary" />
                <h2 className="font-bold text-sm">{t('notifications.title')}</h2>
              </div>
              <div className="flex items-center gap-1">
                {notifications.some((n) => !n.read) && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
                  >
                    <FiCheck size={12} />
                    {t('notifications.markAllRead')}
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors ml-1"
                >
                  <FiX size={16} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {loading && (
                <div className="flex justify-center py-10">
                  <div className="w-6 h-6 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              )}

              {!loading && notifications.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center px-6 py-16">
                  <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <FiBell size={24} className="text-gray-600" />
                  </div>
                  <p className="text-gray-500 text-sm">{t('notifications.empty')}</p>
                </div>
              )}

              {!loading && notifications.map((n) => (
                <NotifItem
                  key={n.id}
                  n={n}
                  t={t}
                  onClick={() => { markRead(n.id); onClose(); }}
                />
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
