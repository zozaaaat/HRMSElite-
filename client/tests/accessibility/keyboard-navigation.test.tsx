import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test-utils/renderWithProviders';
import { AccessibilityProvider } from '../../src/components/shared/AccessibilityProvider';

// Import components to test
import Login from '../../src/pages/login';
import { AccessibleButton } from '../../src/components/ui/accessible-button';
import { AccessibleInput } from '../../src/components/ui/accessible-form';


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

describe('Keyboard Navigation Tests', () => {
  describe('Tab Navigation', () => {
    it('should have logical tab order in login form', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <AccessibilityProvider>
          <Login />
        </AccessibilityProvider>
      );

      const usernameInput = screen.getByLabelText(/username|اسم المستخدم/i);
      const passwordInput = screen.getByLabelText(/password|كلمة المرور/i);
      const submitButton = screen.getByRole('button', { name: /login|تسجيل الدخول/i });

      // Focus should start on username input
      usernameInput.focus();
      expect(document.activeElement).toBe(usernameInput);

      // Tab to password input
      await user.tab();
      expect(document.activeElement).toBe(passwordInput);

      // Tab to submit button
      await user.tab();
      expect(document.activeElement).toBe(submitButton);

      // Tab should cycle back to username input
      await user.tab();
      expect(document.activeElement).toBe(usernameInput);
    });

    it('should support Shift+Tab for reverse navigation', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <AccessibilityProvider>
          <Login />
        </AccessibilityProvider>
      );

      const usernameInput = screen.getByLabelText(/username|اسم المستخدم/i);
      const passwordInput = screen.getByLabelText(/password|كلمة المرور/i);
      const submitButton = screen.getByRole('button', { name: /login|تسجيل الدخول/i });

      // Start with submit button focused
      submitButton.focus();

      // Shift+Tab to password input
      await user.tab({ shift: true });
      expect(document.activeElement).toBe(passwordInput);

      // Shift+Tab to username input
      await user.tab({ shift: true });
      expect(document.activeElement).toBe(usernameInput);
    });
  });

  describe('Enter and Space Key Activation', () => {
    it('should activate buttons with Enter key', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      renderWithProviders(
        <AccessibilityProvider>
          <AccessibleButton onClick={handleClick}>
            Test Button
          </AccessibleButton>
        </AccessibilityProvider>
      );

      const button = screen.getByRole('button', { name: /test button/i });
      button.focus();

      // Press Enter to activate
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should activate buttons with Space key', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      renderWithProviders(
        <AccessibilityProvider>
          <AccessibleButton onClick={handleClick}>
            Test Button
          </AccessibleButton>
        </AccessibilityProvider>
      );

      const button = screen.getByRole('button', { name: /test button/i });
      button.focus();

      // Press Space to activate
      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not activate disabled buttons', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      renderWithProviders(
        <AccessibilityProvider>
          <AccessibleButton onClick={handleClick} disabled>
            Disabled Button
          </AccessibleButton>
        </AccessibilityProvider>
      );

      const button = screen.getByRole('button', { name: /disabled button/i });
      button.focus();

      // Try to activate with Enter
      await user.keyboard('{Enter}');
      expect(handleClick).not.toHaveBeenCalled();

      // Try to activate with Space
      await user.keyboard(' ');
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Arrow Key Navigation', () => {
    it('should navigate radio buttons with arrow keys', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      renderWithProviders(
        <AccessibilityProvider>
          <fieldset>
            <legend>Test Options</legend>
            <label>
              <input
                type="radio"
                name="test"
                value="option1"
                onChange={(e) => handleChange(e.target.value)}
              />
              Option 1
            </label>
            <label>
              <input
                type="radio"
                name="test"
                value="option2"
                onChange={(e) => handleChange(e.target.value)}
              />
              Option 2
            </label>
            <label>
              <input
                type="radio"
                name="test"
                value="option3"
                onChange={(e) => handleChange(e.target.value)}
              />
              Option 3
            </label>
          </fieldset>
        </AccessibilityProvider>
      );

      const radio1 = screen.getByLabelText('Option 1');
      const radio2 = screen.getByLabelText('Option 2');
      const radio3 = screen.getByLabelText('Option 3');

      // Focus first radio button
      radio1.focus();

      // Navigate with arrow keys
      await user.keyboard('{ArrowDown}');
      expect(document.activeElement).toBe(radio2);

      await user.keyboard('{ArrowDown}');
      expect(document.activeElement).toBe(radio3);

      // Wrap around to first option
      await user.keyboard('{ArrowDown}');
      expect(document.activeElement).toBe(radio1);

      // Navigate backwards
      await user.keyboard('{ArrowUp}');
      expect(document.activeElement).toBe(radio3);
    });
  });

  describe('Escape Key Handling', () => {
    it('should close modals with Escape key', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();

      renderWithProviders(
        <AccessibilityProvider>
          <div
            role="dialog"
            aria-modal="true"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                handleClose();
              }
            }}
          >
            <h2>Test Modal</h2>
            <p>Modal content</p>
            <button onClick={handleClose}>Close</button>
          </div>
        </AccessibilityProvider>
      );

      const modal = screen.getByRole('dialog');
      modal.focus();

      // Press Escape to close
      await user.keyboard('{Escape}');
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Skip Links', () => {
    it('should focus main content when skip link is activated', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <AccessibilityProvider>
          <div>
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>
            <main id="main-content" tabIndex={-1}>
              <h1>Main Content</h1>
              <p>This is the main content area.</p>
            </main>
          </div>
        </AccessibilityProvider>
      );

      const skipLink = screen.getByRole('link', { name: /skip to main content/i });
      const mainContent = screen.getByRole('main');

      // Focus skip link
      skipLink.focus();

      // Activate skip link
      await user.click(skipLink);

      // Main content should be focused
      expect(document.activeElement).toBe(mainContent);
    });
  });

  describe('Focus Management', () => {
    it('should restore focus when modal closes', async () => {
      const user = userEvent.setup();
      const [isOpen, setIsOpen] = React.useState(false);

      const TestComponent = () => {
        const [isModalOpen, setIsModalOpen] = React.useState(false);
        const triggerRef = React.useRef<HTMLButtonElement>(null);

        return (
          <div>
            <button
              ref={triggerRef}
              onClick={() => setIsModalOpen(true)}
            >
              Open Modal
            </button>
            {isModalOpen && (
              <div
                role="dialog"
                aria-modal="true"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsModalOpen(false);
                    triggerRef.current?.focus();
                  }
                }}
              >
                <h2>Modal</h2>
                <button onClick={() => setIsModalOpen(false)}>Close</button>
              </div>
            )}
          </div>
        );
      };

      renderWithProviders(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      const openButton = screen.getByRole('button', { name: /open modal/i });
      const closeButton = screen.getByRole('button', { name: /close/i });

      // Open modal
      await user.click(openButton);

      // Close modal with Escape
      await user.keyboard('{Escape}');

      // Focus should return to open button
      expect(document.activeElement).toBe(openButton);
    });

    it('should trap focus within modal', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <AccessibilityProvider>
          <div>
            <button>Before Modal</button>
            <div role="dialog" aria-modal="true">
              <h2>Modal</h2>
              <button>First Button</button>
              <button>Second Button</button>
              <button>Third Button</button>
            </div>
            <button>After Modal</button>
          </div>
        </AccessibilityProvider>
      );

      const firstButton = screen.getByRole('button', { name: /first button/i });
      const secondButton = screen.getByRole('button', { name: /second button/i });
      const thirdButton = screen.getByRole('button', { name: /third button/i });

      // Focus first button in modal
      firstButton.focus();

      // Tab through modal buttons
      await user.tab();
      expect(document.activeElement).toBe(secondButton);

      await user.tab();
      expect(document.activeElement).toBe(thirdButton);

      // Tab should wrap back to first button
      await user.tab();
      expect(document.activeElement).toBe(firstButton);

      // Shift+Tab should wrap to last button
      await user.tab({ shift: true });
      expect(document.activeElement).toBe(thirdButton);
    });
  });

  describe('Form Navigation', () => {
    it('should navigate form fields with proper labels', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <AccessibilityProvider>
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
            <AccessibleInput
              label="Email"
              type="email"
              name="email"
              required
            />
            <AccessibleButton type="submit">
              Submit
            </AccessibleButton>
          </form>
        </AccessibilityProvider>
      );

      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /submit/i });

      // Focus first input
      firstNameInput.focus();

      // Tab through form
      await user.tab();
      expect(document.activeElement).toBe(lastNameInput);

      await user.tab();
      expect(document.activeElement).toBe(emailInput);

      await user.tab();
      expect(document.activeElement).toBe(submitButton);
    });

    it('should announce form errors to screen readers', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <AccessibilityProvider>
          <AccessibleInput
            label="Email"
            type="email"
            error="Please enter a valid email address"
            required
          />
        </AccessibilityProvider>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const errorMessage = screen.getByText(/please enter a valid email address/i);

      // Check that error is associated with input
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      expect(emailInput).toHaveAttribute('aria-describedby');
      expect(errorMessage).toHaveAttribute('role', 'alert');
    });
  });
});
