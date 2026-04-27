import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import tr from './locales/tr.json';
import en from './locales/en.json';
import tmdb from './config/tmdb';

function detectLang() {
  const saved = localStorage.getItem('mfp_lang');
  if (saved === 'tr' || saved === 'en') return saved;
  const browser = (navigator.language || 'tr').toLowerCase();
  return browser.startsWith('tr') ? 'tr' : 'en';
}

const lang = detectLang();

// Sync TMDB API language
tmdb.defaults.params = {
  ...tmdb.defaults.params,
  language: lang === 'tr' ? 'tr-TR' : 'en-US',
};

i18n.use(initReactI18next).init({
  resources: {
    tr: { translation: tr },
    en: { translation: en },
  },
  lng: lang,
  fallbackLng: 'tr',
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('mfp_lang', lng);
  tmdb.defaults.params = {
    ...tmdb.defaults.params,
    language: lng === 'tr' ? 'tr-TR' : 'en-US',
  };
});

export default i18n;
