import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

export function useComments(movieId) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!movieId) return;
    const q = query(
      collection(db, 'movies', String(movieId), 'comments'),
      orderBy('createdAt', 'desc'),
    );
    const unsub = onSnapshot(q, (snap) => {
      setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [movieId]);

  const addComment = async (text) => {
    if (!user || !text.trim()) return;
    await addDoc(collection(db, 'movies', String(movieId), 'comments'), {
      uid: user.uid,
      displayName: user.displayName,
      photoURL: user.photoURL,
      text: text.trim(),
      createdAt: serverTimestamp(),
    });
  };

  const deleteComment = async (commentId) => {
    await deleteDoc(doc(db, 'movies', String(movieId), 'comments', commentId));
  };

  return { comments, loading, addComment, deleteComment };
}
