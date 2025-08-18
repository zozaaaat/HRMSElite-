import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock IntersectionObserver if needed
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver if needed
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.scrollTo
window.scrollTo = vi.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to ignore a specific log level
  // log: vi.fn(),
  // debug: vi.fn(),
  // info: vi.fn(),
  // warn: vi.fn(),
  // error: vi.fn(),
};

// Mock fetch
global.fetch = vi.fn();

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mocked-url');

// Mock URL.revokeObjectURL
global.URL.revokeObjectURL = vi.fn();

// Mock FileReader
global.FileReader = class FileReader {
  readAsDataURL() {
    setTimeout(() => {
      if (this.onload) {
        this.onload({ target: { result: 'data:text/plain;base64,dGVzdA==' } } as any);
      }
    }, 0);
  }
  readAsText() {
    setTimeout(() => {
      if (this.onload) {
        this.onload({ target: { result: 'test content' } } as any);
      }
    }, 0);
  }
} as any; 