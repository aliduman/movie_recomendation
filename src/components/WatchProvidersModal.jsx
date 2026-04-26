import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import tmdb, { providerLogo, poster } from '../config/tmdb';

const GoogleIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const REGIONS = [
  { code: 'TR', label: '🇹🇷 Türkiye' },
  { code: 'US', label: '🇺🇸 ABD' },
  { code: 'GB', label: '🇬🇧 İngiltere' },
  { code: 'DE', label: '🇩🇪 Almanya' },
];


function HDFilmButton({ title }) {
  const url = `https://www.google.com/search?q=${encodeURIComponent(`site:fullhdfilmizlesene.live ${title}`)}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-center gap-2.5 w-full px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors font-medium text-sm"
    >
      <span className="text-base leading-none">🎬</span>
      FullHD Film İzlesene'de Ara
    </a>
  );
}

// Her provider satırı: logo → API'den gelen film-spesifik link | Google butonu
function GoogleSearchButton({ title }) {
  const url = `https://www.google.com/search?q=${encodeURIComponent(`${title} nereden izlenir`)}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-center gap-2.5 w-full px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors font-medium text-sm"
    >
      <GoogleIcon />
      Google'da izleme seçeneklerini ara
    </a>
  );
}

function ProviderRow({ item, jwLink, movieTitle }) {
  const gUrl = `https://www.google.com/search?q=${encodeURIComponent(`${movieTitle} ${item.provider_name}`)}`;


  return (
    <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group">
      {/* Platform linki — API'den gelen film-spesifik JustWatch URL */}
      <a
        href={jwLink}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-3 flex-1 min-w-0"
      >
        {item.logo_path ? (
          <img
            src={providerLogo(item.logo_path)}
            alt={item.provider_name}
            className="w-12 h-12 rounded-xl object-cover shadow-md flex-shrink-0 transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-dark flex items-center justify-center text-xl flex-shrink-0">📺</div>
        )}
        <span className="font-medium text-sm truncate group-hover:text-white transition-colors">
          {item.provider_name}
        </span>
      </a>

      {/* Google ara */}
      <a
        href={gUrl}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-xs text-gray-400 hover:text-white"
      >
        <GoogleIcon />
        <span>Google'da Ara</span>
      </a>
    </div>
  );
}

function ProviderGroup({ title, icon, items, jwLink, movieTitle }) {
  if (!items?.length) return null;
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">
        {icon} {title}
      </p>
      <div className="divide-y divide-white/5">
        {items.map((item) => (
          <ProviderRow key={item.provider_id} item={item} jwLink={jwLink} movieTitle={movieTitle} />
        ))}
      </div>
    </div>
  );
}

export default function WatchProvidersModal({ movie, onClose }) {
  const [providers, setProviders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState('TR');
  const [enTitle, setEnTitle] = useState('');

  useEffect(() => {
    if (!movie?.id) return;
    setLoading(true);
    setEnTitle('');
    tmdb
      .get(`/movie/${movie.id}/watch/providers`)
      .then(({ data }) => setProviders(data?.results || {}))
      .finally(() => setLoading(false));
    tmdb
      .get(`/movie/${movie.id}`, { params: { language: 'en-US' } })
      .then(({ data }) => setEnTitle(data.title || ''));
  }, [movie?.id]);

  useEffect(() => {
    if (!providers) return;
    if (!providers['TR'] && providers['US']) setRegion('US');
  }, [providers]);

  const data = providers?.[region] || null;
  // API'den gelen film-spesifik link (JustWatch)
  const jwLink = data?.link;
  const availableRegions = REGIONS.filter((r) => providers?.[r.code]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        <motion.div
          className="relative w-full max-w-lg bg-[#141414] rounded-3xl shadow-2xl overflow-hidden"
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative">
            {movie?.backdrop_path && (
              <div className="h-28 overflow-hidden">
                <img
                  src={`https://image.tmdb.org/t/p/w780${movie.backdrop_path}`}
                  alt=""
                  className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#141414]" />
              </div>
            )}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors backdrop-blur-sm"
            >
              <FiX size={18} />
            </button>
            <div
              className="flex items-end gap-4 px-5 pb-4"
              style={{ marginTop: movie?.backdrop_path ? '-40px' : '16px' }}
            >
              {movie?.poster_path && (
                <img
                  src={poster(movie.poster_path)}
                  alt={movie.title}
                  className="w-16 h-24 rounded-xl object-cover shadow-xl flex-shrink-0 border border-white/10"
                />
              )}
              <div className="min-w-0">
                <p className="text-xs text-gray-400 mb-1">Nerede İzlenir?</p>
                <h2 className="text-lg font-bold leading-tight line-clamp-2">{movie?.title}</h2>
              </div>
            </div>
          </div>

          {/* Region tabs */}
          <div className="px-5 pb-3">
            {!loading && availableRegions.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {availableRegions.map((r) => (
                  <button
                    key={r.code}
                    onClick={() => setRegion(r.code)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      region === r.code ? 'bg-primary text-white' : 'glass text-gray-400 hover:text-white'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="px-5 pb-6 max-h-[60vh] overflow-y-auto space-y-4">
            {loading && (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            )}

            {!loading && !data && (
              <div className="text-center py-10">
                <p className="text-4xl mb-3">😔</p>
                <p className="text-gray-400 text-sm mb-5">
                  {availableRegions.length === 0
                    ? 'Bu film için platform bilgisi bulunamadı.'
                    : 'Seçilen bölgede platform bilgisi yok.'}
                </p>
                <GoogleSearchButton title={movie.title} />
                <div className="mt-2">
                  <HDFilmButton title={enTitle || movie.title} />
                </div>
              </div>
            )}

            {!loading && data && (
              <>
                <ProviderGroup title="Abonelikle İzle" icon="▶️" items={data.flatrate} jwLink={jwLink} movieTitle={movie?.title} />
                <ProviderGroup title="Kirala" icon="🎟️" items={data.rent} jwLink={jwLink} movieTitle={movie?.title} />
                <ProviderGroup title="Satın Al" icon="🛒" items={data.buy} jwLink={jwLink} movieTitle={movie?.title} />
                <ProviderGroup title="Ücretsiz" icon="🆓" items={data.free} jwLink={jwLink} movieTitle={movie?.title} />
                <ProviderGroup title="Reklam Destekli" icon="📢" items={data.ads} jwLink={jwLink} movieTitle={movie?.title} />

                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(`${movie?.title} filmini izle`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2.5 w-full px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors font-medium text-sm"
                >
                  <GoogleIcon />
                  Google'da tüm izleme seçeneklerini ara
                </a>
                <HDFilmButton title={enTitle || movie?.title} />
              </>
            )}
          </div>
        </motion.div>
    </motion.div>
  );
}
