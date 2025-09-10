import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Vite config factory so we can read env vars injected by Aspire (e.g. PORT, VITE_API_BASE_URL)
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiBase = env.VITE_API_BASE_URL || 'https://localhost:52790';
  // Port comes from Aspire via process.env.PORT; fallback to 3001 for manual runs
  const port = Number(process.env.PORT || env.PORT || 3001);

  return {
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
      port,                 // Dynamic / injected
      strictPort: true,     // Fail fast so Aspire reports issues
      host: 'localhost',    // Bind explicitly for Aspire proxy
      open: false,          // Avoid auto-open when orchestrated
      hmr: { overlay: false },
      proxy: {
        '/api': {
          target: apiBase,
          changeOrigin: true,
          secure: false,
        },
        '/swagger': {
          target: apiBase,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      outDir: 'build',
      sourcemap: true,
    },
  };
});
