import { defineConfig } from 'vite';
import { readdirSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

// Plain HTML/CSS/JS site — Vite is used only as a dev server (instant reload)
// and a static build tool. No framework, no components. If you ever want a
// small React/Tailwind widget on one section, it can be added later without
// touching anything here.

// Standalone case-study pages (e.g. orbit.html) live under src/pages/ and
// are plain self-contained HTML — Vite's dev server serves any file under
// root regardless of build config, but `vite build` only bundles files it's
// explicitly told about. Without this, src/pages/*.html would 404 in
// production even though they work fine in `npm run dev`. This picks up
// every .html file in that folder automatically, so a new case-study page
// (drop the file in, no config change) is included too.
const pagesDir = fileURLToPath(new URL('./src/pages', import.meta.url));
const pageInputs = Object.fromEntries(
  readdirSync(pagesDir)
    .filter((f) => f.endsWith('.html'))
    .map((f) => [`pages/${f.replace(/\.html$/, '')}`, fileURLToPath(new URL(`./src/pages/${f}`, import.meta.url))])
);

export default defineConfig({
  server: {
    port: 5173,
    // Lets the page call fetch('/api/...') during `npm run dev` without CORS
    // hassle — requests are forwarded to the backend on port 3001.
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        ...pageInputs
      }
    }
  }
});
