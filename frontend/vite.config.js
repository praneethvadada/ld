import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // In development the browser talks to Vite, which forwards /api to the backend.
  const proxy = {
    '/api': {
      target: env.API_PROXY_TARGET || 'http://localhost:5050',
      changeOrigin: true,
    },
  };

  return {
    plugins: [react()],
    server: { port: 5173, proxy },
    preview: { port: 4173, proxy },
  };
});
