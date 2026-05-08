import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FiArrowRight,
  FiCheck,
  FiEdit2,
  FiMoreVertical,
  FiPlus,
  FiTrash2,
  FiX,
} from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { poster } from '../config/tmdb';
import { useWatchlists } from '../hooks/useWatchlist';
import { useAuth } from '../contexts/AuthContext';

export default function WatchlistPage() {
  const {
    watchlists,
    loading,
    createWatchlist,
    renameWatchlist,
    deleteWatchlist,
  } = useWatchlists();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [creating, setCreating] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [renamingId, setRenamingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpenId) return undefined;
    const handleClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpenId]);

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

  const startEdit = (watchlist) => {
    setMenuOpenId(null);
    setConfirmDeleteId(null);
    setEditingId(watchlist.id);
    setEditName(watchlist.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const submitRename = async (event, watchlistId) => {
    event.preventDefault();
    setRenamingId(watchlistId);
    try {
      await renameWatchlist(watchlistId, editName);
      toast.success(t('watchlist.renamed'));
      cancelEdit();
    } catch (error) {
      if (error.message === 'WATCHLIST_NAME_EXISTS') {
        toast.error(t('watchlist.nameExists'));
      } else if (error.message === 'WATCHLIST_NAME_REQUIRED') {
        toast.error(t('watchlist.nameRequired'));
      } else {
        toast.error(t('watchlist.renameFailed'));
      }
    } finally {
      setRenamingId(null);
    }
  };

  const requestDelete = (watchlistId) => {
    setMenuOpenId(null);
    setEditingId(null);
    setConfirmDeleteId(watchlistId);
  };

  const cancelDelete = () => setConfirmDeleteId(null);

  const submitDelete = async (watchlistId) => {
    setDeletingId(watchlistId);
    try {
      await deleteWatchlist(watchlistId);
      toast.success(t('watchlist.deleted'));
      setConfirmDeleteId(null);
    } catch (error) {
      console.error(error);
      toast.error(t('watchlist.deleteFailed'));
    } finally {
      setDeletingId(null);
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
          {watchlists.map((watchlist, index) => {
            const isEditing = editingId === watchlist.id;
            const isMenuOpen = menuOpenId === watchlist.id;
            const isConfirming = confirmDeleteId === watchlist.id;
            const isRenaming = renamingId === watchlist.id;
            const isDeleting = deletingId === watchlist.id;

            return (
              <motion.div
                key={watchlist.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="relative group/card"
              >
                <Link
                  to={`/watchlist/${watchlist.id}`}
                  className="block overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/70 shadow-xl shadow-black/20 hover:border-primary/30 transition-colors"
                >
                  <div className="relative h-48 overflow-hidden bg-dark">
                    {watchlist.coverPosterPath ? (
                      <>
                        <img
                          src={poster(watchlist.coverPosterPath)}
                          alt={watchlist.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
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
                    {isEditing ? (
                      <form
                        onSubmit={(event) => submitRename(event, watchlist.id)}
                        onClick={(event) => event.preventDefault()}
                        className="space-y-3"
                      >
                        <input
                          value={editName}
                          onChange={(event) => setEditName(event.target.value)}
                          onClick={(event) => event.stopPropagation()}
                          placeholder={t('watchlist.renamePlaceholder')}
                          className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40"
                          maxLength={40}
                          autoFocus
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              cancelEdit();
                            }}
                            className="px-3 py-2 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            {t('watchlist.cancelCreate')}
                          </button>
                          <button
                            type="submit"
                            disabled={isRenaming}
                            onClick={(event) => event.stopPropagation()}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary hover:bg-primary/80 text-sm font-semibold transition-colors disabled:opacity-60"
                          >
                            <FiCheck size={14} />
                            {isRenaming ? t('watchlist.creating') : t('watchlist.saveName')}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h2 className="text-xl font-bold line-clamp-1">{watchlist.name}</h2>
                          <p className="mt-2 text-sm text-gray-400">
                            {t('watchlist.movieCount', { count: watchlist.movieCount || 0 })}
                          </p>
                        </div>

                        <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary">
                          {t('watchlist.openDetails')}
                          <FiArrowRight size={15} className="transition-transform duration-300 group-hover/card:translate-x-1" />
                        </span>
                      </div>
                    )}

                    {watchlist.lastMovieTitle && !isEditing && (
                      <p className="mt-4 text-sm text-gray-500 line-clamp-1">
                        {t('watchlist.lastAdded', { title: watchlist.lastMovieTitle })}
                      </p>
                    )}
                  </div>
                </Link>

                {!isEditing && (
                  <div className="absolute top-3 right-3 z-10" ref={isMenuOpen ? menuRef : null}>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setMenuOpenId((current) => (current === watchlist.id ? null : watchlist.id));
                      }}
                      aria-label={t('watchlist.listActions')}
                      className="p-2 rounded-full bg-slate-950/70 backdrop-blur-sm text-white hover:bg-slate-950 border border-white/10 transition-colors"
                    >
                      <FiMoreVertical size={16} />
                    </button>

                    <AnimatePresence>
                      {isMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -6, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-48 rounded-2xl border border-white/10 bg-slate-950/95 backdrop-blur-md shadow-2xl shadow-black/50 overflow-hidden"
                        >
                          <button
                            type="button"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              startEdit(watchlist);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors text-left"
                          >
                            <FiEdit2 size={14} />
                            {t('watchlist.renameAction')}
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              requestDelete(watchlist.id);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
                          >
                            <FiTrash2 size={14} />
                            {t('watchlist.deleteAction')}
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                <AnimatePresence>
                  {isConfirming && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-20 flex items-center justify-center rounded-[2rem] bg-slate-950/85 backdrop-blur-sm p-5"
                      onClick={cancelDelete}
                    >
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={(event) => event.stopPropagation()}
                        className="w-full max-w-xs rounded-2xl border border-white/10 bg-slate-900/95 p-5 text-center"
                      >
                        <div className="text-3xl mb-2">🗑️</div>
                        <p className="font-semibold text-white">
                          {t('watchlist.deleteConfirm', { name: watchlist.name })}
                        </p>
                        <p className="mt-2 text-xs text-gray-400">
                          {t('watchlist.deleteConfirmDesc', { count: watchlist.movieCount || 0 })}
                        </p>
                        <div className="mt-4 flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={cancelDelete}
                            className="px-3 py-2 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            {t('watchlist.cancelDelete')}
                          </button>
                          <button
                            type="button"
                            onClick={() => submitDelete(watchlist.id)}
                            disabled={isDeleting}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-sm font-semibold text-white transition-colors disabled:opacity-60"
                          >
                            <FiTrash2 size={14} />
                            {isDeleting ? t('watchlist.creating') : t('watchlist.confirmDelete')}
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={cancelDelete}
                          className="absolute top-3 right-3 p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <FiX size={16} />
                        </button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
