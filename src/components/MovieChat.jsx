import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiSend, FiX, FiChevronDown, FiEdit2, FiTrash2, FiCheck } from 'react-icons/fi';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../contexts/AuthContext';
import { containsProfanity } from '../utils/profanityFilter';

function timeLabel(ts) {
  if (!ts) return '';
  const d = ts.toDate?.() || new Date(ts);
  return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

function ChatMessage({ msg, isMe, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(msg.text);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!editText.trim() || saving || containsProfanity(editText)) return;
    setSaving(true);
    await onUpdate(msg.id, editText);
    setSaving(false);
    setEditing(false);
  };

  return (
    <div className={`flex gap-2 group ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
      <img
        src={msg.photoURL}
        alt={msg.displayName}
        className="w-7 h-7 rounded-full border border-white/10 flex-shrink-0 mt-0.5"
      />
      <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
        {!isMe && (
          <span className="text-[10px] text-gray-500 px-1">{msg.displayName}</span>
        )}

        {editing ? (
          <div className="flex items-end gap-1">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSave(); } if (e.key === 'Escape') { setEditText(msg.text); setEditing(false); } }}
              autoFocus
              rows={2}
              className="bg-dark border border-primary/40 focus:outline-none rounded-xl px-3 py-1.5 text-sm resize-none w-48"
            />
            <div className="flex flex-col gap-1">
              <motion.button whileTap={{ scale: 0.9 }} onClick={handleSave} disabled={saving} className="p-1.5 rounded-lg bg-primary hover:bg-primary/80 disabled:opacity-40 transition-colors">
                <FiCheck size={12} />
              </motion.button>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setEditText(msg.text); setEditing(false); }} className="p-1.5 rounded-lg glass hover:bg-white/10 transition-colors">
                <FiX size={12} />
              </motion.button>
            </div>
          </div>
        ) : (
          <div
            className={`px-3 py-2 rounded-2xl text-sm leading-relaxed break-words ${
              isMe ? 'bg-primary text-white rounded-tr-sm' : 'bg-white/8 text-gray-200 rounded-tl-sm'
            }`}
          >
            {msg.text}
          </div>
        )}

        <div className={`flex items-center gap-1.5 px-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-[10px] text-gray-600">{timeLabel(msg.createdAt)}</span>
          {msg.editedAt && <span className="text-[10px] text-gray-600">(düzenlendi)</span>}
          {isMe && !editing && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setEditing(true)} className="text-gray-500 hover:text-primary transition-colors">
                <FiEdit2 size={10} />
              </button>
              <button onClick={() => onDelete(msg.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                <FiTrash2 size={10} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChatPanel({ movieId, movieTitle, onClose, isMobile }) {
  const { user } = useAuth();
  const { messages, loading, sendMessage, markSeen, closeSeen, deleteMessage, updateMessage } = useChat(movieId, movieTitle);
  const [text, setText] = useState('');
  const [vpHeight, setVpHeight] = useState(() => window.visualViewport?.height ?? window.innerHeight);
  const [vpTop, setVpTop] = useState(() => window.visualViewport?.offsetTop ?? 0);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isMobile) return;
    const vv = window.visualViewport;
    if (!vv) return;
    let prevHeight = vv.height;
    const update = () => {
      const shrinking = vv.height < prevHeight;
      prevHeight = vv.height;
      setVpHeight(vv.height);
      setVpTop(vv.offsetTop);
      if (shrinking) {
        requestAnimationFrame(() => {
          if (messagesRef.current) {
            messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
          }
        });
      }
    };
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => { vv.removeEventListener('resize', update); vv.removeEventListener('scroll', update); };
  }, [isMobile]);

  const messagesRef = useRef(null);

  useEffect(() => {
    if (!isMobile) return;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    const prevent = (e) => {
      if (messagesRef.current?.contains(e.target)) return;
      e.preventDefault();
    };
    document.addEventListener('touchmove', prevent, { passive: false });
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.removeEventListener('touchmove', prevent);
    };
  }, [isMobile]);

  useEffect(() => {
    markSeen();
    if (!isMobile) inputRef.current?.focus();
    return () => closeSeen();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!text.trim()) return;
    if (containsProfanity(text)) return;
    const msg = text;
    setText('');
    inputRef.current?.focus();
    await sendMessage(msg);
  };

  const panelClass = isMobile
    ? 'fixed top-0 left-0 right-0 z-[60] flex flex-col bg-[#111]'
    : 'flex flex-col w-80 h-[480px] bg-[#141414] rounded-2xl shadow-2xl border border-white/10 overflow-hidden';

  return (
    <motion.div
      className={panelClass}
      style={isMobile ? { height: vpHeight, top: vpTop } : undefined}
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
      <div ref={messagesRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
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
          <ChatMessage key={msg.id} msg={msg} isMe={msg.uid === user?.uid} onDelete={deleteMessage} onUpdate={updateMessage} />
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
