import { defineConfig } from 'vite';

// Plain HTML/CSS/JS site — Vite is used only as a dev server (instant reload)
// and a static build tool. No framework, no components. If you ever want a
// small React/Tailwind widget on one section, it can be added later without
// touching anything here.
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
    outDir: 'dist'
  }
});
