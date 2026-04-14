import axios from 'axios';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const tmdb = axios.create({
  baseURL: TMDB_BASE,
  params: { api_key: API_KEY, language: 'tr-TR' },
});

export const IMG_BASE = 'https://image.tmdb.org/t/p';
export const backdrop = (path) => (path ? `${IMG_BASE}/original${path}` : null);
export const poster = (path) => (path ? `${IMG_BASE}/w500${path}` : null);

export default tmdb;

