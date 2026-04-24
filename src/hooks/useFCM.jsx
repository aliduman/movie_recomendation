import { useEffect, useState, useCallback } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { db, messagingPromise } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;
const DISMISSED_KEY = 'fcm_banner_dismissed';

export function useFCM() {
  const { user } = useAuth();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!user || !VAPID_KEY) return;
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      registerAndSave();
      return;
    }
    if (Notification.permission === 'denied') return;
    if (localStorage.getItem(DISMISSED_KEY)) return;
    // default → banner göster
    setShowBanner(true);
  }, [user]);

  const registerAndSave = useCallback(async () => {
    const messaging = await messagingPromise;
    if (!messaging) return;
    try {
      const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: reg });
      if (token && user) {
        await setDoc(
          doc(db, 'users', user.uid, 'fcmTokens', token),
          { token, createdAt: new Date().toISOString(), platform: 'web' },
          { merge: true },
        );
      }
      onMessage(messaging, (payload) => {
        const { title, body } = payload.notification || {};
        const url = payload.data?.url;
        toast(
          (t) => (
            <div className="cursor-pointer" onClick={() => { if (url) window.location.href = url; toast.dismiss(t.id); }}>
              <p className="font-semibold text-sm">{title}</p>
              {body && <p className="text-xs text-gray-400 mt-0.5">{body}</p>}
            </div>
          ),
          { duration: 6000, icon: '🎬' },
        );
      });
    } catch (e) {
      console.warn('FCM setup failed:', e);
    }
  }, [user]);

  const requestPermission = useCallback(async () => {
    setShowBanner(false);
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      registerAndSave();
      toast.success('Bildirimler açıldı 🔔');
    }
  }, [registerAndSave]);

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setShowBanner(false);
  }, []);

  return { showBanner, requestPermission, dismiss };
}
