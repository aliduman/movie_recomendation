import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiBookmark, FiCheck, FiPlus, FiX } from 'react-icons/fi';
import { poster } from '../config/tmdb';
import { useWatchlists } from '../hooks/useWatchlist';
import { useTranslation } from 'react-i18next';

export default function WatchlistSelector({ movie, onClose }) {
  const { t } = useTranslation();
  const { watchlists, loading, createWatchlist, addMovieToWatchlist, getMovieWatchlistIds } = useWatchlists();
  const [selectedIds, setSelectedIds] = useState([]);
  const [checkingMembership, setCheckingMembership] = useState(true);
  const [createMode, setCreateMode] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [submittingId, setSubmittingId] = useState(null);
  const [creating, setCreating] = useState(false);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  useEffect(() => {
    let active = true;

    const loadMembership = async () => {
      setCheckingMembership(true);
      try {
        const ids = await getMovieWatchlistIds(movie.id);
        if (active) {
          setSelectedIds(ids);
        }
      } finally {
        if (active) {
          setCheckingMembership(false);
        }
      }
    };

    loadMembership();

    return () => {
      active = false;
    };
  }, [getMovieWatchlistIds, movie.id]);

  const submitList = async (watchlistId) => {
    setSubmittingId(watchlistId);
    try {
      const result = await addMovieToWatchlist(watchlistId, movie);

      if (!result.added) {
        toast(t('watchlist.alreadyInList', { name: result.watchlistName }));
        onClose();
        return;
      }

      toast.success(t('watchlist.addedToList', { name: result.watchlistName }));
      onClose();
    } finally {
      setSubmittingId(null);
    }
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setCreating(true);

    try {
      const listId = await createWatchlist(newListName);
      if (!listId) return;
      const result = await addMovieToWatchlist(listId, movie);
      toast.success(t('watchlist.createdAndAdded', { name: result.watchlistName || newListName.trim() }));
      onClose();
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

  const emptyState = useMemo(
    () => !loading && !checkingMembership && watchlists.length === 0,
    [checkingMembership, loading, watchlists.length],
  );

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[70] flex items-end sm:items-center sm:justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        <motion.div
          initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.94, y: 12 }}
          animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
          exit={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.94, y: 12 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          onClick={(event) => event.stopPropagation()}
          className="relative z-10 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border border-white/10 bg-slate-950/95 shadow-2xl shadow-black/50 overflow-hidden"
        >
          <div className="flex justify-center pt-3 sm:hidden">
            <div className="h-1 w-12 rounded-full bg-white/20" />
          </div>

          <div className="flex items-start gap-4 px-5 py-4 border-b border-white/10">
            <div className="w-14 h-20 rounded-2xl overflow-hidden bg-dark flex-shrink-0">
              {movie.poster_path ? (
                <img src={poster(movie.poster_path)} alt={movie.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">🎬</div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-[0.2em] text-primary/80">{t('watchlist.selectorTitle')}</p>
              <h3 className="mt-1 text-lg font-bold line-clamp-2">{movie.title}</h3>
              <p className="mt-2 text-sm text-gray-400">{t('watchlist.selectorSubtitle')}</p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <FiX size={18} />
            </button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto px-5 py-5 space-y-4">
            {(loading || checkingMembership) && (
              <div className="flex items-center justify-center py-10">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            )}

            {emptyState && (
              <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-5 text-center">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-sm text-gray-300">{t('watchlist.noListsYet')}</p>
                <p className="mt-1 text-xs text-gray-500">{t('watchlist.noListsHint')}</p>
              </div>
            )}

            {!loading && !checkingMembership && watchlists.length > 0 && (
              <div className="space-y-3">
                {watchlists.map((watchlist) => {
                  const selected = selectedIds.includes(watchlist.id);
                  const busy = submittingId === watchlist.id;

                  return (
                    <button
                      key={watchlist.id}
                      onClick={() => !selected && !busy && submitList(watchlist.id)}
                      disabled={selected || busy}
                      className={`w-full rounded-3xl border px-4 py-4 text-left transition-all ${
                        selected
                          ? 'border-emerald-500/30 bg-emerald-500/10'
                          : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/30'
                      } ${busy ? 'opacity-70 cursor-wait' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-16 rounded-2xl overflow-hidden bg-dark flex-shrink-0">
                          {watchlist.coverPosterPath ? (
                            <img src={poster(watchlist.coverPosterPath)} alt={watchlist.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl">🎞️</div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="font-semibold line-clamp-1">{watchlist.name}</p>
                          <p className="mt-1 text-sm text-gray-400">
                            {t('watchlist.movieCount', { count: watchlist.movieCount || 0 })}
                          </p>
                        </div>

                        <div className={`flex items-center gap-2 text-sm font-medium ${selected ? 'text-emerald-300' : 'text-primary'}`}>
                          {selected ? <FiCheck size={16} /> : <FiBookmark size={16} />}
                          <span>{selected ? t('watchlist.addedBadge') : t('watchlist.addHere')}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {(emptyState || createMode) && (
              <form onSubmit={handleCreate} className="rounded-3xl border border-white/10 bg-white/5 p-4 space-y-3">
                <label className="block text-sm font-medium text-white">{t('watchlist.newListLabel')}</label>
                <input
                  value={newListName}
                  onChange={(event) => setNewListName(event.target.value)}
                  placeholder={t('watchlist.newListPlaceholder')}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40"
                  maxLength={40}
                  autoFocus
                />
                <div className="flex flex-wrap justify-end gap-2">
                  {watchlists.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setCreateMode(false);
                        setNewListName('');
                      }}
                      className="px-4 py-2 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      {t('watchlist.cancelCreate')}
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={creating}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/80 text-sm font-semibold transition-colors disabled:opacity-60"
                  >
                    <FiPlus size={16} />
                    {creating ? t('watchlist.creating') : t('watchlist.createAndAdd')}
                  </button>
                </div>
              </form>
            )}
          </div>

          {!createMode && watchlists.length > 0 && (
            <div className="border-t border-white/10 px-5 py-4">
              <button
                onClick={() => setCreateMode(true)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                <FiPlus size={16} />
                {t('watchlist.createNewInline')}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
