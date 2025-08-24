import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// Image optimization
import viteImagemin from 'vite-plugin-imagemin';
import sri from 'vite-plugin-sri';
import { execSync } from 'child_process';

const buildHash = execSync('git rev-parse --short HEAD').toString().trim();

export default defineConfig({
  define: {
    __BUILD_HASH__: JSON.stringify(buildHash),
  },
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
    sri(),
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


