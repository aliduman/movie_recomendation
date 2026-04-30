import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function firebaseSwPlugin() {
  let env = {};
  return {
    name: 'firebase-sw-env',
    config(_, { mode }) {
      env = loadEnv(mode, process.cwd(), '');
    },
    configureServer(server) {
      server.middlewares.use('/firebase-messaging-sw.js', (req, res, next) => {
        if (req.method !== 'GET') return next();
        let src = readFileSync(
          resolve(__dirname, 'src/firebase-messaging-sw.template.js'),
          'utf-8',
        );
        Object.keys(env)
          .filter((k) => k.startsWith('VITE_'))
          .forEach((key) => {
            src = src.split(`%${key}%`).join(env[key] || '');
          });
        res.setHeader('Content-Type', 'application/javascript');
        res.end(src);
      });
    },
    generateBundle() {
      let src = readFileSync(
        resolve(__dirname, 'src/firebase-messaging-sw.template.js'),
        'utf-8',
      );
      Object.keys(env)
        .filter((k) => k.startsWith('VITE_'))
        .forEach((key) => {
          src = src.split(`%${key}%`).join(env[key] || '');
        });
      this.emitFile({ type: 'asset', fileName: 'firebase-messaging-sw.js', source: src });
    },
  };
}

export default defineConfig({
  plugins: [react(), firebaseSwPlugin()],
  server: { host: true, port: 3000, open: true },
});

