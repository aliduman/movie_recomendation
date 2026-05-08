import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FiArrowLeft,
  FiCheck,
  FiEdit2,
  FiTrash2,
  FiX,
} from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import MovieCard from '../components/MovieCard';
import { poster } from '../config/tmdb';
import { useWatchlistDetail, useWatchlists } from '../hooks/useWatchlist';

export default function WatchlistDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { watchlist, movies, loading } = useWatchlistDetail(id);
  const { renameWatchlist, deleteWatchlist, removeMovieFromWatchlist } = useWatchlists();

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [renaming, setRenaming] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [removingDocId, setRemovingDocId] = useState(null);

  const startEdit = () => {
    setEditName(watchlist?.name || '');
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditName('');
  };

  const submitRename = async (event) => {
    event.preventDefault();
    setRenaming(true);
    try {
      await renameWatchlist(id, editName);
      toast.success(t('watchlist.renamed'));
      setEditing(false);
    } catch (error) {
      if (error.message === 'WATCHLIST_NAME_EXISTS') {
        toast.error(t('watchlist.nameExists'));
      } else if (error.message === 'WATCHLIST_NAME_REQUIRED') {
        toast.error(t('watchlist.nameRequired'));
      } else {
        toast.error(t('watchlist.renameFailed'));
      }
    } finally {
      setRenaming(false);
    }
  };

  const submitDelete = async () => {
    setDeleting(true);
    try {
      await deleteWatchlist(id);
      toast.success(t('watchlist.deleted'));
      navigate('/watchlist');
    } catch (error) {
      console.error(error);
      toast.error(t('watchlist.deleteFailed'));
      setDeleting(false);
    }
  };

  const submitRemove = async (movie) => {
    const docId = movie.docId || movie.id;
    setRemovingDocId(docId);
    try {
      await removeMovieFromWatchlist(id, docId);
      toast.success(t('watchlist.movieRemoved'));
    } catch (error) {
      console.error(error);
      toast.error(t('watchlist.removeFailed'));
    } finally {
      setRemovingDocId(null);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-darker">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!watchlist) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="pt-24 pb-12 max-w-5xl mx-auto px-4"
      >
        <Link
          to="/watchlist"
          className="inline-flex items-center gap-2 rounded-2xl glass px-4 py-2 text-sm hover:bg-white/10 transition-colors"
        >
          <FiArrowLeft size={16} />
          {t('watchlist.backToLists')}
        </Link>

        <div className="mt-10 rounded-[2rem] border border-dashed border-white/10 bg-white/5 py-20 text-center">
          <div className="text-5xl mb-4">🫥</div>
          <p className="text-lg text-gray-300">{t('watchlist.notFound')}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-24 pb-12 max-w-7xl mx-auto px-4"
    >
      <Link
        to="/watchlist"
        className="inline-flex items-center gap-2 rounded-2xl glass px-4 py-2 text-sm hover:bg-white/10 transition-colors"
      >
        <FiArrowLeft size={16} />
        {t('watchlist.backToLists')}
      </Link>

      <div className="mt-6 overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80">
        <div className="relative h-64 sm:h-72 bg-dark overflow-hidden">
          {watchlist.coverPosterPath ? (
            <>
              <img
                src={poster(watchlist.coverPosterPath)}
                alt={watchlist.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-darker via-darker/70 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-purple-500/10 to-darker flex items-center justify-center text-6xl">
              🎞️
            </div>
          )}
        </div>

        <div className="relative -mt-20 px-6 pb-6 sm:px-8 sm:pb-8">
          <div className="glass rounded-[2rem] border border-white/10 p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-[0.25em] text-primary/80">
                  {t('watchlist.detailLabel')}
                </p>

                {editing ? (
                  <form onSubmit={submitRename} className="mt-3 flex flex-col sm:flex-row gap-2 sm:items-center">
                    <input
                      value={editName}
                      onChange={(event) => setEditName(event.target.value)}
                      placeholder={t('watchlist.renamePlaceholder')}
                      className="flex-1 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-lg font-semibold text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40"
                      maxLength={40}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-4 py-3 rounded-2xl text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        {t('watchlist.cancelCreate')}
                      </button>
                      <button
                        type="submit"
                        disabled={renaming}
                        className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-primary hover:bg-primary/80 text-sm font-semibold transition-colors disabled:opacity-60"
                      >
                        <FiCheck size={14} />
                        {renaming ? t('watchlist.creating') : t('watchlist.saveName')}
                      </button>
                    </div>
                  </form>
                ) : (
                  <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold break-words">
                    {watchlist.name}
                  </h1>
                )}

                <p className="mt-3 text-gray-400">
                  {t('watchlist.movieCount', { count: movies.length })}
                </p>
              </div>

              {!editing && (
                <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={startEdit}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm transition-colors"
                  >
                    <FiEdit2 size={14} />
                    <span className="hidden sm:inline">{t('watchlist.renameAction')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-200 text-sm transition-colors"
                  >
                    <FiTrash2 size={14} />
                    <span className="hidden sm:inline">{t('watchlist.deleteAction')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {movies.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-6xl block mb-4">🍿</span>
          <p className="text-gray-400 text-lg">{t('watchlist.detailEmpty')}</p>
        </div>
      ) : (
        <section className="mt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {movies.map((movie) => {
              const docId = movie.docId || movie.id;
              const isRemoving = removingDocId === docId;
              return (
                <div key={docId} className="relative group/movie">
                  <MovieCard movie={movie} />
                  <button
                    type="button"
                    onClick={() => submitRemove(movie)}
                    disabled={isRemoving}
                    aria-label={t('watchlist.removeMovie')}
                    title={t('watchlist.removeMovie')}
                    className="absolute top-2 left-2 z-20 p-2 rounded-full bg-slate-950/80 backdrop-blur-sm text-rose-300 hover:bg-rose-500/30 hover:text-white border border-white/10 transition-all opacity-0 group-hover/movie:opacity-100 focus:opacity-100 disabled:opacity-60"
                  >
                    {isRemoving ? (
                      <span className="block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <FiTrash2 size={14} />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center p-4"
            onClick={() => !deleting && setConfirmDelete(false)}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              onClick={(event) => event.stopPropagation()}
              className="relative z-10 w-full max-w-sm rounded-[2rem] border border-white/10 bg-slate-950/95 p-6 shadow-2xl shadow-black/50"
            >
              <button
                type="button"
                onClick={() => !deleting && setConfirmDelete(false)}
                className="absolute top-3 right-3 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <FiX size={16} />
              </button>

              <div className="text-center">
                <div className="text-4xl mb-3">🗑️</div>
                <h3 className="text-lg font-bold text-white">
                  {t('watchlist.deleteConfirm', { name: watchlist.name })}
                </h3>
                <p className="mt-2 text-sm text-gray-400">
                  {t('watchlist.deleteConfirmDesc', { count: movies.length })}
                </p>

                <div className="mt-5 flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    disabled={deleting}
                    className="px-4 py-2 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-60"
                  >
                    {t('watchlist.cancelDelete')}
                  </button>
                  <button
                    type="button"
                    onClick={submitDelete}
                    disabled={deleting}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-sm font-semibold text-white transition-colors disabled:opacity-60"
                  >
                    <FiTrash2 size={14} />
                    {deleting ? t('watchlist.creating') : t('watchlist.confirmDelete')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
