import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: 'src/frontend',
  publicDir: 'public', // This is relative to root, so src/frontend/public
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/frontend/index.html'),
      }
    }
  },
  worker: {
    format: 'es'
  }
});
