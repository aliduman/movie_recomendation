# 🎬 FilmBul — Film Tavsiye Uygulaması

TMDB API'den beslenen, interaktif animasyonlu, Google Auth destekli film keşif ve tavsiye uygulaması.

## Özellikler

- 🔥 Trend filmler (günlük/haftalık)
- 🎯 Türe (genre) göre keşif — Aksiyon, Komedi, Dram, Korku vb.
- 🔍 Film arama
- 📄 Detaylı film sayfası (oyuncular, fragman, benzer filmler)
- ❤️ Favorilere ekleme (kullanıcı bazlı)
- 🔐 Google ile giriş (Firebase Auth)
- ✨ Framer Motion ile akıcı animasyonlar

## Kurulum

```bash
# 1. Bağımlılıkları kur
npm install

# 2. Ortam değişkenlerini ayarla
cp .env.example .env
# .env dosyasını düzenleyerek API anahtarlarını gir

# 3. Geliştirme sunucusunu başlat
npm run dev
```

## API Anahtarları

### TMDB API Key
1. [themoviedb.org](https://www.themoviedb.org/signup) adresinden hesap oluştur
2. Settings → API → Create → Developer bölümünden API Key (v3 auth) al
3. `.env` dosyasına `VITE_TMDB_API_KEY=...` olarak ekle

### Firebase (Google Auth)
1. [Firebase Console](https://console.firebase.google.com) → Yeni proje oluştur
2. Authentication → Sign-in method → Google'ı etkinleştir
3. Project Settings → Your apps → Web app ekle
4. Config değerlerini `.env` dosyasına kopyala

## Teknoloji

| Katman | Teknoloji |
|--------|-----------|
| UI | React 18, Tailwind CSS |
| Animasyon | Framer Motion |
| Routing | React Router v6 |
| Auth | Firebase Authentication |
| Film Verisi | TMDB API |
| Build | Vite |

## Troubleshooting

- `auth/configuration-not-found` hatasi alirsaniz:
  1. Firebase Console > Authentication > Sign-in method > `Google` saglayicisini **Enable** edin.
  2. Firebase Console > Authentication > Settings > Authorized domains listesine `localhost` ekleyin.
  3. `.env` icindeki `VITE_FIREBASE_*` degerlerinin ayni Firebase projesine ait oldugunu dogrulayin.

