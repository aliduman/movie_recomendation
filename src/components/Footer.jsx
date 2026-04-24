import { Link } from 'react-router-dom';
import supportLogo from '../assets/support-logo.svg';

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-white/10 bg-darker/60">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col items-center gap-5">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎬</span>
          <span className="font-bold text-white">FilmBul</span>
        </div>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-gray-500">
          <Link to="/privacy" className="hover:text-gray-300 transition-colors">Gizlilik Politikası</Link>
          <Link to="/terms" className="hover:text-gray-300 transition-colors">Kullanım Koşulları</Link>
          <a href="mailto:alidumanpr@gmail.com" className="hover:text-gray-300 transition-colors">İletişim</a>
        </div>

        <p className="text-[11px] text-gray-700 text-center">
          Bu site yalnızca zorunlu teknik çerezler kullanır. Film verileri{' '}
          <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer" className="hover:text-gray-500 transition-colors">
            TMDB
          </a>{' '}
          tarafından sağlanmaktadır.
        </p>

        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-gray-500">Destekleyen Kurum</p>
          <img src={supportLogo} alt="Destek logosu" className="w-[80px] h-[80px] object-contain" />
        </div>

        <p className="text-[11px] text-gray-700">© {new Date().getFullYear()} FilmBul. Tüm hakları saklıdır.</p>
      </div>
    </footer>
  );
}
