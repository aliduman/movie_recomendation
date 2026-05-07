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
import { mediaCollection } from '../utils/media';

async function notifyFans(coll, movieId, movieTitle, mediaType, user, text) {
  try {
    const snap = await getDocs(
      query(collection(db, coll, String(movieId), 'likedBy'), limit(20))
    );
    await Promise.all(
      snap.docs
        .filter((d) => d.id !== user.uid)
        .map((d) =>
          sendNotification(d.id, `comment_${mediaType}_${movieId}_${user.uid}`, {
            type: 'comment',
            fromUid: user.uid,
            fromName: user.displayName || user.email?.split('@')[0] || 'Kullanıcı',
            fromPhoto: user.photoURL || '',
            movieId: String(movieId),
            mediaType,
            movieTitle: movieTitle || '',
            preview: text.substring(0, 80),
          })
        )
    );
  } catch {}
}

export function useComments(movieId, movieTitle = '', mediaType = 'movie') {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const coll = mediaCollection(mediaType);

  useEffect(() => {
    if (!movieId) return;
    const q = query(
      collection(db, coll, String(movieId), 'comments'),
      orderBy('createdAt', 'desc'),
    );
    const unsub = onSnapshot(q, (snap) => {
      setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [movieId, coll]);

  const addComment = async (text) => {
    if (!user || !text.trim()) return;
    const payload = {
      uid: user.uid,
      displayName: user.displayName || user.email?.split('@')[0] || 'Kullanıcı',
      photoURL: user.photoURL || '',
      text: text.trim(),
      createdAt: serverTimestamp(),
      movieId: String(movieId),
      mediaType,
    };
    const ref = await addDoc(collection(db, coll, String(movieId), 'comments'), payload);
    await setDoc(
      doc(db, 'users', user.uid, 'comments', ref.id),
      { movieId: String(movieId), mediaType, text: text.trim(), createdAt: serverTimestamp() },
    );
    notifyFans(coll, movieId, movieTitle, mediaType, user, text.trim());
  };

  const deleteComment = async (commentId) => {
    await deleteDoc(doc(db, coll, String(movieId), 'comments', commentId));
    await deleteDoc(doc(db, 'users', user.uid, 'comments', commentId));
  };

  const updateComment = async (commentId, text) => {
    await updateDoc(doc(db, coll, String(movieId), 'comments', commentId), {
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
