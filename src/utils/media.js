// Helpers for normalizing TMDB items that can be either a movie or a TV series.
// TMDB returns `media_type: 'movie'|'tv'|'person'` on multi/trending endpoints.
// On single-resource fetches (/movie/:id, /tv/:id) the field is missing — we
// infer the type from the presence of TV-specific fields (`name`, `first_air_date`).

export function getMediaType(item) {
  if (!item) return 'movie';
  if (item.media_type === 'movie' || item.media_type === 'tv') return item.media_type;
  if (item.first_air_date || (item.name && !item.title)) return 'tv';
  return 'movie';
}

export function getTitle(item) {
  if (!item) return '';
  return item.title || item.name || '';
}

export function getReleaseDate(item) {
  if (!item) return '';
  return item.release_date || item.first_air_date || '';
}

export function buildDetailPath(item) {
  return `/${getMediaType(item) === 'tv' ? 'tv' : 'movie'}/${item.id}`;
}

// Composite key for documents that must be unique across media types.
// Movies keep the bare numeric id (legacy compatibility); TV docs are prefixed.
export function mediaDocId(idOrItem, mediaType) {
  const id = typeof idOrItem === 'object' ? idOrItem.id : idOrItem;
  const type = mediaType || (typeof idOrItem === 'object' ? getMediaType(idOrItem) : 'movie');
  return type === 'tv' ? `tv_${id}` : String(id);
}

export function parseMediaDocId(docId) {
  if (typeof docId === 'string' && docId.startsWith('tv_')) {
    return { mediaType: 'tv', id: Number(docId.slice(3)) };
  }
  return { mediaType: 'movie', id: Number(docId) };
}

// Top-level Firestore collection name for movie/tv subcollections (chat, comments, likedBy).
// Movies live under /movies/{id}/...; TV under /tv/{id}/... — mirrors TMDB endpoint naming.
export function mediaCollection(mediaType) {
  return mediaType === 'tv' ? 'tv' : 'movies';
}
