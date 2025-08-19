import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../src/lib/i18n';

// Import key pages and components
import Login from '../../src/pages/login';
import Dashboard from '../../src/pages/dashboard';
import Employees from '../../src/pages/employees';
import Documents from '../../src/pages/documents';
import CompanySelection from '../../src/pages/company-selection';

// Extend expect to include axe matchers
expect.extend(toHaveNoViolations);

// Test wrapper with all necessary providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </I18nextProvider>
    </QueryClientProvider>
  );
};

// Mock authentication store
vi.mock('../../src/stores/useAppStore', () => ({
  useAppStore: () => ({
    user: null,
    setUser: vi.fn(),
    clearUser: vi.fn(),
  }),
}));

// Mock toast hook
vi.mock('../../src/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('Accessibility Tests', () => {
  describe('Login Page', () => {
    it('should have no critical accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper form labels and ARIA attributes', () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      // Check for form labels
      expect(screen.getByLabelText(/username|اسم المستخدم/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password|كلمة المرور/i)).toBeInTheDocument();

      // Check for submit button
      const submitButton = screen.getByRole('button', { name: /login|تسجيل الدخول/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('should support keyboard navigation', () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const usernameInput = screen.getByLabelText(/username|اسم المستخدم/i);
      const passwordInput = screen.getByLabelText(/password|كلمة المرور/i);
      const submitButton = screen.getByRole('button', { name: /login|تسجيل الدخول/i });

      // Check tab order
      expect(usernameInput).toHaveAttribute('tabIndex', '0');
      expect(passwordInput).toHaveAttribute('tabIndex', '0');
      expect(submitButton).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Company Selection Page', () => {
    it('should have no critical accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <CompanySelection />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper heading structure', () => {
      render(
        <TestWrapper>
          <CompanySelection />
        </TestWrapper>
      );

      // Check for main heading
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toBeInTheDocument();
    });
  });

  describe('Dashboard Page', () => {
    it('should have no critical accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper navigation structure', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      // Check for navigation landmarks
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();

      // Check for main content area
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });
  });

  describe('Employees Page', () => {
    it('should have no critical accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <Employees />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper table accessibility', () => {
      render(
        <TestWrapper>
          <Employees />
        </TestWrapper>
      );

      // Check for table with proper structure
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();

      // Check for table headers
      const headers = screen.getAllByRole('columnheader');
      expect(headers.length).toBeGreaterThan(0);
    });
  });

  describe('Documents Page', () => {
    it('should have no critical accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <Documents />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper file upload accessibility', () => {
      render(
        <TestWrapper>
          <Documents />
        </TestWrapper>
      );

      // Check for file input with proper labeling
      const fileInput = screen.getByLabelText(/file|ملف/i);
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute('type', 'file');
    });
  });

  describe('Global Accessibility', () => {
    it('should have proper page title', () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      expect(document.title).toBeTruthy();
    });

    it('should have proper language attribute', () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      expect(document.documentElement).toHaveAttribute('lang');
    });

    it('should have skip links for keyboard users', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      // Look for skip links
      const skipLinks = screen.queryAllByRole('link', { name: /skip|تخطي/i });
      expect(skipLinks.length).toBeGreaterThan(0);
    });
  });

  describe('Color Contrast and Visual Accessibility', () => {
    it('should have sufficient color contrast', async () => {
      const { container } = render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true },
        },
      });

      // Check for color contrast violations
      const colorContrastViolations = results.violations.filter(
        violation => violation.id === 'color-contrast'
      );
      expect(colorContrastViolations).toHaveLength(0);
    });

    it('should have proper focus indicators', async () => {
      const { container } = render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const results = await axe(container, {
        rules: {
          'focus-visible': { enabled: true },
        },
      });

      // Check for focus visibility violations
      const focusViolations = results.violations.filter(
        violation => violation.id === 'focus-visible'
      );
      expect(focusViolations).toHaveLength(0);
    });
  });

  describe('Screen Reader Accessibility', () => {
    it('should have proper ARIA labels and descriptions', async () => {
      const { container } = render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const results = await axe(container, {
        rules: {
          'aria-allowed-attr': { enabled: true },
          'aria-required-attr': { enabled: true },
          'aria-valid-attr-value': { enabled: true },
        },
      });

      // Check for ARIA violations
      const ariaViolations = results.violations.filter(
        violation => violation.id.startsWith('aria-')
      );
      expect(ariaViolations).toHaveLength(0);
    });

    it('should have proper heading hierarchy', async () => {
      const { container } = render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      const results = await axe(container, {
        rules: {
          'heading-order': { enabled: true },
        },
      });

      // Check for heading order violations
      const headingViolations = results.violations.filter(
        violation => violation.id === 'heading-order'
      );
      expect(headingViolations).toHaveLength(0);
    });
  });
}); 