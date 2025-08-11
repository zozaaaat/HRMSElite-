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
    },
  },
}); 