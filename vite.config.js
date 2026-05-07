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
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;

          if (id.includes('/node_modules/firebase/')) return 'firebase';
          if (id.includes('/node_modules/framer-motion/')) return 'motion';
          if (id.includes('/node_modules/react-icons/')) return 'icons';
          if (id.includes('/node_modules/i18next/') || id.includes('/node_modules/react-i18next/')) {
            return 'i18n';
          }
          if (
            id.includes('/node_modules/react-router/') ||
            id.includes('/node_modules/react-router-dom/')
          ) {
            return 'router';
          }
          if (
            id.includes('/node_modules/react/') ||
            id.includes('/node_modules/react-dom/') ||
            id.includes('/node_modules/scheduler/')
          ) {
            return 'react-vendor';
          }

          return 'vendor';
        },
      },
    },
  },
});
