import { useState, useEffect, useRef } from 'react';
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  setDoc,
  onSnapshot,
  orderBy,
  query,
  limit,
  serverTimestamp,
  doc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { notifyChat } from '../utils/notify';
import { mediaCollection, mediaDocId } from '../utils/media';

// Per-room last-seen key. Scoped by media type so a movie and a TV series
// sharing the same TMDB id don't share an unread counter.
const LAST_SEEN_KEY = (mediaType, movieId) => `chat_last_seen_${mediaType}_${movieId}`;

export function useChat(movieId, movieTitle, mediaType = 'movie') {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const isOpenRef = useRef(false);
  const coll = mediaCollection(mediaType);
  const participationDocId = mediaDocId(movieId, mediaType);

  useEffect(() => {
    if (!movieId) return;
    const q = query(
      collection(db, coll, String(movieId), 'chat'),
      orderBy('createdAt', 'asc'),
      limit(100),
    );
    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(msgs);
      setLoading(false);

      if (!isOpenRef.current) {
        const lastSeen = Number(localStorage.getItem(LAST_SEEN_KEY(mediaType, movieId)) || 0);
        const newCount = msgs.filter(
          (m) => m.createdAt?.toMillis?.() > lastSeen,
        ).length;
        setUnread(newCount);
      }
    });
    return () => unsub();
  }, [movieId, coll, mediaType]);

  const markSeen = () => {
    isOpenRef.current = true;
    localStorage.setItem(LAST_SEEN_KEY(mediaType, movieId), Date.now());
    setUnread(0);
  };

  const closeSeen = () => {
    isOpenRef.current = false;
  };

  const sendMessage = async (text) => {
    if (!user || !text.trim()) return;
    await addDoc(collection(db, coll, String(movieId), 'chat'), {
      uid: user.uid,
      displayName: user.displayName || user.email?.split('@')[0] || 'Kullanıcı',
      photoURL: user.photoURL || '',
      text: text.trim(),
      createdAt: serverTimestamp(),
    });
    // Katılım kaydı — bildirim ve e-posta için
    await setDoc(
      doc(db, 'users', user.uid, 'chatParticipation', participationDocId),
      {
        movieId: String(movieId),
        mediaType,
        movieTitle: movieTitle || '',
        email: user.email,
        lastMessageAt: serverTimestamp(),
      },
      { merge: true },
    );
    notifyChat(String(movieId), text.trim(), mediaType);
  };

  const deleteMessage = async (messageId) => {
    await deleteDoc(doc(db, coll, String(movieId), 'chat', messageId));
  };

  const updateMessage = async (messageId, text) => {
    await updateDoc(doc(db, coll, String(movieId), 'chat', messageId), {
      text: text.trim(),
      editedAt: serverTimestamp(),
    });
  };

  return { messages, unread, loading, sendMessage, markSeen, closeSeen, deleteMessage, updateMessage };
}
