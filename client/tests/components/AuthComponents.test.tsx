import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils/renderWithProviders';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuth } from '../../src/hooks/useAuth';

// Mock useAuth hook
vi.mock('../../src/hooks/useAuth');

// Mock components
const MockLoginForm = () => {
  const { login, loading, error } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    await login({
      username: formData.get('username') as string,
      password: formData.get('password') as string
    });
  };

  return (
    <form onSubmit={handleSubmit} data-testid="login-form">
      <input name="username" data-testid="username-input" />
      <input name="password" type="password" data-testid="password-input" />
      <button type="submit" disabled={loading} data-testid="login-button">
        {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
      </button>
      {error && <div data-testid="error-message">{error}</div>}
    </form>
  );
};

const MockUserProfile = () => {
  const { user, updateProfile, loading } = useAuth();
  
  const handleUpdate = async () => {
    await updateProfile({ firstName: 'Updated' });
  };

  if (!user) return <div data-testid="no-user">لا يوجد مستخدم</div>;

  return (
    <div data-testid="user-profile">
      <h2>{user.firstName} {user.lastName}</h2>
      <p>{user.email}</p>
      <button onClick={handleUpdate} disabled={loading} data-testid="update-button">
        تحديث الملف الشخصي
      </button>
    </div>
  );
};

const MockPermissionGuard = ({ permission, children }: { permission: string; children: React.ReactNode }) => {
  const { hasPermission } = useAuth();
  
  if (!hasPermission(permission)) {
    return <div data-testid="access-denied">غير مصرح بالوصول</div>;
  }
  
  return <div data-testid="permission-granted">{children}</div>;
};


