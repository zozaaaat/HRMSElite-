import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Export providers for individual use
export { AllTheProviders };

// Mock data utilities
export const mockUser = {
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'admin',
  companyId: '1',
  isActive: true,
};

export const mockCompany = {
  id: '1',
  name: 'Test Company',
  industry: 'Technology',
  location: 'Test City',
};

export const mockEmployee = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  position: 'Developer',
  department: 'Engineering',
  salary: 75000,
  status: 'active',
};

// Mock functions
export const mockNavigate = vi.fn();
export const mockSetLocation = vi.fn();
export const mockToast = vi.fn();

// Mock hooks
export const mockUseLocation = () => ({
  pathname: '/test',
  search: '',
  hash: '',
  state: null,
  key: 'test-key',
});

export const mockUseNavigate = () => mockNavigate;

// Mock API responses
export const mockApiResponse = (data: any) => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {},
});

export const mockApiError = (message: string, status: number = 400) => ({
  message,
  status,
  response: {
    data: { message },
    status,
    statusText: 'Bad Request',
  },
});

// Test helpers
export const waitForLoadingToFinish = () =>
  new Promise(resolve => setTimeout(resolve, 0));

export const createMockFile = (name: string, type: string, size: number = 1024) =>
  new File(['test content'], name, { type });

export const createMockFormData = (data: Record<string, any>) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return formData;
};
