import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './contexts/AuthContext';
import { useChatNotifications } from './hooks/useChatNotifications';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import MovieDetailPage from './pages/MovieDetailPage';
import ActorDetailPage from './pages/ActorDetailPage';
import FavoritesPage from './pages/FavoritesPage';
import LoginPage from './pages/LoginPage';
import RecommendationWizard from './components/RecommendationWizard';
import Footer from './components/Footer';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
}

function ChatNotifier() {
  const { unreadRooms } = useChatNotifications();
  const notifiedRef = useEffect(() => {}, []); // mount tracker
  const shownRef = useState(false);

  useEffect(() => {
    if (!unreadRooms.length || shownRef[0]) return;
    shownRef[1](true);
    unreadRooms.forEach((room) => {
      toast(`💬 "${room.movieTitle}" sohbetinde ${room.count} yeni mesaj var!`, {
        duration: 6000,
        icon: '🎬',
      });
    });
  }, [unreadRooms]);

  return null;
}

export default function App() {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => setChatOpen(e.detail.open);
    window.addEventListener('chatToggle', handler);
    return () => window.removeEventListener('chatToggle', handler);
  }, []);

  return (
    <div className="min-h-screen bg-darker flex flex-col">
      <Navbar />
      <ChatNotifier />
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1E293B', color: '#fff', border: '1px solid #334155' },
        }}
      />

      <div className="flex-1">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/movie/:id" element={<MovieDetailPage />} />
            <Route path="/person/:id" element={<ActorDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <FavoritesPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AnimatePresence>
      </div>

      <Footer />

      {/* Floating Wizard Button */}
      <motion.div
        layout
        className={`fixed bottom-6 z-50 ${chatOpen ? 'right-[22.125rem]' : 'right-[14.625rem]'}`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      >
        <motion.button
          animate={{
            boxShadow: [
              '0 8px 24px rgba(124, 58, 237, 0.5)',
              '0 8px 40px rgba(192, 38, 211, 0.8)',
              '0 8px 24px rgba(124, 58, 237, 0.5)',
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          whileHover={{ scale: 1.06, y: -3 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setWizardOpen(true)}
          title="Bana Film Bul"
          className="flex items-center gap-2.5 px-5 py-3.5 rounded-2xl text-white font-bold text-sm tracking-wide"
          style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #C026D3 100%)' }}
        >
          <motion.span
            animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
            transition={{ delay: 2, duration: 0.6, repeat: Infinity, repeatDelay: 4 }}
            className="text-xl"
          >
            🍿
          </motion.span>
          <span>Bana Film Bul!</span>
        </motion.button>
      </motion.div>

      {/* Wizard Modal */}
      <AnimatePresence>
        {wizardOpen && (
          <RecommendationWizard onClose={() => setWizardOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

