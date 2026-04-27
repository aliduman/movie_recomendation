import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import supportLogo from '../assets/support-logo.svg';
import LanguageSwitcher from './LanguageSwitcher';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="mt-10 border-t border-white/10 bg-darker/60">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col items-center gap-5">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎬</span>
          <span className="font-bold text-white">MyFlickPick</span>
        </div>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-gray-500">
          <Link to="/privacy" className="hover:text-gray-300 transition-colors">{t('footer.privacy')}</Link>
          <Link to="/terms" className="hover:text-gray-300 transition-colors">{t('footer.terms')}</Link>
          <a href="mailto:alidumanpr@gmail.com" className="hover:text-gray-300 transition-colors">{t('footer.contact')}</a>
        </div>

        <p className="text-[11px] text-gray-700 text-center">
          {t('footer.cookieNotice')}{' '}
          <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer" className="hover:text-gray-500 transition-colors">
            TMDB
          </a>{' '}
          {t('footer.dataProvider')}
        </p>

        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-gray-500">{t('footer.supportedBy')}</p>
          <img src={supportLogo} alt="Destek logosu" className="w-[80px] h-[80px] object-contain" />
        </div>

        {/* Language switcher — mobile only */}
        <LanguageSwitcher className="sm:hidden" />

        <p className="text-[11px] text-gray-700">© {new Date().getFullYear()} MyFlickPick. {t('footer.rights')}</p>
      </div>
    </footer>
  );
}
