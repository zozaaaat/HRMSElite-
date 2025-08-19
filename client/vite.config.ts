import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// Image optimization
import viteImagemin from 'vite-plugin-imagemin';

export default defineConfig({
  plugins: [
    react(),
    viteImagemin({
      gifsicle: { optimizationLevel: 3, interlaced: false },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 75, progressive: true },
      svgo: {
        plugins: [
          { name: 'removeViewBox', active: false },
          { name: 'cleanupIDs', active: true },
        ],
      },
    }),
  ],
  build: {
    sourcemap: false,
    manifest: true,
    // Keep warning limit modest to surface large chunks during dev
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // Create a separate vendor chunk to keep the main entry small
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
});


