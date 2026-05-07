import { lazy, Suspense, useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './contexts/AuthContext';
import { useChatNotifications } from './hooks/useChatNotifications';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { useFCM } from './hooks/useFCM.jsx';
import NotificationBanner from './components/NotificationBanner';
import { useTranslation } from 'react-i18next';

const HomePage = lazy(() => import('./pages/HomePage'));
const ExplorePage = lazy(() => import('./pages/ExplorePage'));
const MovieDetailPage = lazy(() => import('./pages/MovieDetailPage'));
const ActorDetailPage = lazy(() => import('./pages/ActorDetailPage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const WatchlistPage = lazy(() => import('./pages/WatchlistPage'));
const WatchlistDetailPage = lazy(() => import('./pages/WatchlistDetailPage'));
const RecommendationWizard = lazy(() => import('./components/RecommendationWizard'));
const TipsTour = lazy(() => import('./components/TipsTour'));

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

function RouteFallback() {
  return <div className="min-h-[40vh]" />;
}

export default function App() {
  const [wizardOpen, setWizardOpen] = useState(false);
  const { t } = useTranslation();
  const [chatOpen, setChatOpen] = useState(false);
  const [showTour, setShowTour] = useState(false);
  useEffect(() => {
    if (localStorage.getItem('mfp_onboarded')) return;
    const t = setTimeout(() => setShowTour(true), 1800);
    return () => clearTimeout(t);
  }, []);
  const location = useLocation();
  const isDetailPage = /^\/movie\//.test(location.pathname);
  const { showBanner, requestPermission, dismiss } = useFCM();

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
        <Suspense fallback={<RouteFallback />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<HomePage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/movie/:id" element={<MovieDetailPage />} />
              <Route path="/person/:id" element={<ActorDetailPage />} />
              <Route path="/profile/:uid" element={<ProfilePage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/favorites"
                element={
                  <ProtectedRoute>
                    <FavoritesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/watchlist"
                element={
                  <ProtectedRoute>
                    <WatchlistPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/watchlist/:id"
                element={
                  <ProtectedRoute>
                    <WatchlistDetailPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </div>

      <Footer />

      {showBanner && (
        <NotificationBanner onAllow={requestPermission} onDismiss={dismiss} />
      )}

      {/* Floating Wizard Button */}
      <motion.div
        layout
        className={`fixed z-50 ${isDetailPage ? `bottom-24 sm:bottom-6 ${chatOpen ? 'right-[22.125rem]' : 'right-4 sm:right-[14.625rem]'}` : 'bottom-6 right-6'}`}
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
          data-tour="wizard"
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
          <span className="whitespace-nowrap">{t('wizard.button')}</span>
        </motion.button>
      </motion.div>

      {/* Wizard Modal */}
      <AnimatePresence>
        {wizardOpen && (
          <Suspense fallback={null}>
            <RecommendationWizard onClose={() => setWizardOpen(false)} />
          </Suspense>
        )}
      </AnimatePresence>

      {/* Tips Tour */}
      <AnimatePresence>
        {showTour && (
          <Suspense fallback={null}>
            <TipsTour
              onDone={() => {
                localStorage.setItem('mfp_onboarded', '1');
                setShowTour(false);
              }}
            />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  );
}
