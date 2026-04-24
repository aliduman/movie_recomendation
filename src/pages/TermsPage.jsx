import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-white mb-3">{title}</h2>
      <div className="text-gray-400 text-sm leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-24 pb-16 max-w-3xl mx-auto px-4"
    >
      <h1 className="text-3xl font-extrabold mb-2">Kullanım Koşulları</h1>
      <p className="text-gray-500 text-sm mb-10">Son güncelleme: Nisan 2026</p>

      <Section title="1. Kabul">
        <p>
          FilmBul'u kullanarak bu Kullanım Koşulları'nı kabul etmiş sayılırsınız. Kabul etmiyorsanız
          lütfen uygulamayı kullanmayınız.
        </p>
      </Section>

      <Section title="2. Hizmet Tanımı">
        <p>
          FilmBul; kullanıcılara ruh haline göre film önerisi sunan, favori film listesi oluşturma,
          yorum yapma, film sohbetlerine katılma ve diğer kullanıcılarla etkileşim kurma imkânı
          sağlayan ücretsiz bir web uygulamasıdır.
        </p>
      </Section>

      <Section title="3. Kullanıcı Hesabı">
        <ul className="list-disc list-inside space-y-1">
          <li>Hesap oluşturmak için Google hesabınızla giriş yapmanız gerekmektedir.</li>
          <li>Hesabınızın güvenliğinden siz sorumlusunuz.</li>
          <li>Başkası adına hesap oluşturulamaz.</li>
          <li>
            Hesabınızı dilediğiniz zaman{' '}
            <a href="mailto:alidumanpr@gmail.com" className="text-primary hover:underline">
              alidumanpr@gmail.com
            </a>{' '}
            adresine yazarak silebilirsiniz.
          </li>
        </ul>
      </Section>

      <Section title="4. Kullanıcı İçerikleri">
        <p>
          Yorum, mesaj ve profil bilgileri gibi içerikleri paylaşırken aşağıdaki kurallara
          uymanız zorunludur:
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>Hakaret, küfür ve nefret söylemi içeren içerik paylaşılamaz.</li>
          <li>Başkalarının kişisel bilgileri izinsiz paylaşılamaz.</li>
          <li>Telif hakkı ihlali oluşturan içerik eklenemez.</li>
          <li>Yanıltıcı, reklam amaçlı veya spam içerik gönderilemez.</li>
          <li>Yasa dışı faaliyetleri teşvik eden içerik yasaktır.</li>
        </ul>
        <p className="mt-2">
          Kurallara aykırı içerikler önceden bildirimde bulunulmaksızın kaldırılabilir ve ilgili
          hesap askıya alınabilir.
        </p>
      </Section>

      <Section title="5. Fikri Mülkiyet">
        <p>
          Film poster ve bilgileri TMDB (The Movie Database) API'si üzerinden sağlanmakta olup
          ilgili lisans koşullarına tabidir. FilmBul bu verilerin sahibi değildir.
        </p>
        <p>
          Uygulamanın arayüzü ve yazılım kodu FilmBul'a aittir; izinsiz kopyalanamaz veya
          dağıtılamaz.
        </p>
      </Section>

      <Section title="6. Sorumluluk Sınırı">
        <p>
          FilmBul, kullanıcılar tarafından oluşturulan içeriklerden sorumlu değildir. Uygulama
          "olduğu gibi" sunulmaktadır; kesintisiz veya hatasız çalışacağı garanti edilmez.
        </p>
      </Section>

      <Section title="7. Hizmet Değişiklikleri">
        <p>
          Hizmeti önceden bildirmeksizin değiştirme, askıya alma veya sonlandırma hakkı
          saklıdır. Önemli değişiklikler uygulama içinde duyurulacaktır.
        </p>
      </Section>

      <Section title="8. Uygulanacak Hukuk">
        <p>
          Bu koşullar Türkiye Cumhuriyeti hukukuna tabidir. Uyuşmazlıklarda İstanbul mahkemeleri
          yetkilidir.
        </p>
      </Section>

      <Section title="9. İletişim">
        <p>
          Sorularınız için:{' '}
          <a href="mailto:alidumanpr@gmail.com" className="text-primary hover:underline">
            alidumanpr@gmail.com
          </a>
        </p>
      </Section>

      <div className="border-t border-white/10 pt-6 mt-6">
        <Link to="/privacy" className="text-primary hover:underline text-sm">
          Gizlilik Politikası →
        </Link>
      </div>
    </motion.div>
  );
}
