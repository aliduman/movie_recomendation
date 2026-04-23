import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiTrash2, FiEdit2, FiCheck, FiX, FiMessageSquare } from 'react-icons/fi';
import { useComments } from '../hooks/useComments';
import { useAuth } from '../contexts/AuthContext';
import { containsProfanity } from '../utils/profanityFilter';

function timeAgo(ts) {
  if (!ts) return '';
  const sec = Math.floor((Date.now() - ts.toMillis()) / 1000);
  if (sec < 60) return 'az önce';
  if (sec < 3600) return `${Math.floor(sec / 60)} dk önce`;
  if (sec < 86400) return `${Math.floor(sec / 3600)} sa önce`;
  return `${Math.floor(sec / 86400)} gün önce`;
}

function CommentItem({ c, user, onDelete, onUpdate }) {
  const isOwner = user?.uid === c.uid;
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(c.text);
  const [editError, setEditError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!editText.trim() || saving) return;
    if (containsProfanity(editText)) {
      setEditError('Uygunsuz ifade içeriyor.');
      return;
    }
    setSaving(true);
    await onUpdate(c.id, editText);
    setSaving(false);
    setEditing(false);
    setEditError('');
  };

  const handleCancel = () => {
    setEditText(c.text);
    setEditError('');
    setEditing(false);
  };

  return (
    <motion.div
      key={c.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex gap-3 group rounded-2xl p-3 transition-colors ${isOwner ? 'bg-primary/10 border border-primary/20' : 'bg-white/[0.02]'}`}
    >
      <img
        src={c.photoURL}
        alt={c.displayName}
        className="w-9 h-9 rounded-full border border-white/10 flex-shrink-0 mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold">{c.displayName}</span>
          <span className="text-xs text-gray-500">{timeAgo(c.createdAt)}</span>
          {c.editedAt && <span className="text-xs text-gray-600">(düzenlendi)</span>}
        </div>

        {editing ? (
          <div className="flex flex-col gap-1.5">
            {editError && <p className="text-xs text-red-400">{editError}</p>}
            <div className="flex gap-2">
              <textarea
                value={editText}
                onChange={(e) => { setEditText(e.target.value); setEditError(''); }}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSave(); } if (e.key === 'Escape') handleCancel(); }}
                rows={2}
                autoFocus
                className={`flex-1 bg-dark border focus:outline-none focus:ring-2 rounded-xl px-3 py-2 text-sm resize-none transition-all ${
                  editError
                    ? 'border-red-500/60 focus:ring-red-500/20'
                    : 'border-white/10 focus:border-primary/50 focus:ring-primary/20'
                }`}
              />
              <div className="flex flex-col gap-1 self-end">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSave}
                  disabled={saving || !editText.trim()}
                  className="p-2 rounded-lg bg-primary hover:bg-primary/80 disabled:opacity-40 transition-colors"
                >
                  <FiCheck size={14} />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCancel}
                  className="p-2 rounded-lg glass hover:bg-white/10 transition-colors"
                >
                  <FiX size={14} />
                </motion.button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
            {c.text}
          </p>
        )}
      </div>

      {isOwner && !editing && (
        <div className="flex-shrink-0 flex items-start gap-1.5 mt-0.5">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => { setEditText(c.text); setEditing(true); }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary text-gray-400 text-xs font-medium transition-colors"
            title="Düzenle"
          >
            <FiEdit2 size={12} /> Düzenle
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => onDelete(c.id)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-gray-400 text-xs font-medium transition-colors"
            title="Sil"
          >
            <FiTrash2 size={12} /> Sil
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}

const LIMIT = 10;

function AllCommentsModal({ comments, user, onDelete, onUpdate, onClose }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <motion.div
        className="relative w-full max-w-2xl bg-[#141414] rounded-3xl shadow-2xl flex flex-col max-h-[85vh]"
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-bold">💬 Tüm Yorumlar
            <span className="ml-2 text-sm font-normal text-gray-400">({comments.length})</span>
          </h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <FiX size={18} />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-4 space-y-4">
          <AnimatePresence initial={false}>
            {comments.map((c) => (
              <CommentItem key={c.id} c={c} user={user} onDelete={onDelete} onUpdate={onUpdate} />
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function MovieComments({ movieId }) {
  const { user } = useAuth();
  const { comments, loading, addComment, deleteComment, updateComment } = useComments(movieId);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [allOpen, setAllOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;
    if (containsProfanity(text)) {
      setError('Yorumunuz uygunsuz ifadeler içeriyor.');
      return;
    }
    setError('');
    setSubmitting(true);
    await addComment(text);
    setText('');
    setSubmitting(false);
  };

  return (
    <section className="mt-12 pb-12">
      <h2 className="text-xl font-bold mb-6">
        💬 Yorumlar
        {comments.length > 0 && (
          <span className="ml-2 text-sm font-normal text-gray-400">({comments.length})</span>
        )}
      </h2>

      {user ? (
        <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
          <img
            src={user.photoURL}
            alt=""
            className="w-10 h-10 rounded-full border-2 border-white/10 flex-shrink-0 mt-0.5"
          />
          <div className="flex-1 flex flex-col gap-1.5">
            {error && <p className="text-xs text-red-400 px-1">{error}</p>}
            <div className="flex gap-2">
              <textarea
                value={text}
                onChange={(e) => { setText(e.target.value); setError(''); }}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleSubmit(e); }}
                placeholder="Filmi değerlendir..."
                rows={2}
                className={`flex-1 bg-dark border focus:outline-none focus:ring-2 rounded-xl px-4 py-2.5 text-sm resize-none placeholder-gray-500 transition-all ${
                  error
                    ? 'border-red-500/60 focus:border-red-500/60 focus:ring-red-500/20'
                    : 'border-white/10 focus:border-primary/50 focus:ring-primary/20'
                }`}
              />
              <motion.button
                type="submit"
                disabled={!text.trim() || submitting}
                whileTap={{ scale: 0.9 }}
                className="flex-shrink-0 self-end p-3 rounded-xl bg-primary hover:bg-primary/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <FiSend size={16} />
              </motion.button>
            </div>
          </div>
        </form>
      ) : (
        <div className="glass rounded-xl p-4 mb-8 text-center text-sm text-gray-400">
          Yorum yapmak için{' '}
          <Link to="/login" className="text-primary hover:text-secondary transition-colors font-medium">
            giriş yap
          </Link>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {!loading && comments.length === 0 && (
        <p className="text-center text-gray-500 text-sm py-8">
          Henüz yorum yok. İlk yorumu sen yap!
        </p>
      )}

      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {comments.slice(0, LIMIT).map((c) => (
            <CommentItem
              key={c.id}
              c={c}
              user={user}
              onDelete={deleteComment}
              onUpdate={updateComment}
            />
          ))}
        </AnimatePresence>
      </div>

      {comments.length > LIMIT && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setAllOpen(true)}
          className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl glass hover:bg-white/10 transition-colors text-sm font-medium text-gray-300"
        >
          <FiMessageSquare size={15} />
          Tüm {comments.length} yorumu gör
        </motion.button>
      )}

      <AnimatePresence>
        {allOpen && (
          <AllCommentsModal
            comments={comments}
            user={user}
            onDelete={deleteComment}
            onUpdate={updateComment}
            onClose={() => setAllOpen(false)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
