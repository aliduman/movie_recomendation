import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiCompass, FiHeart, FiLogIn, FiLogOut, FiSearch, FiUser, FiBell } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import SearchOverlay from './SearchOverlay';
import NotificationSidebar from './NotificationSidebar';
import MyFlickPickLogo from './MyFlickPickLogo';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { unreadCount } = useNotifications();

  const links = [
    { to: '/', label: t('nav.home'), icon: FiHome },
    { to: '/explore', label: t('nav.explore'), icon: FiCompass },
    { to: '/favorites', label: t('nav.favorites'), icon: FiHeart },
  ];

  useEffect(() => {
    setSearchOpen(false);
  }, [pathname]);

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50"
        style={{ background: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/">
            <MyFlickPickLogo variant="horizontal" width={160} height={38} />
          </Link>

          {/* Right: Links + Search + Language + Auth */}
          <div className="flex items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => {
              const active = pathname === to;
              const isHome = to === '/';
              const tourId = to === '/explore' ? 'explore' : undefined;
              return (
                <Link key={to} to={to} data-tour={tourId} className={`relative px-3 py-3 sm:px-2 sm:py-2 rounded-lg group ${isHome ? 'hidden sm:flex' : ''}`}>
                  {active && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 bg-primary/20 rounded-lg"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className={`relative flex items-center gap-1.5 text-sm font-medium transition-colors ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                    <Icon size={18} className="sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </span>
                </Link>
              );
            })}

            {/* Search — desktop only */}
            <button
              data-tour="search"
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex relative px-3 py-2 rounded-lg items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors"
              aria-label={t('nav.search')}
            >
              <FiSearch size={16} />
              <span>{t('nav.search')}</span>
            </button>

            {/* Language switcher — desktop only */}
            <LanguageSwitcher className="hidden sm:flex ml-1" />

            {/* Notification bell — logged-in only */}
            {user && (
              <button
                onClick={() => setNotifOpen(true)}
                className="relative p-2 text-gray-400 hover:text-white transition-colors ml-1"
                aria-label="Notifications"
              >
                <FiBell size={18} />
                {unreadCount > 0 && (
                  <motion.span
                    key={unreadCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-0.5 right-0.5 min-w-[17px] h-[17px] rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center px-1 leading-none"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-2 ml-2">
                <Link to={`/profile/${user.uid}`} title="Profilim">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full border-2 border-primary/50 hover:border-primary transition-colors object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-primary/50 bg-primary/20 flex items-center justify-center">
                      <FiUser size={14} />
                    </div>
                  )}
                </Link>
                <button onClick={logout} className="text-gray-400 hover:text-red-400 transition-colors p-2">
                  <FiLogOut size={16} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="ml-3 flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg text-sm font-medium transition-colors"
              >
                <FiLogIn size={14} />
                <span className="hidden sm:inline">{t('nav.login')}</span>
              </Link>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Floating search — mobile only */}
      <motion.button
        data-tour="search"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8, type: 'spring', stiffness: 300, damping: 20 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setSearchOpen(true)}
        aria-label={t('nav.search')}
        className="sm:hidden fixed bottom-6 left-6 z-50 w-12 h-12 rounded-full flex items-center justify-center bg-dark border border-white/10 text-gray-300 shadow-xl shadow-black/40"
      >
        <FiSearch size={20} />
      </motion.button>

      <AnimatePresence>
        {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
      </AnimatePresence>

      <NotificationSidebar open={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  );
}
