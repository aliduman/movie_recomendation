import { useState, useEffect } from 'react';
import { doc, setDoc, deleteDoc, onSnapshot, collection } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { notifyFollow } from '../utils/notify';
import { sendNotification } from '../utils/writeNotification';

export function useFollow(targetUid) {
  const { user } = useAuth();
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Takip durumu
  useEffect(() => {
    if (!user || !targetUid) { setLoading(false); return; }
    const unsub = onSnapshot(
      doc(db, 'users', targetUid, 'followers', user.uid),
      (snap) => { setFollowing(snap.exists()); setLoading(false); },
    );
    return () => unsub();
  }, [user, targetUid]);

  // Takipçi sayısı
  useEffect(() => {
    if (!targetUid) return;
    const unsub = onSnapshot(
      collection(db, 'users', targetUid, 'followers'),
      (snap) => setFollowerCount(snap.size),
    );
    return () => unsub();
  }, [targetUid]);

  // Takip edilen sayısı
  useEffect(() => {
    if (!targetUid) return;
    const unsub = onSnapshot(
      collection(db, 'users', targetUid, 'following'),
      (snap) => setFollowingCount(snap.size),
    );
    return () => unsub();
  }, [targetUid]);

  const toggle = async () => {
    if (!user || !targetUid) return;
    const followerRef = doc(db, 'users', targetUid, 'followers', user.uid);
    const followingRef = doc(db, 'users', user.uid, 'following', targetUid);
    if (following) {
      await deleteDoc(followerRef);
      await deleteDoc(followingRef);
    } else {
      const data = {
        uid: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || 'Kullanıcı',
        photoURL: user.photoURL || '',
      };
      await setDoc(followerRef, data);
      await setDoc(followingRef, { uid: targetUid });
      notifyFollow(targetUid);
      sendNotification(targetUid, `follow_${user.uid}`, {
        type: 'follow',
        fromUid: user.uid,
        fromName: user.displayName || user.email?.split('@')[0] || 'Kullanıcı',
        fromPhoto: user.photoURL || '',
      });
    }
  };

  return { following, followerCount, followingCount, toggle, loading };
}
