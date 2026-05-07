import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiArrowRight, FiPlus } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { poster } from '../config/tmdb';
import { useWatchlists } from '../hooks/useWatchlist';
import { useAuth } from '../contexts/AuthContext';

export default function WatchlistPage() {
  const { watchlists, loading, createWatchlist } = useWatchlists();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async (event) => {
    event.preventDefault();
    setCreating(true);

    try {
      await createWatchlist(newListName);
      setNewListName('');
      setShowCreateForm(false);
      toast.success(t('watchlist.created'));
    } catch (error) {
      if (error.message === 'WATCHLIST_NAME_EXISTS') {
        toast.error(t('watchlist.nameExists'));
      } else if (error.message === 'WATCHLIST_NAME_REQUIRED') {
        toast.error(t('watchlist.nameRequired'));
      } else {
        toast.error(t('watchlist.createFailed'));
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-24 pb-12 max-w-7xl mx-auto px-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">📋 {t('watchlist.title')}</h1>
          <p className="text-gray-400">
            {user?.displayName ? `${user.displayName} ${t('watchlist.subtitle')}` : t('watchlist.subtitle')}
          </p>
        </div>

        <button
          onClick={() => setShowCreateForm((current) => !current)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-primary hover:bg-primary/80 font-semibold transition-colors"
        >
          <FiPlus size={18} />
          {t('watchlist.createButton')}
        </button>
      </div>

      {showCreateForm && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleCreate}
          className="glass rounded-3xl border border-white/10 p-5 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-3">
            <input
              value={newListName}
              onChange={(event) => setNewListName(event.target.value)}
              placeholder={t('watchlist.newListPlaceholder')}
              className="flex-1 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40"
              maxLength={40}
              autoFocus
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewListName('');
                }}
                className="px-4 py-3 rounded-2xl text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                {t('watchlist.cancelCreate')}
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-5 py-3 rounded-2xl bg-primary hover:bg-primary/80 text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {creating ? t('watchlist.creating') : t('watchlist.createAction')}
              </button>
            </div>
          </div>
        </motion.form>
      )}

      {loading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-darker">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : watchlists.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 rounded-[2rem] border border-dashed border-white/10 bg-white/5"
        >
          <span className="text-6xl block mb-4">🗂️</span>
          <p className="text-gray-300 text-lg">{t('watchlist.empty')}</p>
          <p className="text-gray-500 text-sm mt-2">{t('watchlist.emptyHint')}</p>
        </motion.div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {watchlists.map((watchlist, index) => (
            <motion.div
              key={watchlist.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <Link
                to={`/watchlist/${watchlist.id}`}
                className="group block overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/70 shadow-xl shadow-black/20 hover:border-primary/30 transition-colors"
              >
                <div className="relative h-48 overflow-hidden bg-dark">
                  {watchlist.coverPosterPath ? (
                    <>
                      <img
                        src={poster(watchlist.coverPosterPath)}
                        alt={watchlist.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-primary/20 via-purple-500/10 to-slate-900">
                      🎬
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold line-clamp-1">{watchlist.name}</h2>
                      <p className="mt-2 text-sm text-gray-400">
                        {t('watchlist.movieCount', { count: watchlist.movieCount || 0 })}
                      </p>
                    </div>

                    <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary">
                      {t('watchlist.openDetails')}
                      <FiArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>

                  {watchlist.lastMovieTitle && (
                    <p className="mt-4 text-sm text-gray-500 line-clamp-1">
                      {t('watchlist.lastAdded', { title: watchlist.lastMovieTitle })}
                    </p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