describe('Auth Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('LoginForm', () => {
    it('should render login form correctly', () => {
      const mockUseAuth = vi.mocked(useAuth);
      mockUseAuth.mockReturnValue({
        login: vi.fn(),
        loading: false,
        error: null,
        user: null,
        currentCompany: null,
        permissions: [],
        isAuthenticated: false,
        logout: vi.fn(),
        getCurrentUser: vi.fn(),
        switchCompany: vi.fn(),
        updateProfile: vi.fn(),
        checkAuth: vi.fn(),
        initializeAuth: vi.fn(),
        getPermissions: vi.fn(),
        hasPermission: vi.fn(),
        hasAnyPermission: vi.fn(),
        hasAllPermissions: vi.fn(),
        isSuperAdmin: vi.fn(),
        isCompanyManager: vi.fn(),
        getUserFullName: vi.fn(),
        canAccessCompany: vi.fn(),
        getUserRoleForCompany: vi.fn(),
        setUser: vi.fn(),
        updateUser: vi.fn(),
        setCurrentCompany: vi.fn(),
        setPermissions: vi.fn(),
        setLoading: vi.fn(),
        setError: vi.fn(),
        clearUser: vi.fn(),
        initializeFromSession: vi.fn()
      });

      renderWithProviders(<MockLoginForm />);

      expect(screen.getByTestId('login-form')).toBeInTheDocument();
      expect(screen.getByTestId('username-input')).toBeInTheDocument();
      expect(screen.getByTestId('password-input')).toBeInTheDocument();
      expect(screen.getByTestId('login-button')).toBeInTheDocument();
      expect(screen.getByText('تسجيل الدخول')).toBeInTheDocument();
    });

    it('should handle form submission', async () => {
      const mockLogin = vi.fn();
      const mockUseAuth = vi.mocked(useAuth);
      mockUseAuth.mockReturnValue({
        login: mockLogin,
        loading: false,
        error: null,
        user: null,
        currentCompany: null,
        permissions: [],
        isAuthenticated: false,
        logout: vi.fn(),
        getCurrentUser: vi.fn(),
        switchCompany: vi.fn(),
        updateProfile: vi.fn(),
        checkAuth: vi.fn(),
        initializeAuth: vi.fn(),
        getPermissions: vi.fn(),
        hasPermission: vi.fn(),
        hasAnyPermission: vi.fn(),
        hasAllPermissions: vi.fn(),
        isSuperAdmin: vi.fn(),
        isCompanyManager: vi.fn(),
        getUserFullName: vi.fn(),
        canAccessCompany: vi.fn(),
        getUserRoleForCompany: vi.fn(),
        setUser: vi.fn(),
        updateUser: vi.fn(),
        setCurrentCompany: vi.fn(),
        setPermissions: vi.fn(),
        setLoading: vi.fn(),
        setError: vi.fn(),
        clearUser: vi.fn(),
        initializeFromSession: vi.fn()
      });

      renderWithProviders(<MockLoginForm />);

      const usernameInput = screen.getByTestId('username-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('login-button');

      fireEvent.change(usernameInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          username: 'test@example.com',
          password: 'password123'
        });
      });
    });

    it('should show loading state', () => {
      const mockUseAuth = vi.mocked(useAuth);
      mockUseAuth.mockReturnValue({
        login: vi.fn(),
        loading: true,
        error: null,
        user: null,
        currentCompany: null,
        permissions: [],
        isAuthenticated: false,
        logout: vi.fn(),
        getCurrentUser: vi.fn(),
        switchCompany: vi.fn(),
        updateProfile: vi.fn(),
        checkAuth: vi.fn(),
        initializeAuth: vi.fn(),
        getPermissions: vi.fn(),
        hasPermission: vi.fn(),
        hasAnyPermission: vi.fn(),
        hasAllPermissions: vi.fn(),
        isSuperAdmin: vi.fn(),
        isCompanyManager: vi.fn(),
        getUserFullName: vi.fn(),
        canAccessCompany: vi.fn(),
        getUserRoleForCompany: vi.fn(),
        setUser: vi.fn(),
        updateUser: vi.fn(),
        setCurrentCompany: vi.fn(),
        setPermissions: vi.fn(),
        setLoading: vi.fn(),
        setError: vi.fn(),
        clearUser: vi.fn(),
        initializeFromSession: vi.fn()
      });

      renderWithProviders(<MockLoginForm />);

      expect(screen.getByText('جاري تسجيل الدخول...')).toBeInTheDocument();
      expect(screen.getByTestId('login-button')).toBeDisabled();
    });

    it('should display error message', () => {
      const mockUseAuth = vi.mocked(useAuth);
      mockUseAuth.mockReturnValue({
        login: vi.fn(),
        loading: false,
        error: 'خطأ في تسجيل الدخول',
        user: null,
        currentCompany: null,
        permissions: [],
        isAuthenticated: false,
        logout: vi.fn(),
        getCurrentUser: vi.fn(),
        switchCompany: vi.fn(),
        updateProfile: vi.fn(),
        checkAuth: vi.fn(),
        initializeAuth: vi.fn(),
        getPermissions: vi.fn(),
        hasPermission: vi.fn(),
        hasAnyPermission: vi.fn(),
        hasAllPermissions: vi.fn(),
        isSuperAdmin: vi.fn(),
        isCompanyManager: vi.fn(),
        getUserFullName: vi.fn(),
        canAccessCompany: vi.fn(),
        getUserRoleForCompany: vi.fn(),
        setUser: vi.fn(),
        updateUser: vi.fn(),
        setCurrentCompany: vi.fn(),
        setPermissions: vi.fn(),
        setLoading: vi.fn(),
        setError: vi.fn(),
        clearUser: vi.fn(),
        initializeFromSession: vi.fn()
      });

      renderWithProviders(<MockLoginForm />);

      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByText('خطأ في تسجيل الدخول')).toBeInTheDocument();
    });
  });

  describe('UserProfile', () => {
    it('should render user profile when user exists', () => {
      const mockUser = {
        id: '1',
        sub: '1',
        email: 'test@example.com',
        firstName: 'محمد',
        lastName: 'أحمد',
        role: 'user',
        permissions: ['read'],
        isActive: true,
        claims: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockUseAuth = vi.mocked(useAuth);
      mockUseAuth.mockReturnValue({
        login: vi.fn(),
        loading: false,
        error: null,
        user: mockUser,
        currentCompany: null,
        permissions: [],
        isAuthenticated: true,
        logout: vi.fn(),
        getCurrentUser: vi.fn(),
        switchCompany: vi.fn(),
        updateProfile: vi.fn(),
        checkAuth: vi.fn(),
        initializeAuth: vi.fn(),
        getPermissions: vi.fn(),
        hasPermission: vi.fn(),
        hasAnyPermission: vi.fn(),
        hasAllPermissions: vi.fn(),
        isSuperAdmin: vi.fn(),
        isCompanyManager: vi.fn(),
        getUserFullName: vi.fn(),
        canAccessCompany: vi.fn(),
        getUserRoleForCompany: vi.fn(),
        setUser: vi.fn(),
        updateUser: vi.fn(),
        setCurrentCompany: vi.fn(),
        setPermissions: vi.fn(),
        setLoading: vi.fn(),
        setError: vi.fn(),
        clearUser: vi.fn(),
        initializeFromSession: vi.fn()
      });

      renderWithProviders(<MockUserProfile />);

      expect(screen.getByTestId('user-profile')).toBeInTheDocument();
      expect(screen.getByText('محمد أحمد')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByTestId('update-button')).toBeInTheDocument();
    });

    it('should show no user message when user is null', () => {
      const mockUseAuth = vi.mocked(useAuth);
      mockUseAuth.mockReturnValue({
        login: vi.fn(),
        loading: false,
        error: null,
        user: null,
        currentCompany: null,
        permissions: [],
        isAuthenticated: false,
        logout: vi.fn(),
        getCurrentUser: vi.fn(),
        switchCompany: vi.fn(),
        updateProfile: vi.fn(),
        checkAuth: vi.fn(),
        initializeAuth: vi.fn(),
        getPermissions: vi.fn(),
        hasPermission: vi.fn(),
        hasAnyPermission: vi.fn(),
        hasAllPermissions: vi.fn(),
        isSuperAdmin: vi.fn(),
        isCompanyManager: vi.fn(),
        getUserFullName: vi.fn(),
        canAccessCompany: vi.fn(),
        getUserRoleForCompany: vi.fn(),
        setUser: vi.fn(),
        updateUser: vi.fn(),
        setCurrentCompany: vi.fn(),
        setPermissions: vi.fn(),
        setLoading: vi.fn(),
        setError: vi.fn(),
        clearUser: vi.fn(),
        initializeFromSession: vi.fn()
      });

      renderWithProviders(<MockUserProfile />);

      expect(screen.getByTestId('no-user')).toBeInTheDocument();
      expect(screen.getByText('لا يوجد مستخدم')).toBeInTheDocument();
    });

    it('should handle profile update', async () => {
      const mockUpdateProfile = vi.fn();
      const mockUser = {
        id: '1',
        sub: '1',
        email: 'test@example.com',
        firstName: 'محمد',
        lastName: 'أحمد',
        role: 'user',
        permissions: ['read'],
        isActive: true,
        claims: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockUseAuth = vi.mocked(useAuth);
      mockUseAuth.mockReturnValue({
        login: vi.fn(),
        loading: false,
        error: null,
        user: mockUser,
        currentCompany: null,
        permissions: [],
        isAuthenticated: true,
        logout: vi.fn(),
        getCurrentUser: vi.fn(),
        switchCompany: vi.fn(),
        updateProfile: mockUpdateProfile,
        checkAuth: vi.fn(),
        initializeAuth: vi.fn(),
        getPermissions: vi.fn(),
        hasPermission: vi.fn(),
        hasAnyPermission: vi.fn(),
        hasAllPermissions: vi.fn(),
        isSuperAdmin: vi.fn(),
        isCompanyManager: vi.fn(),
        getUserFullName: vi.fn(),
        canAccessCompany: vi.fn(),
        getUserRoleForCompany: vi.fn(),
        setUser: vi.fn(),
        updateUser: vi.fn(),
        setCurrentCompany: vi.fn(),
        setPermissions: vi.fn(),
        setLoading: vi.fn(),
        setError: vi.fn(),
        clearUser: vi.fn(),
        initializeFromSession: vi.fn()
      });

      renderWithProviders(<MockUserProfile />);

      const updateButton = screen.getByTestId('update-button');
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledWith({ firstName: 'Updated' });
      });
    });
  });

  describe('PermissionGuard', () => {
    it('should render children when user has permission', () => {
      const mockHasPermission = vi.fn().mockReturnValue(true);
      const mockUseAuth = vi.mocked(useAuth);
      mockUseAuth.mockReturnValue({
        login: vi.fn(),
        loading: false,
        error: null,
        user: null,
        currentCompany: null,
        permissions: [],
        isAuthenticated: false,
        logout: vi.fn(),
        getCurrentUser: vi.fn(),
        switchCompany: vi.fn(),
        updateProfile: vi.fn(),
        checkAuth: vi.fn(),
        initializeAuth: vi.fn(),
        getPermissions: vi.fn(),
        hasPermission: mockHasPermission,
        hasAnyPermission: vi.fn(),
        hasAllPermissions: vi.fn(),
        isSuperAdmin: vi.fn(),
        isCompanyManager: vi.fn(),
        getUserFullName: vi.fn(),
        canAccessCompany: vi.fn(),
        getUserRoleForCompany: vi.fn(),
        setUser: vi.fn(),
        updateUser: vi.fn(),
        setCurrentCompany: vi.fn(),
        setPermissions: vi.fn(),
        setLoading: vi.fn(),
        setError: vi.fn(),
        clearUser: vi.fn(),
        initializeFromSession: vi.fn()
      });

      renderWithProviders(
        <MockPermissionGuard permission="read">
          <div data-testid="protected-content">محتوى محمي</div>
        </MockPermissionGuard>
      );

      expect(screen.getByTestId('permission-granted')).toBeInTheDocument();
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(mockHasPermission).toHaveBeenCalledWith('read');
    });

    it('should show access denied when user lacks permission', () => {
      const mockHasPermission = vi.fn().mockReturnValue(false);
      const mockUseAuth = vi.mocked(useAuth);
      mockUseAuth.mockReturnValue({
        login: vi.fn(),
        loading: false,
        error: null,
        user: null,
        currentCompany: null,
        permissions: [],
        isAuthenticated: false,
        logout: vi.fn(),
        getCurrentUser: vi.fn(),
        switchCompany: vi.fn(),
        updateProfile: vi.fn(),
        checkAuth: vi.fn(),
        initializeAuth: vi.fn(),
        getPermissions: vi.fn(),
        hasPermission: mockHasPermission,
        hasAnyPermission: vi.fn(),
        hasAllPermissions: vi.fn(),
        isSuperAdmin: vi.fn(),
        isCompanyManager: vi.fn(),
        getUserFullName: vi.fn(),
        canAccessCompany: vi.fn(),
        getUserRoleForCompany: vi.fn(),
        setUser: vi.fn(),
        updateUser: vi.fn(),
        setCurrentCompany: vi.fn(),
        setPermissions: vi.fn(),
        setLoading: vi.fn(),
        setError: vi.fn(),
        clearUser: vi.fn(),
        initializeFromSession: vi.fn()
      });

      renderWithProviders(
        <MockPermissionGuard permission="admin">
          <div data-testid="protected-content">محتوى محمي</div>
        </MockPermissionGuard>
      );

      expect(screen.getByTestId('access-denied')).toBeInTheDocument();
      expect(screen.getByText('غير مصرح بالوصول')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(mockHasPermission).toHaveBeenCalledWith('admin');
    });
  });

  describe('Authentication State', () => {
    it('should handle authenticated state correctly', () => {
      const mockUser = {
        id: '1',
        sub: '1',
        email: 'test@example.com',
        firstName: 'محمد',
        lastName: 'أحمد',
        role: 'user',
        permissions: ['read'],
        isActive: true,
        claims: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockUseAuth = vi.mocked(useAuth);
      mockUseAuth.mockReturnValue({
        login: vi.fn(),
        loading: false,
        error: null,
        user: mockUser,
        currentCompany: { id: 'company-1', name: 'شركة تجريبية' },
        permissions: ['read', 'write'],
        isAuthenticated: true,
        logout: vi.fn(),
        getCurrentUser: vi.fn(),
        switchCompany: vi.fn(),
        updateProfile: vi.fn(),
        checkAuth: vi.fn(),
        initializeAuth: vi.fn(),
        getPermissions: vi.fn(),
        hasPermission: vi.fn(),
        hasAnyPermission: vi.fn(),
        hasAllPermissions: vi.fn(),
        isSuperAdmin: vi.fn(),
        isCompanyManager: vi.fn(),
        getUserFullName: vi.fn(),
        canAccessCompany: vi.fn(),
        getUserRoleForCompany: vi.fn(),
        setUser: vi.fn(),
        updateUser: vi.fn(),
        setCurrentCompany: vi.fn(),
        setPermissions: vi.fn(),
        setLoading: vi.fn(),
        setError: vi.fn(),
        clearUser: vi.fn(),
        initializeFromSession: vi.fn()
      });

      renderWithProviders(<MockUserProfile />);

      expect(screen.getByTestId('user-profile')).toBeInTheDocument();
      expect(screen.getByText('محمد أحمد')).toBeInTheDocument();
    });

    it('should handle unauthenticated state correctly', () => {
      const mockUseAuth = vi.mocked(useAuth);
      mockUseAuth.mockReturnValue({
        login: vi.fn(),
        loading: false,
        error: null,
        user: null,
        currentCompany: null,
        permissions: [],
        isAuthenticated: false,
        logout: vi.fn(),
        getCurrentUser: vi.fn(),
        switchCompany: vi.fn(),
        updateProfile: vi.fn(),
        checkAuth: vi.fn(),
        initializeAuth: vi.fn(),
        getPermissions: vi.fn(),
        hasPermission: vi.fn(),
        hasAnyPermission: vi.fn(),
        hasAllPermissions: vi.fn(),
        isSuperAdmin: vi.fn(),
        isCompanyManager: vi.fn(),
        getUserFullName: vi.fn(),
        canAccessCompany: vi.fn(),
        getUserRoleForCompany: vi.fn(),
        setUser: vi.fn(),
        updateUser: vi.fn(),
        setCurrentCompany: vi.fn(),
        setPermissions: vi.fn(),
        setLoading: vi.fn(),
        setError: vi.fn(),
        clearUser: vi.fn(),
        initializeFromSession: vi.fn()
      });

      renderWithProviders(<MockUserProfile />);

      expect(screen.getByTestId('no-user')).toBeInTheDocument();
    });
  });
});
