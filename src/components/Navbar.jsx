import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiCompass, FiHeart, FiLogIn, FiLogOut, FiSearch, FiUser, FiList, FiX } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import SearchOverlay from './SearchOverlay';
import MyFlickPickLogo from './MyFlickPickLogo';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const hoverTimer = useRef(null);

  const links = [
    { to: '/', label: t('nav.home'), icon: FiHome },
    { to: '/explore', label: t('nav.explore'), icon: FiCompass },
    { to: '/favorites', label: t('nav.favorites'), icon: FiHeart },
  ];

  useEffect(() => {
    setSearchOpen(false);
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAvatarMouseEnter = () => {
    clearTimeout(hoverTimer.current);
    setDropdownOpen(true);
  };

  const handleAvatarMouseLeave = () => {
    hoverTimer.current = setTimeout(() => setDropdownOpen(false), 200);
  };

  const handleDropdownMouseEnter = () => {
    clearTimeout(hoverTimer.current);
  };

  const handleDropdownMouseLeave = () => {
    hoverTimer.current = setTimeout(() => setDropdownOpen(false), 200);
  };

  const handleAvatarClick = () => {
    if (window.innerWidth < 640) {
      setMobileMenuOpen((prev) => !prev);
    }
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
  };

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

            {user ? (
              <div className="flex items-center gap-2 ml-3">
                {/* Avatar with hover dropdown (desktop) / tap overlay (mobile) */}
                <div
                  ref={dropdownRef}
                  className="relative"
                  onMouseEnter={handleAvatarMouseEnter}
                  onMouseLeave={handleAvatarMouseLeave}
                >
                  <button
                    onClick={handleAvatarClick}
                    aria-label={t('nav.profile')}
                    className="focus:outline-none"
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt=""
                        className="w-8 h-8 rounded-full border-2 border-primary/50 hover:border-primary transition-colors object-cover cursor-pointer"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full border-2 border-primary/50 bg-primary/20 flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                        <FiUser size={14} />
                      </div>
                    )}
                  </button>

                  {/* Desktop dropdown */}
                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="hidden sm:block absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden shadow-2xl shadow-black/50 z-50"
                        style={{ background: 'rgba(15, 23, 42, 0.97)', border: '1px solid rgba(255,255,255,0.1)' }}
                        onMouseEnter={handleDropdownMouseEnter}
                        onMouseLeave={handleDropdownMouseLeave}
                      >
                        <Link
                          to={`/profile/${user.uid}`}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <FiUser size={15} />
                          {t('nav.profile')}
                        </Link>
                        <Link
                          to="/watchlist"
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <FiList size={15} />
                          {t('nav.watchlist')}
                        </Link>
                        <div className="border-t border-white/10" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-white/10 transition-colors"
                        >
                          <FiLogOut size={15} />
                          {t('nav.logout')}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Logout button — desktop only */}
                <button onClick={handleLogout} className="hidden sm:block text-gray-400 hover:text-red-400 transition-colors p-2">
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

      {/* Mobile overlay menu */}
      <AnimatePresence>
        {mobileMenuOpen && user && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-end sm:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div
              className="relative w-full rounded-t-3xl overflow-hidden"
              style={{ background: 'rgba(15, 23, 42, 0.98)', border: '1px solid rgba(255,255,255,0.1)' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>

              {/* User info */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full border-2 border-primary/50 object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full border-2 border-primary/50 bg-primary/20 flex items-center justify-center">
                    <FiUser size={16} />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-white text-sm">{user.displayName || 'Kullanıcı'}</p>
                  <p className="text-gray-500 text-xs">{user.email}</p>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="ml-auto text-gray-500 hover:text-white transition-colors p-1"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Menu items */}
              <div className="py-2">
                <Link
                  to={`/profile/${user.uid}`}
                  className="flex items-center gap-4 px-6 py-4 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiUser size={18} />
                  <span className="font-medium">{t('nav.profile')}</span>
                </Link>
                <Link
                  to="/watchlist"
                  className="flex items-center gap-4 px-6 py-4 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiList size={18} />
                  <span className="font-medium">{t('nav.watchlist')}</span>
                </Link>
                <div className="border-t border-white/10 mt-2 pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-6 py-4 text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors"
                  >
                    <FiLogOut size={18} />
                    <span className="font-medium">{t('nav.logout')}</span>
                  </button>
                </div>
              </div>

              {/* Safe area padding */}
              <div className="pb-6" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
    </>
  );
}
