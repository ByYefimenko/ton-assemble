import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      // Resolve to source rather than dist so the editor entry tree-shakes and
      // dev picks up changes without a rebuild.
      '@ton-site-builder/templates/editor': path.resolve(
        __dirname,
        '../../packages/templates/src/editor.ts'
      ),
      '@ton-site-builder/templates': path.resolve(
        __dirname,
        '../../packages/templates/src/index.ts'
      ),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  // Dev only; production builds use VITE_API_URL.
  server: {
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
      '/preview': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
});
