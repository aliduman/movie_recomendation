import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiTrash2 } from 'react-icons/fi';
import { useComments } from '../hooks/useComments';
import { useAuth } from '../contexts/AuthContext';

function timeAgo(ts) {
  if (!ts) return '';
  const sec = Math.floor((Date.now() - ts.toMillis()) / 1000);
  if (sec < 60) return 'az önce';
  if (sec < 3600) return `${Math.floor(sec / 60)} dk önce`;
  if (sec < 86400) return `${Math.floor(sec / 3600)} sa önce`;
  return `${Math.floor(sec / 86400)} gün önce`;
}

export default function MovieComments({ movieId }) {
  const { user } = useAuth();
  const { comments, loading, addComment, deleteComment } = useComments(movieId);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    await addComment(text);
    setText('');
    setSubmitting(false);
  };

  return (
    <section className="mt-12 pb-12">
      <h2 className="text-xl font-bold mb-6">💬 Yorumlar
        {comments.length > 0 && (
          <span className="ml-2 text-sm font-normal text-gray-400">({comments.length})</span>
        )}
      </h2>

      {/* Yorum formu */}
      {user ? (
        <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
          <img
            src={user.photoURL}
            alt=""
            className="w-10 h-10 rounded-full border-2 border-white/10 flex-shrink-0 mt-0.5"
          />
          <div className="flex-1 flex gap-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleSubmit(e); }}
              placeholder="Filmi değerlendir..."
              rows={2}
              className="flex-1 bg-dark border border-white/10 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-2.5 text-sm resize-none placeholder-gray-500 transition-all"
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
        </form>
      ) : (
        <div className="glass rounded-xl p-4 mb-8 text-center text-sm text-gray-400">
          Yorum yapmak için{' '}
          <Link to="/login" className="text-primary hover:text-secondary transition-colors font-medium">
            giriş yap
          </Link>
        </div>
      )}

      {/* Yorum listesi */}
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
          {comments.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex gap-3 group"
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
                </div>
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
                  {c.text}
                </p>
              </div>
              {user?.uid === c.uid && (
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => deleteComment(c.id)}
                  className="flex-shrink-0 self-start mt-1 p-1.5 rounded-lg text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <FiTrash2 size={14} />
                </motion.button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
