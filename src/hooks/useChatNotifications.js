import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

const LAST_SEEN_KEY = (movieId) => `chat_last_seen_${movieId}`;

export function useChatNotifications() {
  const { user } = useAuth();
  const [totalUnread, setTotalUnread] = useState(0);
  const [unreadRooms, setUnreadRooms] = useState([]); // [{ movieId, movieTitle, count }]

  useEffect(() => {
    if (!user) { setTotalUnread(0); setUnreadRooms([]); return; }

    const participationRef = collection(db, 'users', user.uid, 'chatParticipation');
    const unsub = onSnapshot(participationRef, async (snap) => {
      const rooms = snap.docs.map((d) => d.data());
      const results = await Promise.all(
        rooms.map(async (room) => {
          const lastSeen = Number(localStorage.getItem(LAST_SEEN_KEY(room.movieId)) || 0);
          const q = query(
            collection(db, 'movies', room.movieId, 'chat'),
            orderBy('createdAt', 'desc'),
            limit(50),
          );
          const msgs = await getDocs(q);
          const unread = msgs.docs.filter(
            (d) => d.data().createdAt?.toMillis?.() > lastSeen && d.data().uid !== user.uid,
          ).length;
          return { movieId: room.movieId, movieTitle: room.movieTitle, count: unread };
        }),
      );
      const filtered = results.filter((r) => r.count > 0);
      setUnreadRooms(filtered);
      setTotalUnread(filtered.reduce((s, r) => s + r.count, 0));
    });

    return () => unsub();
  }, [user]);

  return { totalUnread, unreadRooms };
}
