import { useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCalendar, FiMapPin } from 'react-icons/fi';
import { usePersonDetail } from '../hooks/useMovies';
import { profile } from '../config/tmdb';
import MovieCard from '../components/MovieCard';

export default function ActorDetailPage() {
  const { id } = useParams();
  const { person, credits, loading } = usePersonDetail(id);
  const [searchParams, setSearchParams] = useSearchParams();

  const yearFrom = searchParams.get('from') || '';
  const yearTo = searchParams.get('to') || '';
  const minRating = searchParams.get('min') || '0';

  const updateParam = (key, value, defaultValue = '') => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === defaultValue) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next, { replace: true });
  };

  const filteredCredits = useMemo(() => {
    const from = yearFrom ? Number(yearFrom) : null;
    const to = yearTo ? Number(yearTo) : null;
    const rating = Number(minRating || 0);

    return credits
      .filter((movie) => {
        const year = movie.release_date ? Number(movie.release_date.slice(0, 4)) : null;
        const vote = Number(movie.vote_average || 0);

        if (from && (!year || year < from)) return false;
        if (to && (!year || year > to)) return false;
        if (vote < rating) return false;

        return true;
      })
      .sort((a, b) => {
        const ratingDiff = (b.vote_average || 0) - (a.vote_average || 0);
        if (ratingDiff !== 0) return ratingDiff;

        const yearA = a.release_date ? Number(a.release_date.slice(0, 4)) : 0;
        const yearB = b.release_date ? Number(b.release_date.slice(0, 4)) : 0;
        return yearB - yearA;
      });
  }, [credits, minRating, yearFrom, yearTo]);

  const resetFilters = () => {
    setSearchParams({}, { replace: true });
  };

  if (loading || !person) {
    return (
      <div className="pt-24 flex justify-center">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="pt-24 pb-12 max-w-7xl mx-auto px-4">
        <Link
          to={-1}
          className="inline-flex items-center gap-2 glass px-4 py-2 rounded-xl text-sm hover:bg-white/10 transition-colors"
        >
          <FiArrowLeft size={14} /> Geri
        </Link>

        <div className="mt-6 grid md:grid-cols-[280px_1fr] gap-8">
          <div>
            {person.profile_path ? (
              <img
                src={profile(person.profile_path)}
                alt={person.name}
                className="w-full max-w-[280px] rounded-2xl object-cover"
              />
            ) : (
              <div className="w-full max-w-[280px] h-[420px] rounded-2xl bg-dark flex items-center justify-center text-6xl">
                🎭
              </div>
            )}
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold">{person.name}</h1>

            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-400">
              {person.birthday && (
                <span className="flex items-center gap-1.5">
                  <FiCalendar size={14} /> {person.birthday}
                </span>
              )}
              {person.place_of_birth && (
                <span className="flex items-center gap-1.5">
                  <FiMapPin size={14} /> {person.place_of_birth}
                </span>
              )}
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-bold mb-2">Biyografi</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                {person.biography || 'Bu oyuncu icin biyografi bilgisi bulunamadi.'}
              </p>
            </div>
          </div>
        </div>

        {credits.length > 0 && (
          <section className="mt-12">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-bold">Bilinen Filmleri</h2>
              <span className="text-xs text-gray-500">
                {filteredCredits.length} / {credits.length} film
              </span>
            </div>

            <div className="glass rounded-2xl p-3 mb-6 grid sm:grid-cols-4 gap-2">
              <input
                type="number"
                min="1900"
                max="2100"
                value={yearFrom}
                  onChange={(e) => updateParam('from', e.target.value)}
                placeholder="Yıl (min)"
                className="bg-dark/70 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/60"
              />
              <input
                type="number"
                min="1900"
                max="2100"
                value={yearTo}
                  onChange={(e) => updateParam('to', e.target.value)}
                placeholder="Yıl (max)"
                className="bg-dark/70 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/60"
              />
              <select
                value={minRating}
                  onChange={(e) => updateParam('min', e.target.value, '0')}
                className="bg-dark/70 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/60"
              >
                <option value="0">Puan: Hepsi</option>
                <option value="5">Puan: 5+</option>
                <option value="6">Puan: 6+</option>
                <option value="7">Puan: 7+</option>
                <option value="8">Puan: 8+</option>
              </select>
              <button
                type="button"
                onClick={resetFilters}
                className="px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                Filtreleri Temizle
              </button>
            </div>

            {filteredCredits.length === 0 && (
              <p className="text-sm text-gray-500 mb-4">
                Bu filtrelerle film bulunamadi. Filtreleri gevsetmeyi dene.
              </p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredCredits.map((movie, index) => (
                <MovieCard key={`${movie.id}-${index}`} movie={movie} index={index} />
              ))}
            </div>
          </section>
        )}
      </div>
    </motion.div>
  );
}



