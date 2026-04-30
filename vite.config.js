import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SW_TEMPLATE = resolve(__dirname, 'src/firebase-messaging-sw.template.js');

function injectEnv(src, env) {
  return Object.keys(env)
    .filter((k) => k.startsWith('VITE_'))
    .reduce((s, key) => {
      const safe = (env[key] || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      return s.split(`%${key}%`).join(safe);
    }, src);
}

function firebaseSwPlugin() {
  let env = {};
  let templateCache = null;
  return {
    name: 'firebase-sw-env',
    config(_, { mode }) {
      env = loadEnv(mode, process.cwd(), '');
    },
    configureServer(server) {
      server.middlewares.use('/firebase-messaging-sw.js', (req, res, next) => {
        if (req.method !== 'GET') return next();
        if (!templateCache) templateCache = readFileSync(SW_TEMPLATE, 'utf-8');
        res.setHeader('Content-Type', 'application/javascript');
        res.end(injectEnv(templateCache, env));
      });
    },
    generateBundle() {
      const src = readFileSync(SW_TEMPLATE, 'utf-8');
      this.emitFile({
        type: 'asset',
        fileName: 'firebase-messaging-sw.js',
        source: injectEnv(src, env),
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), firebaseSwPlugin()],
  server: { host: true, port: 3000, open: true },
});

