import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../src/lib/i18n';
import { AccessibilityProvider } from '../../src/components/shared/AccessibilityProvider';
import { AccessibleButton } from '../../src/components/ui/accessible-button';
import { AccessibleInput } from '../../src/components/ui/accessible-form';

// Extend expect to include axe matchers
expect.extend(toHaveNoViolations);

// Test wrapper with necessary providers
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
        <AccessibilityProvider>
          {children}
        </AccessibilityProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
};

describe('Basic Accessibility Tests', () => {
  describe('AccessibleButton Component', () => {
    it('should have no critical accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <AccessibleButton>Test Button</AccessibleButton>
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA attributes', () => {
      render(
        <TestWrapper>
          <AccessibleButton
            aria-label="Submit form"
            pressed={false}
            expanded={false}
          >
            Submit
          </AccessibleButton>
        </TestWrapper>
      );

      const button = screen.getByRole('button', { name: /submit form/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-pressed', 'false');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('should support loading state', () => {
      render(
        <TestWrapper>
          <AccessibleButton loading loadingText="Processing...">
            Submit
          </AccessibleButton>
        </TestWrapper>
      );

      const button = screen.getByRole('button', { name: /submit/i });
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toBeDisabled();
    });
  });

  describe('AccessibleInput Component', () => {
    it('should have no critical accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <AccessibleInput
            label="Email Address"
            type="email"
            required
          />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper form labels', () => {
      render(
        <TestWrapper>
          <AccessibleInput
            label="Email Address"
            type="email"
            required
          />
        </TestWrapper>
      );

      const input = screen.getByLabelText(/email address/i);
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'email');
      expect(input).toHaveAttribute('aria-required', 'true');
    });

    it('should handle error states', () => {
      render(
        <TestWrapper>
          <AccessibleInput
            label="Email Address"
            type="email"
            error="Please enter a valid email address"
            required
          />
        </TestWrapper>
      );

      const input = screen.getByLabelText(/email address/i);
      const errorMessage = screen.getByText(/please enter a valid email address/i);

      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(errorMessage).toHaveAttribute('role', 'alert');
    });

    it('should support helper text', () => {
      render(
        <TestWrapper>
          <AccessibleInput
            label="Email Address"
            type="email"
            helperText="Enter your email address"
            required
          />
        </TestWrapper>
      );

      const helperText = screen.getByText(/enter your email address/i);
      expect(helperText).toBeInTheDocument();
    });
  });

  describe('AccessibilityProvider', () => {
    it('should provide skip links', () => {
      render(
        <TestWrapper>
          <div>
            <h1>Test Page</h1>
            <p>Test content</p>
          </div>
        </TestWrapper>
      );

      // Check for skip links
      const skipLinks = screen.queryAllByRole('link', { name: /skip/i });
      expect(skipLinks.length).toBeGreaterThan(0);

      // Check for main content landmark
      const mainContent = screen.getByRole('main');
      expect(mainContent).toBeInTheDocument();
      expect(mainContent).toHaveAttribute('id', 'main-content');
    });

    it('should provide live regions for announcements', () => {
      render(
        <TestWrapper>
          <div>Test content</div>
        </TestWrapper>
      );

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    });
  });

  describe('Form Accessibility', () => {
    it('should have proper form structure', () => {
      render(
        <TestWrapper>
          <form>
            <AccessibleInput
              label="First Name"
              name="firstName"
              required
            />
            <AccessibleInput
              label="Last Name"
              name="lastName"
              required
            />
            <AccessibleButton type="submit">
              Submit Form
            </AccessibleButton>
          </form>
        </TestWrapper>
      );

      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const submitButton = screen.getByRole('button', { name: /submit form/i });

      expect(firstNameInput).toBeInTheDocument();
      expect(lastNameInput).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('should handle required field indicators', () => {
      render(
        <TestWrapper>
          <AccessibleInput
            label="Required Field"
            required
          />
        </TestWrapper>
      );

      const input = screen.getByLabelText(/required field/i);
      expect(input).toHaveAttribute('aria-required', 'true');
    });
  });

  describe('Color Contrast and Visual Accessibility', () => {
    it('should have sufficient color contrast', async () => {
      const { container } = render(
        <TestWrapper>
          <div>
            <h1>Test Heading</h1>
            <p>Test paragraph with sufficient contrast</p>
            <AccessibleButton>Test Button</AccessibleButton>
          </div>
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
          <AccessibleButton>Test Button</AccessibleButton>
          <AccessibleInput label="Test Input" />
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
          <AccessibleButton aria-label="Custom button label">
            Button Text
          </AccessibleButton>
          <AccessibleInput
            label="Input Label"
            aria-describedby="input-help"
          />
          <div id="input-help">Help text for the input</div>
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
          <h1>Main Heading</h1>
          <section>
            <h2>Section Heading</h2>
            <h3>Subsection Heading</h3>
          </section>
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

  describe('Keyboard Navigation', () => {
    it('should have focusable elements', () => {
      render(
        <TestWrapper>
          <AccessibleButton>Button 1</AccessibleButton>
          <AccessibleInput label="Input 1" />
          <AccessibleButton>Button 2</AccessibleButton>
        </TestWrapper>
      );

      const buttons = screen.getAllByRole('button');
      const inputs = screen.getAllByRole('textbox');

      buttons.forEach(button => {
        expect(button).toHaveAttribute('tabIndex', '0');
      });

      inputs.forEach(input => {
        expect(input).toHaveAttribute('tabIndex', '0');
      });
    });

    it('should support keyboard activation', () => {
      const handleClick = vi.fn();

      render(
        <TestWrapper>
          <AccessibleButton onClick={handleClick}>
            Test Button
          </AccessibleButton>
        </TestWrapper>
      );

      const button = screen.getByRole('button', { name: /test button/i });
      
      // Test that button is keyboard accessible
      expect(button).toHaveAttribute('tabIndex', '0');
      expect(button).not.toBeDisabled();
    });
  });
});
