const { onSchedule } = require('firebase-functions/v2/scheduler');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const nodemailer = require('nodemailer');

initializeApp();
const db = getFirestore();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS, // Gmail App Password
  },
});

// Her gün saat 09:00 TR (UTC+3 = 06:00 UTC)
exports.dailyChatDigest = onSchedule('0 6 * * *', async () => {
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

  // Tüm kullanıcıların chatParticipation kayıtlarını al
  const usersSnap = await db.collection('users').get();

  for (const userDoc of usersSnap.docs) {
    const uid = userDoc.id;

    // Bildirim tercihi kontrolü
    const settingsDoc = await db.doc(`users/${uid}/settings/notifications`).get();
    if (settingsDoc.exists && settingsDoc.data()?.chatEmail === false) continue;

    const participationSnap = await db.collection(`users/${uid}/chatParticipation`).get();
    if (participationSnap.empty) continue;

    const unreadRooms = [];

    for (const roomDoc of participationSnap.docs) {
      const { movieId, movieTitle, email } = roomDoc.data();
      if (!email) continue;

      const messagesSnap = await db
        .collection(`movies/${movieId}/chat`)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();

      const newMessages = messagesSnap.docs.filter(
        (d) => d.data().createdAt?.toMillis?.() > oneDayAgo && d.data().uid !== uid,
      );

      if (newMessages.length > 0) {
        unreadRooms.push({
          movieTitle,
          count: newMessages.length,
          preview: newMessages
            .slice(0, 3)
            .reverse()
            .map((d) => `• ${d.data().displayName}: ${d.data().text.slice(0, 80)}`)
            .join('\n'),
          email,
        });
      }
    }

    if (!unreadRooms.length) continue;

    const email = unreadRooms[0].email;
    const totalCount = unreadRooms.reduce((s, r) => s + r.count, 0);

    const html = `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#e5e7eb;background:#111827;padding:32px;border-radius:16px;">
        <h1 style="color:#a855f7;margin:0 0 8px">🎬 FilmBul - Günlük Özet</h1>
        <p style="color:#9ca3af;margin:0 0 24px">Son 24 saatte katıldığın sohbetlerde <strong style="color:#fff">${totalCount} yeni mesaj</strong> var.</p>
        ${unreadRooms.map((r) => `
          <div style="background:#1f2937;border-radius:12px;padding:16px;margin-bottom:16px;">
            <h3 style="margin:0 0 8px;color:#fff">💬 ${r.movieTitle} <span style="color:#6b7280;font-size:13px;font-weight:400">(${r.count} yeni mesaj)</span></h3>
            <pre style="font-family:sans-serif;font-size:13px;color:#d1d5db;white-space:pre-wrap;margin:0">${r.preview}</pre>
          </div>
        `).join('')}
        <p style="color:#4b5563;font-size:12px;margin-top:24px">Bu e-postayı almak istemiyorsanız FilmBul'da bildirim ayarlarınızı kapatabilirsiniz.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"FilmBul" <${process.env.MAIL_USER}>`,
      to: email,
      subject: `🎬 FilmBul: ${totalCount} okunmamış sohbet mesajı`,
      html,
    });
  }
});
