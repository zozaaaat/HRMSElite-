import '@testing-library/jest-dom';
import { beforeAll } from 'vitest';
import { app } from '../server/app';
import { registerRoutes } from '../server/routes';

const g = globalThis as { __routesRegistered?: boolean };

beforeAll(async () => {
  if (!g.__routesRegistered) {
    await registerRoutes(app);
    g.__routesRegistered = true;
  }
});

// Mock IntersectionObserver without relying on DOM lib types
class MockIntersectionObserver {
  root = null;
  rootMargin = '';
  thresholds = [] as number[];

  constructor(_callback?: unknown, _options?: unknown) {}

  disconnect(): void {}
  observe(_target: unknown): void {}
  unobserve(_target: unknown): void {}
  takeRecords(): unknown[] { return []; }
}

(globalThis as Record<string, unknown>).IntersectionObserver =
  MockIntersectionObserver as unknown;

// Mock ResizeObserver without relying on DOM lib types
class MockResizeObserver {
  constructor(_callback?: unknown) {}
  observe(_target: unknown, _options?: unknown): void {}
  unobserve(_target: unknown): void {}
  disconnect(): void {}
}

(globalThis as Record<string, unknown>).ResizeObserver =
  MockResizeObserver as unknown;

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}; 