import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiCompass, FiHeart, FiLogIn, FiLogOut, FiSearch, FiUser } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import SearchOverlay from './SearchOverlay';

const links = [
  { to: '/', label: 'Ana Sayfa', icon: FiHome },
  { to: '/explore', label: 'Keşfet', icon: FiCompass },
  { to: '/favorites', label: 'Favoriler', icon: FiHeart },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);

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
          <Link to="/" className="flex items-center gap-2 group">
            <motion.span
              className="text-2xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
            >
              🎬
            </motion.span>
            <span className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              FilmBul
            </span>
          </Link>

          {/* Sağ: Linkler + Arama (desktop) + Auth */}
          <div className="flex items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => {
              const active = pathname === to;
              return (
                <Link key={to} to={to} className="relative px-3 py-2 rounded-lg group">
                  {active && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 bg-primary/20 rounded-lg"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span
                    className={`relative flex items-center gap-1.5 text-sm font-medium transition-colors ${
                      active ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="hidden sm:inline">{label}</span>
                  </span>
                </Link>
              );
            })}

            {/* Arama — sadece desktop */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex relative px-3 py-2 rounded-lg items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors"
              aria-label="Ara"
            >
              <FiSearch size={16} />
              <span>Ara</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2 ml-3">
                <Link to={`/profile/${user.uid}`} title="Profilim">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full border-2 border-primary/50 hover:border-primary transition-colors" />
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-primary/50 bg-primary/20 flex items-center justify-center">
                      <FiUser size={14} />
                    </div>
                  )}
                </Link>
                <button
                  onClick={logout}
                  className="text-gray-400 hover:text-red-400 transition-colors p-2"
                >
                  <FiLogOut size={16} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="ml-3 flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg text-sm font-medium transition-colors"
              >
                <FiLogIn size={14} />
                <span className="hidden sm:inline">Giriş</span>
              </Link>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Floating arama butonu — sadece mobil */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8, type: 'spring', stiffness: 300, damping: 20 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setSearchOpen(true)}
        aria-label="Ara"
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
