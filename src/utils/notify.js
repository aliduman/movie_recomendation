import { auth } from '../config/firebase';
import { envValue } from '../config/env';

const BASE = envValue('VITE_NOTIFY_API_URL');

async function post(path, body) {
  if (!BASE) return;
  try {
    const token = await auth.currentUser?.getIdToken();
    if (!token) return;
    await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
  } catch {}
}

export const notifyFollow = (targetUid) => post('/notify/follow', { targetUid });
export const notifyDM = (recipientUid, text) => post('/notify/dm', { recipientUid, text });
export const notifyChat = (movieId, text, mediaType = 'movie') => post('/notify/chat', { movieId, text, mediaType });
