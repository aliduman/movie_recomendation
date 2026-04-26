import { readFileSync } from 'fs';
import { join } from 'path';

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export default async function handler(req, res) {
  const { id } = req.query;

  let baseHtml;
  try {
    baseHtml = readFileSync(join(process.cwd(), 'dist', 'index.html'), 'utf-8');
  } catch {
    return res.status(500).send('Build not found');
  }

  try {
    const apiKey = process.env.VITE_TMDB_API_KEY;
    const movieRes = await fetch(
      `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=tr-TR`
    );
    const movie = await movieRes.json();
    if (!movie.id) throw new Error('not found');

    const title = `${movie.title} - MyFlickPick`;
    const description = (movie.overview || '').slice(0, 200);
    const image = movie.backdrop_path
      ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
      : movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : '';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const url = `${proto}://${req.headers.host}/movie/${id}`;

    const ogTags = [
      `<meta property="og:type" content="website" />`,
      `<meta property="og:site_name" content="MyFlickPick" />`,
      `<meta property="og:title" content="${esc(title)}" />`,
      `<meta property="og:description" content="${esc(description)}" />`,
      `<meta property="og:image" content="${esc(image)}" />`,
      `<meta property="og:url" content="${esc(url)}" />`,
      `<meta name="twitter:card" content="summary_large_image" />`,
      `<meta name="twitter:title" content="${esc(title)}" />`,
      `<meta name="twitter:description" content="${esc(description)}" />`,
      `<meta name="twitter:image" content="${esc(image)}" />`,
    ].join('\n    ');

    const html = baseHtml
      .replace(/<title>[^<]*<\/title>/, `<title>${esc(movie.title)} - MyFlickPick</title>`)
      .replace('</head>', `    ${ogTags}\n  </head>`);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(html);
  } catch {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(baseHtml);
  }
}
