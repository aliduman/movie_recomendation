import { useTranslation } from 'react-i18next';
import { FiGlobe } from 'react-icons/fi';

export default function LanguageSwitcher({ className = '' }) {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const toggle = () => {
    i18n.changeLanguage(lang === 'tr' ? 'en' : 'tr');
  };

  const isEn = lang === 'en';

  return (
    <button
      onClick={toggle}
      title={isEn ? "Türkçe'ye geç" : 'Switch to English'}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-white transition-colors ${className}`}
      style={{ background: 'rgba(255,255,255,0.07)' }}
    >
      <FiGlobe size={13} />
      {isEn ? 'TR' : 'EN'}
    </button>
  );
}
