import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
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
      '**/sw.js',
      '**/scripts/**',
      '**/tests/**',
      '**/.vite/**',
      '**/.vite/deps/**',
      '**/.backup/**',
      '**/backup-console-logs/**',
      '**/*.cjs',
      '**/add-sample-data.js',
      '**/create-database.js',
      '**/demo-ai-endpoints.js',
      '**/test-rate-limiting.js',
      '**/test-main-app.cjs'
    ]
  },
  {
    files: ['**/*.cjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
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
      'no-debugger': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'eqeqeq': 'error',
      'no-console': 'error'
    }
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly'
      }
    },
    rules: {
      'no-debugger': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'eqeqeq': 'error',
      'no-console': 'error'
    }
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
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
        document: 'readonly',
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
        next: 'readonly',
        localStorage: 'readonly',
        CustomEvent: 'readonly',
        Notification: 'readonly',
        NotificationOptions: 'readonly',
        Blob: 'readonly',
        File: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLButtonElement: 'readonly',
        HTMLTextAreaElement: 'readonly',
        HTMLTableElement: 'readonly',
        HTMLSpanElement: 'readonly',
        HTMLElement: 'readonly',
        SVGSVGElement: 'readonly',
        ServiceWorkerRegistration: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': typescript
    },
    rules: {
      'no-debugger': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'eqeqeq': 'error',
      'no-unused-vars': 'off',
      'no-console': ['error', { allow: ['debug', 'info', 'warn', 'error'] }],
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }]
    }
  }
];
