const express = require('express');
const cors = require('cors');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');
const { getAuth } = require('firebase-admin/auth');
const nodemailer = require('nodemailer');

// ── Firebase Admin ──
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : require('./serviceAccount.json');

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();
const messaging = getMessaging();
const auth = getAuth();

// ── Express ──
const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());

// ── Auth middleware ──
async function verifyToken(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = await auth.verifyIdToken(token);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ── FCM yardımcı ──
async function sendPush(uid, notification, data = {}) {
  const snap = await db.collection(`users/${uid}/fcmTokens`).get();
  if (snap.empty) return;

  const tokens = snap.docs.map((d) => d.data().token).filter(Boolean);
  const expired = [];

  await Promise.all(
    tokens.map((token) =>
      messaging
        .send({ token, notification, data, webpush: { fcmOptions: { link: data.url || '/' } } })
        .catch((err) => {
          if (err.code === 'messaging/registration-token-not-registered') expired.push(token);
        })
    )
  );

  await Promise.all(expired.map((t) => db.doc(`users/${uid}/fcmTokens/${t}`).delete()));
}

// ── Endpoints ──

// Yeni takipçi bildirimi
app.post('/notify/follow', verifyToken, async (req, res) => {
  const { targetUid } = req.body;
  const followerUid = req.user.uid;
  if (!targetUid || targetUid === followerUid) return res.json({ ok: true });

  const followerDoc = await db.doc(`users/${followerUid}`).get();
  const follower = followerDoc.data() || {};

  await sendPush(
    targetUid,
    { title: 'Yeni Takipçi 🎬', body: `${follower.displayName || 'Biri'} seni takip etmeye başladı.` },
    { url: `/profile/${followerUid}` }
  );
  res.json({ ok: true });
});

// Yeni DM bildirimi
app.post('/notify/dm', verifyToken, async (req, res) => {
  const { recipientUid, text } = req.body;
  const senderUid = req.user.uid;
  if (!recipientUid || recipientUid === senderUid) return res.json({ ok: true });

  const senderDoc = await db.doc(`users/${senderUid}`).get();
  const sender = senderDoc.data() || {};

  await sendPush(
    recipientUid,
    { title: `${sender.displayName || 'Biri'} mesaj gönderdi 💬`, body: (text || '').slice(0, 100) },
    { url: `/profile/${senderUid}` }
  );
  res.json({ ok: true });
});

// Film chat bildirimi
app.post('/notify/chat', verifyToken, async (req, res) => {
  const { movieId, text } = req.body;
  const senderUid = req.user.uid;
  if (!movieId) return res.json({ ok: true });

  const senderDoc = await db.doc(`users/${senderUid}`).get();
  const sender = senderDoc.data() || {};

  const participantsSnap = await db
    .collection('users')
    .get()
    .then(async (usersSnap) => {
      const results = [];
      for (const userDoc of usersSnap.docs) {
        const p = await db.doc(`users/${userDoc.id}/chatParticipation/${movieId}`).get();
        if (p.exists && userDoc.id !== senderUid) results.push(userDoc.id);
      }
      return results;
    });

  await Promise.all(
    participantsSnap.map((uid) =>
      sendPush(
        uid,
        { title: `${sender.displayName || 'Biri'} yazdı 🍿`, body: (text || '').slice(0, 100) },
        { url: `/movie/${movieId}` }
      )
    )
  );
  res.json({ ok: true });
});

// Health check
app.get('/', (_, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`FilmBul notify server running on :${PORT}`));
