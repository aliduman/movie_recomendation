import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  setDoc,
  getDocs,
  query,
  limit,
  onSnapshot,
  orderBy,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { sendNotification } from '../utils/writeNotification';

async function notifyFans(movieId, movieTitle, user, text) {
  try {
    const snap = await getDocs(
      query(collection(db, 'movies', String(movieId), 'likedBy'), limit(20))
    );
    await Promise.all(
      snap.docs
        .filter((d) => d.id !== user.uid)
        .map((d) =>
          sendNotification(d.id, `comment_${movieId}_${user.uid}`, {
            type: 'comment',
            fromUid: user.uid,
            fromName: user.displayName || user.email?.split('@')[0] || 'Kullanıcı',
            fromPhoto: user.photoURL || '',
            movieId: String(movieId),
            movieTitle: movieTitle || '',
            preview: text.substring(0, 80),
          })
        )
    );
  } catch {}
}

export function useComments(movieId, movieTitle = '') {
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
    const payload = {
      uid: user.uid,
      displayName: user.displayName || user.email?.split('@')[0] || 'Kullanıcı',
      photoURL: user.photoURL || '',
      text: text.trim(),
      createdAt: serverTimestamp(),
      movieId: String(movieId),
    };
    const ref = await addDoc(collection(db, 'movies', String(movieId), 'comments'), payload);
    await setDoc(
      doc(db, 'users', user.uid, 'comments', ref.id),
      { movieId: String(movieId), text: text.trim(), createdAt: serverTimestamp() },
    );
    notifyFans(movieId, movieTitle, user, text.trim());
  };

  const deleteComment = async (commentId) => {
    await deleteDoc(doc(db, 'movies', String(movieId), 'comments', commentId));
    await deleteDoc(doc(db, 'users', user.uid, 'comments', commentId));
  };

  const updateComment = async (commentId, text) => {
    await updateDoc(doc(db, 'movies', String(movieId), 'comments', commentId), {
      text: text.trim(),
      editedAt: serverTimestamp(),
    });
    await updateDoc(doc(db, 'users', user.uid, 'comments', commentId), {
      text: text.trim(),
      editedAt: serverTimestamp(),
    });
  };

  return { comments, loading, addComment, deleteComment, updateComment };
}
