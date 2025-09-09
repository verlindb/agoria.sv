import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    force: true,
    exclude: ['chunk-3ZB7XYST', 'chunk-ITLK24CB']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@theme': path.resolve(__dirname, './src/theme'),
    },
  },
  server: {
    port: 3000,
    open: true,
    hmr: {
      overlay: false, // Disable overlay to prevent corruption
    },
    // Proxy API requests to the backend. The target can be overridden via BACKEND_URL env var.
    // By default the API exposes HTTPS on 52790 and HTTP on 52791 (see backend launchSettings).
    // Use the HTTP port here to avoid TLS/certificate issues in the dev proxy.
    // Example: set BACKEND_URL=http://localhost:52791 before running the frontend dev server
    proxy: (() => {
      const backend = process.env.BACKEND_URL ?? 'http://localhost:52791';
      return {
        '/api': {
          target: backend,
          changeOrigin: true,
          secure: false,
        },
        '/swagger': {
          target: backend,
          changeOrigin: true,
          secure: false,
        },
      };
    })(),
  },
  build: {
    outDir: 'build',
    sourcemap: true,
  },
});
