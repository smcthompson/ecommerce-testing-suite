import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Vite default, or your preferred port
    proxy: {
      '/api': {
        target: 'https://localhost:3000',
        secure: false,
      }
    },
  },
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  root: '.',
});
