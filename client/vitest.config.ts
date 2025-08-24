import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['setupTests.ts'],
    // ✅ تحسين أداء الاختبارات - المرحلة الثانية
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 2,
      },
    },
    // تحسين coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov', 'clover'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '**/dist/**',
        '**/.{idea,git,cache,output,temp}/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
        '**/main.tsx',
        '**/index.tsx',
        '**/vite-env.d.ts',
        '**/types/**',
        '**/stories/**',
        '**/*.stories.*',
        '**/__mocks__/**',
        '**/mock-data.ts',
        '**/test-utils.tsx',
        '**/setupTests.ts',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        },
        // thresholds خاصة لكل مجلد
        './src/components/': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        },
        './src/pages/': {
          branches: 75,
          functions: 75,
          lines: 75,
          statements: 75
        },
        './src/hooks/': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        },
        './src/stores/': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        },
        './src/services/': {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        },
      },
      // تحسينات إضافية للcoverage
      all: true,
      clean: true,
      cleanOnRerun: true,
      skipFull: false,
      watermarks: {
        statements: [80, 95],
        branches: [80, 95],
        functions: [80, 95],
        lines: [80, 95],
      },
    },
    // تحسين أداء الاختبارات
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    exclude: [
      'node_modules/**',
      'dist/**',
      '**/*.d.ts',
      '**/coverage/**',
      '**/__mocks__/**',
      '**/mock-data.ts',
      '**/test-utils.tsx',
      '**/setupTests.ts',
    ],
    // تحسينات إضافية
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 1000,
    isolate: true,
    passWithNoTests: true,
    // تحسين reporting
    reporters: ['verbose', 'html'],
    outputFile: {
      html: './coverage/index.html',
      json: './coverage/coverage.json',
    },
    // تحسين UI
    ui: {
      enabled: true,
    },
    // Add environment variables for testing
    env: {
      NODE_ENV: 'test',
      VITE_API_URL: 'http://localhost:3001',
      VITE_APP_NAME: 'HRMS Elite Test',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@shared': path.resolve(__dirname, '../shared'),
      '@assets': path.resolve(__dirname, '../assets'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@stores': path.resolve(__dirname, 'src/stores'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@lib': path.resolve(__dirname, 'src/lib'),
      '@types': path.resolve(__dirname, 'src/types'),
      '@tests': path.resolve(__dirname, 'tests')
    },
  },
  // تحسينات إضافية للأداء
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@testing-library/react',
      '@testing-library/jest-dom',
      '@testing-library/user-event',
      'vitest',
    ],
  },
  // تحسين cache
  cacheDir: '.vitest',
  // Add define for global variables
  define: {
    __DEV__: true,
    __TEST__: true,
  },
}); 