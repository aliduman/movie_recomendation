import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiCheck, FiX, FiShare2, FiMessageSquare, FiStar, FiUserPlus, FiUserCheck } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useProfile, usePublicFavorites, saveProfile } from '../hooks/useProfile';
import { useFollow } from '../hooks/useFollow';
import { GENRES } from '../hooks/useMovies';
import { poster } from '../config/tmdb';
import DMPanel from '../components/DMPanel';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { uid } = useParams();
  const { user } = useAuth();
  const isOwn = user?.uid === uid;

  const { profile, loading: profileLoading } = useProfile(uid);
  const { favorites, loading: favsLoading } = usePublicFavorites(uid);
  const { following, followerCount, followingCount, toggle: toggleFollow } = useFollow(uid);

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [dmOpen, setDmOpen] = useState(false);

  const displayName = profile?.displayName || user?.displayName || 'Kullanıcı';
  const photoURL = profile?.photoURL || user?.photoURL;
  const bio = profile?.bio || '';

  const availableGenres = useMemo(() => {
    const ids = new Set(favorites.flatMap((f) => f.genre_ids || []));
    return GENRES.filter((g) => ids.has(g.id));
  }, [favorites]);

  const filtered = useMemo(() => {
    if (!selectedGenre) return favorites;
    return favorites.filter((f) => f.genre_ids?.includes(selectedGenre));
  }, [favorites, selectedGenre]);

  const startEdit = () => {
    setEditName(displayName);
    setEditBio(bio);
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const saveEdit = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      await saveProfile(uid, {
        displayName: editName.trim(),
        bio: editBio.trim(),
        photoURL: user?.photoURL || '',
      });
      toast.success('Profil güncellendi');
      setEditing(false);
    } catch {
      toast.error('Güncelleme başarısız');
    }
    setSaving(false);
  };

  const shareProfile = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: `${displayName} - FilmBul`, url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Profil linki kopyalandı!');
    }
  };

  if (profileLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="pt-20 pb-16 max-w-5xl mx-auto px-4"
      >
        {/* Profil Header */}
        <div className="relative rounded-3xl overflow-hidden mb-8"
          style={{ background: 'linear-gradient(135deg, rgba(109,40,217,0.15) 0%, rgba(192,38,211,0.08) 100%)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {/* Glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-400 to-secondary opacity-70" />

          <div className="px-6 py-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {photoURL ? (
                <img src={photoURL} alt="" className="w-20 h-20 rounded-2xl border-2 border-primary/40 shadow-xl shadow-primary/20" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-primary/20 border-2 border-primary/40 flex items-center justify-center text-3xl">👤</div>
              )}
            </div>

            {/* Bilgiler */}
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="flex flex-col gap-3">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="bg-white/5 border border-white/15 focus:border-primary/50 focus:outline-none rounded-xl px-3 py-2 text-base font-bold text-white w-full max-w-xs"
                    placeholder="Ad Soyad"
                  />
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Kısa bir bio ekle..."
                    rows={2}
                    className="bg-white/5 border border-white/15 focus:border-primary/50 focus:outline-none rounded-xl px-3 py-2 text-sm text-gray-300 w-full max-w-sm resize-none"
                  />
                  <div className="flex gap-2">
                    <motion.button whileTap={{ scale: 0.95 }} onClick={saveEdit} disabled={saving}
                      className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/80 rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors">
                      <FiCheck size={14} /> Kaydet
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={cancelEdit}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white transition-colors"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <FiX size={14} /> İptal
                    </motion.button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-extrabold text-white truncate">{displayName}</h1>
                  {bio && <p className="text-sm text-gray-400 mt-1 leading-relaxed">{bio}</p>}
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-gray-400"><span className="text-white font-semibold">{followerCount}</span> takipçi</span>
                    <span className="text-xs text-gray-400"><span className="text-white font-semibold">{followingCount}</span> takip</span>
                    <span className="text-xs text-gray-400"><span className="text-white font-semibold">{favorites.length}</span> favori</span>
                  </div>
                </>
              )}
            </div>

            {/* Aksiyonlar */}
            {!editing && (
              <div className="flex gap-2 flex-shrink-0">
                {isOwn ? (
                  <motion.button whileTap={{ scale: 0.95 }} onClick={startEdit}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-colors"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <FiEdit2 size={14} /> Düzenle
                  </motion.button>
                ) : user ? (
                  <>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={toggleFollow}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${following ? 'text-gray-300 hover:text-red-400' : 'bg-gradient-to-r from-primary to-purple-500 hover:opacity-90 text-white shadow-lg shadow-primary/30'}`}
                      style={following ? { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' } : {}}>
                      {following ? <><FiUserCheck size={14} /> Takip Ediliyor</> : <><FiUserPlus size={14} /> Takip Et</>}
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => setDmOpen(true)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-colors"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <FiMessageSquare size={14} /> Mesaj
                    </motion.button>
                  </>
                ) : null}
                <motion.button whileTap={{ scale: 0.95 }} onClick={shareProfile}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <FiShare2 size={14} /> Paylaş
                </motion.button>
              </div>
            )}
          </div>
        </div>

        {/* Favoriler */}
        <div>
          <h2 className="text-lg font-bold mb-4">❤️ Favori Filmler</h2>

          {favsLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-16 text-gray-600">
              <span className="text-4xl block mb-3">🎬</span>
              Henüz favori film eklenmemiş.
            </div>
          ) : (
            <>
              {/* Kategori filtreleri */}
              {availableGenres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  <button
                    onClick={() => setSelectedGenre(null)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${!selectedGenre ? 'bg-gradient-to-r from-primary to-purple-500 text-white shadow-md shadow-primary/30' : 'text-gray-400 hover:text-white'}`}
                    style={!selectedGenre ? {} : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    🎬 Tümü ({favorites.length})
                  </button>
                  {availableGenres.map((genre) => {
                    const count = favorites.filter((f) => f.genre_ids?.includes(genre.id)).length;
                    const active = selectedGenre === genre.id;
                    return (
                      <button key={genre.id}
                        onClick={() => setSelectedGenre(active ? null : genre.id)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${active ? 'bg-gradient-to-r from-primary to-purple-500 text-white shadow-md shadow-primary/30' : 'text-gray-400 hover:text-white'}`}
                        style={active ? {} : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        {genre.emoji} {genre.name} ({count})
                      </button>
                    );
                  })}
                </div>
              )}

              <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filtered.map((movie) => (
                  <motion.div key={movie.id} layout whileHover={{ scale: 1.03, y: -4 }} whileTap={{ scale: 0.97 }}
                    className="group relative rounded-2xl overflow-hidden bg-dark border border-white/5 shadow-lg shadow-black/20">
                    <Link to={`/movie/${movie.id}`}>
                      {movie.poster_path ? (
                        <img src={poster(movie.poster_path)} alt={movie.title} className="w-full aspect-[2/3] object-cover" />
                      ) : (
                        <div className="w-full aspect-[2/3] bg-dark/80 flex items-center justify-center text-4xl">🎬</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                        <p className="text-xs font-semibold text-white line-clamp-2">{movie.title}</p>
                        {movie.vote_average && (
                          <span className="flex items-center gap-1 text-secondary text-xs mt-1">
                            <FiStar className="fill-secondary" size={10} />
                            {Number(movie.vote_average).toFixed(1)}
                          </span>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </div>
      </motion.div>

      {/* DM Panel */}
      <AnimatePresence>
        {dmOpen && profile && (
          <DMPanel
            otherUid={uid}
            otherName={displayName}
            otherPhoto={photoURL}
            onClose={() => setDmOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
