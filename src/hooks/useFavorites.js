import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const STORAGE_KEY = 'movie_favorites';

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);

  // Kullanıcı bazlı localStorage key
  const userKey = user ? `${STORAGE_KEY}_${user.uid}` : STORAGE_KEY;

  useEffect(() => {
    const stored = localStorage.getItem(userKey);
    if (stored) {
      setFavorites(JSON.parse(stored));
    } else {
      setFavorites([]);
    }
  }, [userKey]);

  const save = (list) => {
    setFavorites(list);
    localStorage.setItem(userKey, JSON.stringify(list));
  };

  const toggleFavorite = (movie) => {
    const exists = favorites.find((f) => f.id === movie.id);
    if (exists) {
      save(favorites.filter((f) => f.id !== movie.id));
    } else {
      save([
        ...favorites,
        {
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          vote_average: movie.vote_average,
        },
      ]);
    }
  };

  const isFavorite = (id) => favorites.some((f) => f.id === id);

  return { favorites, toggleFavorite, isFavorite };
}

