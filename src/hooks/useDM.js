import { useState, useEffect } from 'react';
import {
  collection, addDoc, onSnapshot, orderBy, query,
  limit, serverTimestamp, doc, setDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { notifyDM } from '../utils/notify';
import { sendNotification } from '../utils/writeNotification';

export function dmId(uid1, uid2) {
  return [uid1, uid2].sort().join('_');
}

export function useDM(otherUid) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const rid = user && otherUid ? dmId(user.uid, otherUid) : null;

  useEffect(() => {
    if (!rid) { setLoading(false); return; }
    const q = query(
      collection(db, 'dms', rid, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(100),
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [rid]);

  const sendMessage = async (text) => {
    if (!user || !rid || !text.trim()) return;
    await addDoc(collection(db, 'dms', rid, 'messages'), {
      uid: user.uid,
      displayName: user.displayName || user.email?.split('@')[0] || 'Kullanıcı',
      photoURL: user.photoURL || '',
      text: text.trim(),
      createdAt: serverTimestamp(),
    });
    // Her iki kullanıcının DM listesine kaydet
    const meta = { lastMessage: text.trim(), lastAt: serverTimestamp() };
    await setDoc(doc(db, 'users', user.uid, 'dms', rid), { ...meta, otherUid }, { merge: true });
    await setDoc(doc(db, 'users', otherUid, 'dms', rid), { ...meta, otherUid: user.uid }, { merge: true });
    notifyDM(otherUid, text.trim());
    sendNotification(otherUid, `dm_${user.uid}`, {
      type: 'dm',
      fromUid: user.uid,
      fromName: user.displayName || user.email?.split('@')[0] || 'Kullanıcı',
      fromPhoto: user.photoURL || '',
      preview: text.trim().substring(0, 80),
    });
  };

  return { messages, loading, sendMessage, rid };
}
