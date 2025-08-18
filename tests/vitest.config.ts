import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.test.ts', '**/*.test.tsx'],
    exclude: ['node_modules', 'dist', 'client/**/*'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '../'),
      '@shared': resolve(__dirname, '../shared'),
      '@server': resolve(__dirname, '../server'),
      '@utils': resolve(__dirname, '../server/utils'),
      '@middleware': resolve(__dirname, '../server/middleware'),
      '@routes': resolve(__dirname, '../server/routes'),
      '@models': resolve(__dirname, '../server/models'),
    },
  },
});
