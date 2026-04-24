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

export default function PrivacyPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-24 pb-16 max-w-3xl mx-auto px-4"
    >
      <h1 className="text-3xl font-extrabold mb-2">Gizlilik Politikası</h1>
      <p className="text-gray-500 text-sm mb-2">Son güncelleme: Nisan 2026</p>
      <p className="text-gray-500 text-sm mb-10">
        Bu belge aynı zamanda <strong className="text-gray-300">KVKK Aydınlatma Metni</strong> niteliği taşımaktadır.
      </p>

      <Section title="1. Veri Sorumlusu">
        <p>
          FilmBul uygulaması kapsamında kişisel verileriniz, 6698 sayılı Kişisel Verilerin Korunması
          Kanunu ("KVKK") uyarınca veri sorumlusu sıfatıyla işlenmektedir. Sorularınız için{' '}
          <a href="mailto:alidumanpr@gmail.com" className="text-primary hover:underline">
            alidumanpr@gmail.com
          </a>{' '}
          adresi üzerinden iletişime geçebilirsiniz.
        </p>
      </Section>

      <Section title="2. Toplanan Kişisel Veriler">
        <p>Google ile giriş yaptığınızda aşağıdaki veriler işlenir:</p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>Ad ve soyad</li>
          <li>E-posta adresi</li>
          <li>Profil fotoğrafı</li>
          <li>Google hesap kimliği (UID)</li>
        </ul>
        <p className="mt-2">Uygulamayı kullandıkça oluşturulan veriler:</p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>Favori filmler listesi</li>
          <li>Film yorumları ve chat mesajları</li>
          <li>Direkt mesajlar (DM)</li>
          <li>Takip/takipçi ilişkileri</li>
          <li>Push bildirim için cihaz token'ı</li>
          <li>Profil biyografisi (isteğe bağlı)</li>
        </ul>
      </Section>

      <Section title="3. Verilerin İşlenme Amacı">
        <ul className="list-disc list-inside space-y-1">
          <li>Kimlik doğrulama ve hesap yönetimi</li>
          <li>Kişiselleştirilmiş film önerileri sunulması</li>
          <li>Kullanıcılar arası iletişim (yorum, chat, DM)</li>
          <li>Sosyal özellikler (takip, profil görüntüleme)</li>
          <li>Push bildirimi gönderilmesi</li>
        </ul>
      </Section>

      <Section title="4. Hukuki Dayanak">
        <p>
          Verileriniz; açık rızanız, sözleşmenin ifası ve meşru menfaat hukuki sebeplerine
          dayanılarak KVKK'nın 5. maddesi kapsamında işlenmektedir.
        </p>
      </Section>

      <Section title="5. Verilerin Aktarımı">
        <p>Kişisel verileriniz aşağıdaki üçüncü taraflarla paylaşılabilir:</p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>
            <strong className="text-gray-300">Google Firebase</strong> — kimlik doğrulama ve veritabanı
            hizmetleri (ABD merkezli, SCCs kapsamında aktarım)
          </li>
          <li>
            <strong className="text-gray-300">TMDB</strong> — film bilgileri API'si (yalnızca film
            verileri, kişisel veri aktarımı yok)
          </li>
        </ul>
      </Section>

      <Section title="6. Saklama Süresi">
        <p>
          Verileriniz hesabınız aktif olduğu sürece saklanır. Hesabınızı silmek veya verilerinizin
          kaldırılmasını talep etmek için{' '}
          <a href="mailto:alidumanpr@gmail.com" className="text-primary hover:underline">
            alidumanpr@gmail.com
          </a>{' '}
          ile iletişime geçebilirsiniz.
        </p>
      </Section>

      <Section title="7. Çerezler (Cookie) ve Yerel Depolama">
        <p>
          FilmBul yalnızca teknik olarak zorunlu çerezler ve tarayıcı yerel depolama alanı
          (localStorage) kullanır:
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>
            <strong className="text-gray-300">Firebase Auth oturumu</strong> — giriş durumunuzu
            korumak için (zorunlu)
          </li>
          <li>
            <strong className="text-gray-300">localStorage</strong> — misafir favoriler ve okunmamış
            mesaj sayacı (zorunlu)
          </li>
        </ul>
        <p className="mt-2">
          Reklam veya analitik amaçlı çerez kullanılmamaktadır. Bu nedenle onay banner'ı
          gösterilmemektedir.
        </p>
      </Section>

      <Section title="8. KVKK Kapsamındaki Haklarınız">
        <p>KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
          <li>İşlenmişse buna ilişkin bilgi talep etme</li>
          <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
          <li>Yurt içinde/dışında aktarıldığı üçüncü kişileri bilme</li>
          <li>Eksik/yanlış işlenmişse düzeltilmesini talep etme</li>
          <li>Silinmesini veya yok edilmesini talep etme</li>
          <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla aleyhinize sonuç doğurmasına itiraz etme</li>
          <li>Kanuna aykırı işlenmesi nedeniyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
        </ul>
        <p className="mt-2">
          Bu hakları kullanmak için{' '}
          <a href="mailto:alidumanpr@gmail.com" className="text-primary hover:underline">
            alidumanpr@gmail.com
          </a>{' '}
          adresine yazabilirsiniz.
        </p>
      </Section>

      <div className="border-t border-white/10 pt-6 mt-6">
        <Link to="/terms" className="text-primary hover:underline text-sm">
          Kullanım Koşulları →
        </Link>
      </div>
    </motion.div>
  );
}
