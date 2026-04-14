import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './contexts/AuthContext';
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

export default function App() {
  const [wizardOpen, setWizardOpen] = useState(false);

  return (
    <div className="min-h-screen bg-darker flex flex-col">
      <Navbar />
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
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 300, damping: 20 }}
        whileHover={{ scale: 1.12, rotate: 8 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setWizardOpen(true)}
        title="Film Sihirbazı"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-2xl shadow-primary/40"
        style={{
          background: 'linear-gradient(135deg, #6D28D9 0%, #9333EA 100%)',
        }}
      >
        🪄
      </motion.button>

      {/* Wizard Modal */}
      <AnimatePresence>
        {wizardOpen && (
          <RecommendationWizard onClose={() => setWizardOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

