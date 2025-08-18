import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname
});

export default [
  js.configs.recommended,
  // تجاهل مجلدات البناء والتوليد
  {
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/coverage/**',
      '**/docs/**',
      '**/public/**',
      '**/node_modules/**',
      '**/*.min.js',
      '**/workbox-*.js',
      '**/sw.js'
    ]
  },
  ...compat.config({
    overrides: [
      {
        files: ['**/*.{ts,tsx}'],
        parser: '@typescript-eslint/parser',
        plugins: ['@typescript-eslint'],
        parserOptions: {
          ecmaVersion: 'latest',
          sourceType: 'module',
          project: ['./tsconfig.json', './client/tsconfig.json'],
          tsconfigRootDir: import.meta.dirname
        },
        globals: {
          console: 'readonly',
          process: 'readonly',
          require: 'readonly',
          __dirname: 'readonly',
          __filename: 'readonly',
          Buffer: 'readonly',
          global: 'readonly',
          module: 'readonly',
          exports: 'readonly',
          setTimeout: 'readonly',
          clearTimeout: 'readonly',
          setInterval: 'readonly',
          clearInterval: 'readonly',
          window: 'readonly',
          navigator: 'readonly',
          self: 'readonly',
          caches: 'readonly',
          fetch: 'readonly',
          Response: 'readonly',
          URL: 'readonly',
          clients: 'readonly',
          action: 'readonly',
          actionId: 'readonly',
          describe: 'readonly',
          it: 'readonly',
          expect: 'readonly',
          beforeAll: 'readonly',
          afterAll: 'readonly',
          vi: 'readonly',
          req: 'readonly',
          res: 'readonly',
          next: 'readonly'
        },
        rules: {
          // قواعد عامة
          'no-console': 'error',
          'no-debugger': 'error',
          'no-var': 'error',
          'prefer-const': 'error',
          eqeqeq: 'error',

          // قواعد TypeScript
          'no-unused-vars': 'off',
          '@typescript-eslint/no-unused-vars': ['error', {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_'
          }],

          // منع استخدام any
          '@typescript-eslint/no-explicit-any': 'error',
          '@typescript-eslint/no-unsafe-assignment': 'error',
          '@typescript-eslint/no-unsafe-return': 'error',
          '@typescript-eslint/no-unsafe-member-access': 'error',
          '@typescript-eslint/no-unsafe-call': 'error',

          // قواعد إضافية للجودة
          '@typescript-eslint/prefer-nullish-coalescing': 'error',
          '@typescript-eslint/prefer-optional-chain': 'error',
          '@typescript-eslint/no-unnecessary-type-assertion': 'error'
        }
      },
      {
        files: ['**/migrations/**', '**/scripts/**', '**/tests/**'],
        plugins: ['@typescript-eslint'],
        rules: {
          '@typescript-eslint/no-explicit-any': 'warn',
          'no-console': 'off'
        }
      },
      {
        files: ['**/*.test.{ts,tsx}', '**/tests/**/*.{ts,tsx}'],
        parser: '@typescript-eslint/parser',
        plugins: ['@typescript-eslint'],
        parserOptions: {
          ecmaVersion: 'latest',
          sourceType: 'module',
          project: ['./tsconfig.test.json'],
          tsconfigRootDir: import.meta.dirname
        },
        rules: {
          '@typescript-eslint/no-explicit-any': 'warn',
          'no-console': 'off'
        }
      }
    ]
  }),
  {
    files: ['**/*.js', '**/*.cjs'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly'
      }
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }]
    }
  }
];

