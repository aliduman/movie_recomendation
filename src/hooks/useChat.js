import { useState, useEffect, useRef } from 'react';
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

const LAST_SEEN_KEY = (movieId) => `chat_last_seen_${movieId}`;

export function useChat(movieId) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const isOpenRef = useRef(false);

  useEffect(() => {
    if (!movieId) return;
    const q = query(
      collection(db, 'movies', String(movieId), 'chat'),
      orderBy('createdAt', 'asc'),
      limit(100),
    );
    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(msgs);
      setLoading(false);

      if (!isOpenRef.current) {
        const lastSeen = Number(localStorage.getItem(LAST_SEEN_KEY(movieId)) || 0);
        const newCount = msgs.filter(
          (m) => m.createdAt?.toMillis?.() > lastSeen,
        ).length;
        setUnread(newCount);
      }
    });
    return () => unsub();
  }, [movieId]);

  const markSeen = () => {
    isOpenRef.current = true;
    localStorage.setItem(LAST_SEEN_KEY(movieId), Date.now());
    setUnread(0);
  };

  const closeSeen = () => {
    isOpenRef.current = false;
  };

  const sendMessage = async (text) => {
    if (!user || !text.trim()) return;
    await addDoc(collection(db, 'movies', String(movieId), 'chat'), {
      uid: user.uid,
      displayName: user.displayName,
      photoURL: user.photoURL,
      text: text.trim(),
      createdAt: serverTimestamp(),
    });
  };

  return { messages, unread, loading, sendMessage, markSeen, closeSeen };
}
