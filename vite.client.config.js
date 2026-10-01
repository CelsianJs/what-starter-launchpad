import { defineConfig } from 'vite';
import what from 'what-compiler/vite';

export default defineConfig({
  appType: 'custom',
  plugins: [what()],
  build: {
    outDir: 'dist/client',
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: {
        main: 'src/client/main.jsx',
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
});
