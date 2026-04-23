import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiSend, FiX, FiChevronDown } from 'react-icons/fi';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../contexts/AuthContext';
import { containsProfanity } from '../utils/profanityFilter';

function timeLabel(ts) {
  if (!ts) return '';
  const d = ts.toDate?.() || new Date(ts);
  return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

function ChatMessage({ msg, isMe }) {
  return (
    <div className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
      <img
        src={msg.photoURL}
        alt={msg.displayName}
        className="w-7 h-7 rounded-full border border-white/10 flex-shrink-0 mt-0.5"
      />
      <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
        {!isMe && (
          <span className="text-[10px] text-gray-500 px-1">{msg.displayName}</span>
        )}
        <div
          className={`px-3 py-2 rounded-2xl text-sm leading-relaxed break-words ${
            isMe
              ? 'bg-primary text-white rounded-tr-sm'
              : 'bg-white/8 text-gray-200 rounded-tl-sm'
          }`}
        >
          {msg.text}
        </div>
        <span className="text-[10px] text-gray-600 px-1">{timeLabel(msg.createdAt)}</span>
      </div>
    </div>
  );
}

function ChatPanel({ movieId, movieTitle, onClose, isMobile }) {
  const { user } = useAuth();
  const { messages, loading, sendMessage, markSeen, closeSeen } = useChat(movieId);
  const [text, setText] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    markSeen();
    inputRef.current?.focus();
    return () => closeSeen();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!text.trim()) return;
    if (containsProfanity(text)) return;
    await sendMessage(text);
    setText('');
  };

  const panelClass = isMobile
    ? 'fixed inset-0 z-[60] flex flex-col bg-[#111]'
    : 'flex flex-col w-80 h-[480px] bg-[#141414] rounded-2xl shadow-2xl border border-white/10 overflow-hidden';

  return (
    <motion.div
      className={panelClass}
      initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95, y: 20 }}
      animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
      exit={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95, y: 20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
        <div className="min-w-0">
          <p className="text-xs text-gray-500">Dedikodu Köşesi</p>
          <h3 className="font-bold text-sm truncate">{movieTitle}</h3>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors flex-shrink-0"
        >
          {isMobile ? <FiChevronDown size={20} /> : <FiX size={16} />}
        </button>
      </div>

      {/* Mesajlar */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}
        {!loading && messages.length === 0 && (
          <p className="text-center text-gray-600 text-xs py-8">
            Henüz mesaj yok. Sohbeti başlat!
          </p>
        )}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} msg={msg} isMe={msg.uid === user?.uid} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-white/10 flex-shrink-0">
        {user ? (
          <form onSubmit={handleSend} className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Mesaj yaz..."
              rows={1}
              className="flex-1 bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-xl px-3 py-2 text-sm resize-none placeholder-gray-600 transition-all"
              style={{ maxHeight: 80 }}
            />
            <motion.button
              type="submit"
              disabled={!text.trim()}
              whileTap={{ scale: 0.9 }}
              className="p-2.5 rounded-xl bg-primary hover:bg-primary/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              <FiSend size={15} />
            </motion.button>
          </form>
        ) : (
          <p className="text-center text-xs text-gray-500">
            Mesaj göndermek için{' '}
            <Link to="/login" className="text-primary hover:text-secondary transition-colors">
              giriş yap
            </Link>
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function MovieChat({ movieId, movieTitle }) {
  const [open, setOpen] = useState(false);
  const { unread } = useChat(movieId);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('chatToggle', { detail: { open } }));
  }, [open]);

  return (
    <>
      {/* Floating buton — desktop sağ alt */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-2xl text-white font-semibold text-sm shadow-xl shadow-black/40"
            style={{ background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)' }}
          >
            <FiMessageCircle size={18} />
            <span className="hidden sm:inline">Dedikodu Köşesi</span>
            {unread > 0 && (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Desktop panel — sağ alt köşe */}
      <AnimatePresence>
        {open && !isMobile && (
          <div className="fixed bottom-6 right-6 z-50">
            <ChatPanel
              movieId={movieId}
              movieTitle={movieTitle}
              onClose={() => setOpen(false)}
              isMobile={false}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Mobil — fullscreen */}
      <AnimatePresence>
        {open && isMobile && (
          <ChatPanel
            movieId={movieId}
            movieTitle={movieTitle}
            onClose={() => setOpen(false)}
            isMobile={true}
          />
        )}
      </AnimatePresence>
    </>
  );
}
