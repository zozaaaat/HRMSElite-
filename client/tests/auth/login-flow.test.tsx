import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils/renderWithProviders';
import { Router } from 'wouter';
import Login from '@/pages/login';
import { useAppStore } from '@/stores/useAppStore';

// Mock the stores
vi.mock('@/stores/useAppStore');
vi.mock('@/hooks/use-toast');

// Mock router
const mockNavigate = vi.fn();
vi.mock('wouter', () => ({
  useLocation: () => [null, mockNavigate],
  Router: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('Login Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset URL search params
    Object.defineProperty(window, 'location', {
      value: {
        search: '',
      },
      writable: true,
    });
  });

  describe('Login Form Rendering', () => {
    it('should render login form with all required fields', () => {
      renderWithProviders(
        <Router>
          <Login />
        </Router>
      );

      expect(screen.getByLabelText(/اسم المستخدم/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/كلمة المرور/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /تسجيل الدخول/i })).toBeInTheDocument();
    });

    it('should show loading state when form is submitted', async () => {
      renderWithProviders(
        <Router>
          <Login />
        </Router>
      );

      const usernameInput = screen.getByLabelText(/اسم المستخدم/i);
      const passwordInput = screen.getByLabelText(/كلمة المرور/i);
      const submitButton = screen.getByRole('button', { name: /تسجيل الدخول/i });

      fireEvent.change(usernameInput, { target: { value: 'admin' } });
      fireEvent.change(passwordInput, { target: { value: 'admin123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe('Authentication Scenarios', () => {
    it('should successfully login as super admin', async () => {
      const mockLogin = vi.fn();
      (useAppStore as any).mockReturnValue({
        login: mockLogin,
      });

      renderWithProviders(
        <Router>
          <Login />
        </Router>
      );

      const usernameInput = screen.getByLabelText(/اسم المستخدم/i);
      const passwordInput = screen.getByLabelText(/كلمة المرور/i);
      const submitButton = screen.getByRole('button', { name: /تسجيل الدخول/i });

      fireEvent.change(usernameInput, { target: { value: 'admin' } });
      fireEvent.change(passwordInput, { target: { value: 'admin123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          id: '1',
          username: 'admin',
          role: 'super_admin',
          firstName: 'المسؤول',
          lastName: 'النظام',
          companyId: undefined,
          companyName: undefined,
        });
      });
    });

    it('should successfully login as company manager', async () => {
      const mockLogin = vi.fn();
      (useAppStore as any).mockReturnValue({
        login: mockLogin,
      });

      // Set company parameters in URL
      Object.defineProperty(window, 'location', {
        value: {
          search: '?company=company-1&name=شركة النيل الأزرق',
        },
        writable: true,
      });

      renderWithProviders(
        <Router>
          <Login />
        </Router>
      );

      const usernameInput = screen.getByLabelText(/اسم المستخدم/i);
      const passwordInput = screen.getByLabelText(/كلمة المرور/i);
      const submitButton = screen.getByRole('button', { name: /تسجيل الدخول/i });

      fireEvent.change(usernameInput, { target: { value: 'gu_2_manager' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          id: '1',
          username: 'gu_2_manager',
          role: 'company_manager',
          firstName: 'المستخدم',
          lastName: 'النظام',
          companyId: 'company-1',
          companyName: 'شركة النيل الأزرق',
        });
      });
    });

    it('should handle login with empty credentials', async () => {
      renderWithProviders(
        <Router>
          <Login />
        </Router>
      );

      const submitButton = screen.getByRole('button', { name: /تسجيل الدخول/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/يرجى إدخال اسم المستخدم وكلمة المرور/i)).toBeInTheDocument();
      });
    });

    it('should handle login with invalid credentials', async () => {
      renderWithProviders(
        <Router>
          <Login />
        </Router>
      );

      const usernameInput = screen.getByLabelText(/اسم المستخدم/i);
      const passwordInput = screen.getByLabelText(/كلمة المرور/i);
      const submitButton = screen.getByRole('button', { name: /تسجيل الدخول/i });

      fireEvent.change(usernameInput, { target: { value: 'invalid_user' } });
      fireEvent.change(passwordInput, { target: { value: 'wrong_password' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/اسم المستخدم أو كلمة المرور غير صحيحة/i)).toBeInTheDocument();
      });
    });
  });

  describe('Role-based Login', () => {
    it.each([
      ['admin', 'super_admin'],
      ['gu_2_manager', 'company_manager'],
      ['gu_4_employee', 'employee'],
      ['supervisor', 'supervisor'],
      ['worker', 'worker'],
    ])('should assign correct role for username %s', async (username, expectedRole) => {
      const mockLogin = vi.fn();
      (useAppStore as any).mockReturnValue({
        login: mockLogin,
      });

      renderWithProviders(
        <Router>
          <Login />
        </Router>
      );

      const usernameInput = screen.getByLabelText(/اسم المستخدم/i);
      const passwordInput = screen.getByLabelText(/كلمة المرور/i);
      const submitButton = screen.getByRole('button', { name: /تسجيل الدخول/i });

      fireEvent.change(usernameInput, { target: { value: username } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith(
          expect.objectContaining({
            role: expectedRole,
          })
        );
      });
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields', async () => {
      renderWithProviders(
        <Router>
          <Login />
        </Router>
      );

      const submitButton = screen.getByRole('button', { name: /تسجيل الدخول/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/يرجى إدخال اسم المستخدم/i)).toBeInTheDocument();
        expect(screen.getByText(/يرجى إدخال كلمة المرور/i)).toBeInTheDocument();
      });
    });

    it('should clear error messages when user starts typing', async () => {
      renderWithProviders(
        <Router>
          <Login />
        </Router>
      );

      const usernameInput = screen.getByLabelText(/اسم المستخدم/i);
      const submitButton = screen.getByRole('button', { name: /تسجيل الدخول/i });

      // Trigger validation error
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText(/يرجى إدخال اسم المستخدم/i)).toBeInTheDocument();
      });

      // Start typing to clear error
      fireEvent.change(usernameInput, { target: { value: 'test' } });
      await waitFor(() => {
        expect(screen.queryByText(/يرجى إدخال اسم المستخدم/i)).not.toBeInTheDocument();
      });
    });
  });
}); 