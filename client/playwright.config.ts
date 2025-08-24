import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/accessibility',
  testMatch: /a11y-smoke\.spec\.ts/,
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:5173',
  },
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: true,
  },
});
