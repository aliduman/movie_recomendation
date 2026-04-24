import { useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { db, messagingPromise } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export function useFCM() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !VAPID_KEY) return;

    messagingPromise.then(async (messaging) => {
      if (!messaging) return;

      // Service worker kaydet
      const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

      // İzin iste
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;

      // Token al
      const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: reg })
        .catch(() => null);

      if (token) {
        await setDoc(
          doc(db, 'users', user.uid, 'fcmTokens', token),
          { token, createdAt: new Date().toISOString(), platform: 'web' },
          { merge: true },
        );
      }

      // Uygulama açıkken gelen bildirimler
      onMessage(messaging, (payload) => {
        const { title, body } = payload.notification || {};
        const url = payload.data?.url;
        toast(
          (t) => (
            <div
              className="cursor-pointer"
              onClick={() => { if (url) window.location.href = url; toast.dismiss(t.id); }}
            >
              <p className="font-semibold text-sm">{title}</p>
              {body && <p className="text-xs text-gray-400 mt-0.5">{body}</p>}
            </div>
          ),
          { duration: 6000, icon: '🎬' },
        );
      });
    }).catch(() => {});
  }, [user]);
}
