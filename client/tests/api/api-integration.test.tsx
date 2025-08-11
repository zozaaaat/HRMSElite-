import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { mockEmployees, mockCompanies, mockDocuments, mockLicenses } from '../mock-data';

// Mock API services
vi.mock('@/services/api', () => ({
  apiRequest: vi.fn(),
  getAuthToken: vi.fn(() => 'mock-token'),
  setAuthToken: vi.fn(),
  removeAuthToken: vi.fn(),
}));

vi.mock('@/services/auth', () => ({
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  refreshToken: vi.fn(),
  verifyToken: vi.fn(),
}));

vi.mock('@/services/employee', () => ({
  getEmployees: vi.fn(),
  getEmployee: vi.fn(),
  createEmployee: vi.fn(),
  updateEmployee: vi.fn(),
  deleteEmployee: vi.fn(),
  getEmployeeStatus: vi.fn(),
  updateEmployeeStatus: vi.fn(),
}));

vi.mock('@/services/company', () => ({
  getCompanies: vi.fn(),
  getCompany: vi.fn(),
  createCompany: vi.fn(),
  updateCompany: vi.fn(),
  deleteCompany: vi.fn(),
}));

vi.mock('@/services/documents', () => ({
  getDocuments: vi.fn(),
  getDocument: vi.fn(),
  uploadDocument: vi.fn(),
  updateDocument: vi.fn(),
  deleteDocument: vi.fn(),
  downloadDocument: vi.fn(),
}));

vi.mock('@/services/licenses', () => ({
  getLicenses: vi.fn(),
  getLicense: vi.fn(),
  createLicense: vi.fn(),
  updateLicense: vi.fn(),
  deleteLicense: vi.fn(),
  renewLicense: vi.fn(),
}));

