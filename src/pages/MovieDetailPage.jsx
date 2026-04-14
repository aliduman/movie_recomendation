import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiHeart,
  FiStar,
  FiClock,
  FiCalendar,
  FiArrowLeft,
} from 'react-icons/fi';
import { useMovieDetail } from '../hooks/useMovies';
import { useFavorites } from '../hooks/useFavorites';
import { backdrop, poster, providerLogo, profile } from '../config/tmdb';
import MovieCard from '../components/MovieCard';

export default function MovieDetailPage() {
  const { id } = useParams();
  const { movie, credits, providers, similar, loading } = useMovieDetail(id);
  const { toggleFavorite, isFavorite } = useFavorites();
  const [selectedRegion, setSelectedRegion] = useState('TR');

  const hasTR = Boolean(providers?.TR);
  const hasUS = Boolean(providers?.US);

  useEffect(() => {
    if (selectedRegion === 'TR' && !hasTR && hasUS) {
      setSelectedRegion('US');
    }
    if (selectedRegion === 'US' && !hasUS && hasTR) {
      setSelectedRegion('TR');
    }
  }, [hasTR, hasUS, selectedRegion]);

  if (loading || !movie) {
    return (
      <div className="pt-24 flex justify-center">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const fav = isFavorite(movie.id);
  const director = credits?.crew?.find((c) => c.job === 'Director');
  const cast = credits?.cast?.slice(0, 6) || [];
  const trailer = movie.videos?.results?.find(
    (v) => v.type === 'Trailer' && v.site === 'YouTube',
  );

  const providerData = providers?.[selectedRegion] || null;
  const streamList = providerData?.flatrate || [];
  const rentList = providerData?.rent || [];
  const buyList = providerData?.buy || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div className="relative h-[60vh] overflow-hidden">
        <img
          src={backdrop(movie.backdrop_path)}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-darker via-darker/70 to-transparent" />

        <Link
          to="/"
          className="absolute top-20 left-4 z-10 flex items-center gap-2 glass px-4 py-2 rounded-xl text-sm hover:bg-white/10 transition-colors"
        >
          <FiArrowLeft size={16} /> Geri
        </Link>
      </div>

      {/* Detail */}
      <div className="max-w-7xl mx-auto px-4 -mt-40 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-shrink-0"
          >
            <img
              src={poster(movie.poster_path)}
              alt={movie.title}
              className="w-64 rounded-2xl shadow-2xl shadow-primary/10"
            />
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex-1"
          >
            <h1 className="text-3xl sm:text-5xl font-extrabold">
              {movie.title}
            </h1>
            {movie.tagline && (
              <p className="text-primary/80 italic mt-2">"{movie.tagline}"</p>
            )}

            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-300">
              <span className="flex items-center gap-1 text-secondary">
                <FiStar className="fill-secondary" />{' '}
                {movie.vote_average?.toFixed(1)}
              </span>
              <span className="flex items-center gap-1">
                <FiClock size={14} /> {movie.runtime} dk
              </span>
              <span className="flex items-center gap-1">
                <FiCalendar size={14} /> {movie.release_date?.slice(0, 4)}
              </span>
              {director && <span>🎬 {director.name}</span>}
            </div>

            {/* Türler */}
            <div className="flex flex-wrap gap-2 mt-4">
              {movie.genres?.map((g) => (
                <span key={g.id} className="px-3 py-1 rounded-full glass text-xs">
                  {g.name}
                </span>
              ))}
            </div>

            {/* Özet */}
            <p className="mt-6 text-gray-300 leading-relaxed">
              {movie.overview}
            </p>

            {/* Izleme platformlari */}
            <div className="mt-6">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className="text-lg font-bold">📺 Nereden Izlerim?</h3>

                {(hasTR || hasUS) && (
                  <div className="glass rounded-full p-1 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setSelectedRegion('TR')}
                      disabled={!hasTR}
                      className={`px-3 py-1 rounded-full text-xs transition-colors ${
                        selectedRegion === 'TR'
                          ? 'bg-primary text-white'
                          : 'text-gray-400 hover:text-white'
                      } ${!hasTR ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      TR
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRegion('US')}
                      disabled={!hasUS}
                      className={`px-3 py-1 rounded-full text-xs transition-colors ${
                        selectedRegion === 'US'
                          ? 'bg-primary text-white'
                          : 'text-gray-400 hover:text-white'
                      } ${!hasUS ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      US
                    </button>
                  </div>
                )}
              </div>

              {!providerData && (
                <p className="text-sm text-gray-500">Bu film icin platform bilgisi bulunamadi.</p>
              )}

              {providerData && (
                <div className="space-y-3">
                  {streamList.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-2">Abonelik</p>
                      <div className="flex flex-wrap gap-2">
                        {streamList.slice(0, 8).map((item) => (
                          <span key={`stream-${item.provider_id}`} className="glass px-2 py-1 rounded-lg text-xs flex items-center gap-1.5">
                            {item.logo_path && (
                              <img src={providerLogo(item.logo_path)} alt={item.provider_name} className="w-4 h-4 rounded" />
                            )}
                            {item.provider_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {rentList.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-2">Kiralama</p>
                      <div className="flex flex-wrap gap-2">
                        {rentList.slice(0, 6).map((item) => (
                          <span key={`rent-${item.provider_id}`} className="glass px-2 py-1 rounded-lg text-xs flex items-center gap-1.5">
                            {item.logo_path && (
                              <img src={providerLogo(item.logo_path)} alt={item.provider_name} className="w-4 h-4 rounded" />
                            )}
                            {item.provider_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {buyList.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-2">Satin Alma</p>
                      <div className="flex flex-wrap gap-2">
                        {buyList.slice(0, 6).map((item) => (
                          <span key={`buy-${item.provider_id}`} className="glass px-2 py-1 rounded-lg text-xs flex items-center gap-1.5">
                            {item.logo_path && (
                              <img src={providerLogo(item.logo_path)} alt={item.provider_name} className="w-4 h-4 rounded" />
                            )}
                            {item.provider_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {providerData?.link && (
                    <a
                      href={providerData.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex text-xs text-primary hover:text-secondary transition-colors"
                    >
                      Tum platformlari gor
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Butonlar */}
            <div className="flex items-center gap-3 mt-6">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleFavorite(movie)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors ${
                  fav
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'glass hover:bg-white/10'
                }`}
              >
                <FiHeart className={fav ? 'fill-red-400' : ''} />
                {fav ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
              </motion.button>
              {trailer && (
                <a
                  href={`https://www.youtube.com/watch?v=${trailer.key}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/80 rounded-xl font-semibold transition-colors"
                >
                  ▶ Fragman
                </a>
              )}
            </div>

            {/* Oyuncular */}
            {cast.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-bold mb-3">🎭 Oyuncular</h3>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {cast.map((c) => (
                    <Link key={c.id} to={`/person/${c.id}`} className="flex-shrink-0 text-center w-20 hover:opacity-90 transition-opacity">
                      {c.profile_path ? (
                        <img
                          src={profile(c.profile_path)}
                          alt={c.name}
                          className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-white/10"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-dark flex items-center justify-center mx-auto text-xl">
                          🎭
                        </div>
                      )}
                      <p className="text-xs mt-1 line-clamp-1">{c.name}</p>
                      <p className="text-[10px] text-gray-500 line-clamp-1">
                        {c.character}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Benzer Filmler */}
        {similar.length > 0 && (
          <section className="mt-16 pb-12">
            <h2 className="text-xl font-bold mb-6">🎯 Benzer Filmler</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {similar.map((m, i) => (
                <MovieCard key={m.id} movie={m} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </motion.div>
  );
}

