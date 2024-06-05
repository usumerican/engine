import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'web/engine.js',
      name: 'engine',
    },
    copyPublicDir: false,
    outDir: 'dist/lib',
  },
});
