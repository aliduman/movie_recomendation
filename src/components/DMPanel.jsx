import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSend, FiMessageSquare } from 'react-icons/fi';
import { useDM } from '../hooks/useDM';
import { useAuth } from '../contexts/AuthContext';

function timeLabel(ts) {
  if (!ts) return '';
  const d = ts.toDate?.() || new Date(ts);
  return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

export default function DMPanel({ otherUid, otherName, otherPhoto, onClose }) {
  const { user } = useAuth();
  const { messages, loading, sendMessage } = useDM(otherUid);
  const [text, setText] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!text.trim()) return;
    const msg = text;
    setText('');
    inputRef.current?.focus();
    await sendMessage(msg);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-6 right-6 z-[200] w-80 flex flex-col bg-[#141414] rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
      style={{ height: 420 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 flex-shrink-0">
        <img src={otherPhoto} alt="" className="w-8 h-8 rounded-full border border-white/10" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{otherName}</p>
          <p className="text-[10px] text-gray-500">Direkt Mesaj</p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors">
          <FiX size={16} />
        </button>
      </div>

      {/* Mesajlar */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {loading && (
          <div className="flex justify-center py-6">
            <div className="w-5 h-5 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}
        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <FiMessageSquare size={32} className="text-gray-700" />
            <p className="text-gray-600 text-xs">Konuşmayı başlat!</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.uid === user?.uid;
          return (
            <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
              <img src={msg.photoURL} alt="" className="w-6 h-6 rounded-full flex-shrink-0 mt-0.5 border border-white/10" />
              <div className={`max-w-[75%] flex flex-col gap-0.5 ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed break-words ${isMe ? 'bg-primary text-white rounded-tr-sm' : 'bg-white/8 text-gray-200 rounded-tl-sm'}`}>
                  {msg.text}
                </div>
                <span className="text-[10px] text-gray-600 px-1">{timeLabel(msg.createdAt)}</span>
              </div>
            </div>
          );
        })}
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
          <p className="text-center text-xs text-gray-500">Mesaj göndermek için giriş yap</p>
        )}
      </div>
    </motion.div>
  );
}
