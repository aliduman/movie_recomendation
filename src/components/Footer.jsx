import supportLogo from '../assets/support-logo.svg';

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-white/10 bg-darker/60">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col items-center gap-3">
        <p className="text-xs text-gray-500">Destekleyen Kurum</p>
        <img
          src={supportLogo}
          alt="Destek logosu"
          className="w-[100px] h-[100px] object-contain"
        />
      </div>
    </footer>
  );
}

