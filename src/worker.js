const CLIENT_ENV_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_MEASUREMENT_ID',
  'VITE_FIREBASE_VAPID_KEY',
  'VITE_TMDB_API_KEY',
  'VITE_NOTIFY_API_URL',
];

export function clientEnv(env) {
  const values = {};
  for (const key of CLIENT_ENV_KEYS) {
    if (typeof env?.[key] === 'string' && env[key]) values[key] = env[key];
  }
  return values;
}

export function injectEnvIntoHtml(html, env) {
  const json = JSON.stringify(clientEnv(env)).replace(/</g, '\\u003c');
  const script = `<script>window.__ENV__=${json}</script>`;
  if (html.includes('</head>')) return html.replace('</head>', `${script}</head>`);
  return `${script}${html}`;
}

export function fillServiceWorker(source, env) {
  return Object.entries(clientEnv(env)).reduce((text, [key, value]) => {
    const safe = value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    return text.split(`%${key}%`).join(safe);
  }, source);
}

function textResponse(response, body, contentType) {
  const headers = new Headers(response.headers);
  headers.delete('content-length');
  headers.delete('content-encoding');
  headers.delete('etag');
  headers.set('content-type', contentType);
  return new Response(body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const response = await env.ASSETS.fetch(request);
    if (!response.body || response.status === 204 || response.status === 304) return response;

    if (url.pathname === '/firebase-messaging-sw.js') {
      const source = await response.text();
      return textResponse(response, fillServiceWorker(source, env), 'application/javascript; charset=utf-8');
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      const html = await response.text();
      return textResponse(response, injectEnvIntoHtml(html, env), 'text/html; charset=utf-8');
    }

    return response;
  },
};