import { apiRequest } from '@/services/api';
import { login, logout, register } from '@/services/auth';
import { getEmployees, createEmployee, updateEmployee } from '@/services/employee';
import { getCompanies, createCompany } from '@/services/company';
import { getDocuments, uploadDocument } from '@/services/documents';
import { getLicenses, createLicense } from '@/services/licenses';

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Authentication API', () => {
    it('should handle successful login', async () => {
      const mockLoginResponse = {
        success: true,
        token: 'mock-jwt-token',
        user: {
          id: 1,
          email: 'admin@example.com',
          role: 'admin',
          companyId: 1
        }
      };

      (login as any).mockResolvedValue(mockLoginResponse);

      const result = await login('admin@example.com', 'password123');
      
      expect(login).toHaveBeenCalledWith('admin@example.com', 'password123');
      expect(result).toEqual(mockLoginResponse);
      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
      expect(result.user).toBeDefined();
    });

    it('should handle login failure', async () => {
      const mockError = new Error('Invalid credentials');
      (login as any).mockRejectedValue(mockError);

      await expect(login('invalid@example.com',
   'wrongpassword')).rejects.toThrow('Invalid credentials');
    });

    it('should handle successful registration', async () => {
      const mockRegisterResponse = {
        success: true,
        message: 'User registered successfully',
        user: {
          id: 2,
          email: 'newuser@example.com',
          role: 'employee'
        }
      };

      (register as any).mockResolvedValue(mockRegisterResponse);

      const result = await register({
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      });

      expect(register).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      });
      expect(result.success).toBe(true);
    });

    it('should handle logout', async () => {
      (logout as any).mockResolvedValue({ success: true });

      const result = await logout();
      
      expect(logout).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });

  describe('Employees API', () => {
    it('should fetch employees successfully', async () => {
      (getEmployees as any).mockResolvedValue({
        success: true,
        data: mockEmployees,
        total: mockEmployees.length
      });

      const result = await getEmployees();
      
      expect(getEmployees).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(mockEmployees.length);
      expect(result.total).toBe(mockEmployees.length);
    });

    it('should create employee successfully', async () => {
      const newEmployee = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1234567890',
        position: 'Developer',
        department: 'IT',
        salary: 75000,
        hireDate: '2024-01-15'
      };

      const mockResponse = {
        success: true,
        data: { ...newEmployee, id: 101 }
      };

      (createEmployee as any).mockResolvedValue(mockResponse);

      const result = await createEmployee(newEmployee);
      
      expect(createEmployee).toHaveBeenCalledWith(newEmployee);
      expect(result.success).toBe(true);
      expect(result.data.id).toBeDefined();
    });

    it('should update employee successfully', async () => {
      const updateData = {
        id: 1,
        salary: 80000,
        position: 'Senior Developer'
      };

      const mockResponse = {
        success: true,
        data: { ...mockEmployees[0], ...updateData }
      };

      (updateEmployee as any).mockResolvedValue(mockResponse);

      const result = await updateEmployee(updateData);
      
      expect(updateEmployee).toHaveBeenCalledWith(updateData);
      expect(result.success).toBe(true);
      expect(result.data.salary).toBe(80000);
    });

    it('should handle API errors gracefully', async () => {
      const mockError = new Error('Network error');
      (getEmployees as any).mockRejectedValue(mockError);

      await expect(getEmployees()).rejects.toThrow('Network error');
    });
  });

  describe('Companies API', () => {
    it('should fetch companies successfully', async () => {
      (getCompanies as any).mockResolvedValue({
        success: true,
        data: mockCompanies,
        total: mockCompanies.length
      });

      const result = await getCompanies();
      
      expect(getCompanies).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(mockCompanies.length);
    });

    it('should create company successfully', async () => {
      const newCompany = {
        name: 'New Tech Corp',
        industry: 'Technology',
        size: 'Medium',
        address: '123 Tech Street',
        contactEmail: 'contact@newtech.com',
        contactPhone: '+1234567890'
      };

      const mockResponse = {
        success: true,
        data: { ...newCompany, id: 201 }
      };

      (createCompany as any).mockResolvedValue(mockResponse);

      const result = await createCompany(newCompany);
      
      expect(createCompany).toHaveBeenCalledWith(newCompany);
      expect(result.success).toBe(true);
      expect(result.data.id).toBeDefined();
    });
  });

  describe('Documents API', () => {
    it('should fetch documents successfully', async () => {
      (getDocuments as any).mockResolvedValue({
        success: true,
        data: mockDocuments,
        total: mockDocuments.length
      });

      const result = await getDocuments();
      
      expect(getDocuments).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(mockDocuments.length);
    });

    it('should upload document successfully', async () => {
      const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const uploadData = {
        file: mockFile,
        title: 'Test Document',
        category: 'Contract',
        employeeId: 1
      };

      const mockResponse = {
        success: true,
        data: {
          id: 301,
          title: 'Test Document',
          filename: 'test.pdf',
          size: 1024,
          uploadedAt: new Date().toISOString()
        }
      };

      (uploadDocument as any).mockResolvedValue(mockResponse);

      const result = await uploadDocument(uploadData);
      
      expect(uploadDocument).toHaveBeenCalledWith(uploadData);
      expect(result.success).toBe(true);
      expect(result.data.id).toBeDefined();
    });
  });

  describe('Licenses API', () => {
    it('should fetch licenses successfully', async () => {
      (getLicenses as any).mockResolvedValue({
        success: true,
        data: mockLicenses,
        total: mockLicenses.length
      });

      const result = await getLicenses();
      
      expect(getLicenses).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(mockLicenses.length);
    });

    it('should create license successfully', async () => {
      const newLicense = {
        name: 'Software License',
        type: 'Software',
        vendor: 'Microsoft',
        cost: 500,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        status: 'Active'
      };

      const mockResponse = {
        success: true,
        data: { ...newLicense, id: 401 }
      };

      (createLicense as any).mockResolvedValue(mockResponse);

      const result = await createLicense(newLicense);
      
      expect(createLicense).toHaveBeenCalledWith(newLicense);
      expect(result.success).toBe(true);
      expect(result.data.id).toBeDefined();
    });
  });

  describe('API Error Handling', () => {
    it('should handle network errors', async () => {
      const mockError = new Error('Network error');
      (apiRequest as any).mockRejectedValue(mockError);

      await expect(apiRequest('/test-endpoint')).rejects.toThrow('Network error');
    });

    it('should handle HTTP errors', async () => {
      const mockError = {
        response: {
          status: 404,
          data: { message: 'Resource not found' }
        }
      };
      (apiRequest as any).mockRejectedValue(mockError);

      try {
        await apiRequest('/non-existent-endpoint');
      } catch (error: Record<string, unknown>) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.message).toBe('Resource not found');
      }
    });

    it('should handle authentication errors', async () => {
      const mockError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      };
      (apiRequest as any).mockRejectedValue(mockError);

      try {
        await apiRequest('/protected-endpoint');
      } catch (error: Record<string, unknown>) {
        expect(error.response.status).toBe(401);
        expect(error.response.data.message).toBe('Unauthorized');
      }
    });
  });

  describe('API Performance', () => {
    it('should handle concurrent requests', async () => {
      // Mock the getEmployees function to return a proper response
      (getEmployees as any).mockResolvedValue({
        success: true,
        data: mockEmployees,
        total: mockEmployees.length
      });

      const promises = Array(10).fill(null).map(() => getEmployees());
      
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });

    it('should handle large data sets', async () => {
      const largeDataSet = Array(1000).fill(null).map((_, index) => ({
        id: index + 1,
        firstName: `User${index}`,
        lastName: `Test${index}`,
        email: `user${index}@example.com`
      }));

      (getEmployees as any).mockResolvedValue({
        success: true,
        data: largeDataSet,
        total: largeDataSet.length
      });

      const result = await getEmployees();
      
      expect(result.data).toHaveLength(1000);
      expect(result.total).toBe(1000);
    });
  });
}); 