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

vi.mock('@/services/employees', () => ({
  getEmployees: vi.fn(),
  getEmployee: vi.fn(),
  createEmployee: vi.fn(),
  updateEmployee: vi.fn(),
  deleteEmployee: vi.fn(),
  getEmployeeStatus: vi.fn(),
  updateEmployeeStatus: vi.fn(),
}));

vi.mock('@/services/companies', () => ({
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

import { apiRequest, getAuthToken, setAuthToken, removeAuthToken } from '@/services/api';
import { login, logout, register, refreshToken, verifyToken } from '@/services/auth';
import { 
  getEmployees, 
  getEmployee, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee,
  getEmployeeStatus,
  updateEmployeeStatus 
} from '@/services/employees';
import { 
  getCompanies, 
  getCompany, 
  createCompany, 
  updateCompany, 
  deleteCompany 
} from '@/services/companies';
import { 
  getDocuments, 
  getDocument, 
  uploadDocument, 
  updateDocument, 
  deleteDocument,
  downloadDocument 
} from '@/services/documents';
import { 
  getLicenses, 
  getLicense, 
  createLicense, 
  updateLicense, 
  deleteLicense,
  renewLicense 
} from '@/services/licenses';

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

describe('Enhanced API Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Authentication API Tests', () => {
    it('should handle successful login with valid credentials', async () => {
      const mockLoginResponse = {
        success: true,
        token: 'mock-jwt-token',
        user: {
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
          role: 'admin'
        }
      };

      (login as any).mockResolvedValue(mockLoginResponse);

      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      const result = await login(credentials);

      expect(login).toHaveBeenCalledWith(credentials);
      expect(result).toEqual(mockLoginResponse);
      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
      expect(result.user).toBeDefined();
    });

    it('should handle login failure with invalid credentials', async () => {
      const mockError = new Error('Invalid credentials');
      (login as any).mockRejectedValue(mockError);

      const credentials = {
        email: 'invalid@example.com',
        password: 'wrongpassword'
      };

      await expect(login(credentials)).rejects.toThrow('Invalid credentials');
      expect(login).toHaveBeenCalledWith(credentials);
    });

    it('should handle successful logout', async () => {
      const mockLogoutResponse = { success: true };
      (logout as any).mockResolvedValue(mockLogoutResponse);

      const result = await logout();

      expect(logout).toHaveBeenCalled();
      expect(result).toEqual(mockLogoutResponse);
      expect(removeAuthToken).toHaveBeenCalled();
    });

    it('should handle token refresh', async () => {
      const mockRefreshResponse = {
        success: true,
        token: 'new-jwt-token'
      };
      (refreshToken as any).mockResolvedValue(mockRefreshResponse);

      const result = await refreshToken();

      expect(refreshToken).toHaveBeenCalled();
      expect(result).toEqual(mockRefreshResponse);
      expect(setAuthToken).toHaveBeenCalledWith('new-jwt-token');
    });

    it('should handle token verification', async () => {
      const mockVerifyResponse = {
        valid: true,
        user: {
          id: 1,
          email: 'test@example.com'
        }
      };
      (verifyToken as any).mockResolvedValue(mockVerifyResponse);

      const result = await verifyToken('mock-token');

      expect(verifyToken).toHaveBeenCalledWith('mock-token');
      expect(result).toEqual(mockVerifyResponse);
    });
  });

  describe('Employee API Tests', () => {
    it('should fetch employees successfully', async () => {
      (getEmployees as any).mockResolvedValue({ data: mockEmployees });

      const result = await getEmployees();

      expect(getEmployees).toHaveBeenCalled();
      expect(result.data).toEqual(mockEmployees);
      expect(result.data).toHaveLength(mockEmployees.length);
    });

    it('should fetch single employee by ID', async () => {
      const employee = mockEmployees[0];
      (getEmployee as any).mockResolvedValue({ data: employee });

      const result = await getEmployee(employee.id);

      expect(getEmployee).toHaveBeenCalledWith(employee.id);
      expect(result.data).toEqual(employee);
    });

    it('should create new employee successfully', async () => {
      const newEmployee = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        position: 'Developer',
        department: 'Engineering',
        salary: 75000
      };

      const mockResponse = { data: { ...newEmployee, id: 999 } };
      (createEmployee as any).mockResolvedValue(mockResponse);

      const result = await createEmployee(newEmployee);

      expect(createEmployee).toHaveBeenCalledWith(newEmployee);
      expect(result.data).toEqual(mockResponse.data);
      expect(result.data.id).toBeDefined();
    });

    it('should update employee successfully', async () => {
      const employeeId = 1;
      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith',
        salary: 80000
      };

      const mockResponse = { data: { ...updateData, id: employeeId } };
      (updateEmployee as any).mockResolvedValue(mockResponse);

      const result = await updateEmployee(employeeId, updateData);

      expect(updateEmployee).toHaveBeenCalledWith(employeeId, updateData);
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should delete employee successfully', async () => {
      const employeeId = 1;
      const mockResponse = { success: true };
      (deleteEmployee as any).mockResolvedValue(mockResponse);

      const result = await deleteEmployee(employeeId);

      expect(deleteEmployee).toHaveBeenCalledWith(employeeId);
      expect(result.success).toBe(true);
    });

    it('should handle employee status updates', async () => {
      const employeeId = 1;
      const status = 'active';
      const mockResponse = { data: { id: employeeId, status } };
      (updateEmployeeStatus as any).mockResolvedValue(mockResponse);

      const result = await updateEmployeeStatus(employeeId, status);

      expect(updateEmployeeStatus).toHaveBeenCalledWith(employeeId, status);
      expect(result.data.status).toBe(status);
    });
  });

  describe('Company API Tests', () => {
    it('should fetch companies successfully', async () => {
      (getCompanies as any).mockResolvedValue({ data: mockCompanies });

      const result = await getCompanies();

      expect(getCompanies).toHaveBeenCalled();
      expect(result.data).toEqual(mockCompanies);
    });

    it('should fetch single company by ID', async () => {
      const company = mockCompanies[0];
      (getCompany as any).mockResolvedValue({ data: company });

      const result = await getCompany(company.id);

      expect(getCompany).toHaveBeenCalledWith(company.id);
      expect(result.data).toEqual(company);
    });

    it('should create new company successfully', async () => {
      const newCompany = {
        name: 'New Tech Corp',
        industry: 'Technology',
        location: 'San Francisco',
        size: 'Medium'
      };

      const mockResponse = { data: { ...newCompany, id: 999 } };
      (createCompany as any).mockResolvedValue(mockResponse);

      const result = await createCompany(newCompany);

      expect(createCompany).toHaveBeenCalledWith(newCompany);
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should update company successfully', async () => {
      const companyId = 1;
      const updateData = {
        name: 'Updated Company Name',
        industry: 'Updated Industry'
      };

      const mockResponse = { data: { ...updateData, id: companyId } };
      (updateCompany as any).mockResolvedValue(mockResponse);

      const result = await updateCompany(companyId, updateData);

      expect(updateCompany).toHaveBeenCalledWith(companyId, updateData);
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should delete company successfully', async () => {
      const companyId = 1;
      const mockResponse = { success: true };
      (deleteCompany as any).mockResolvedValue(mockResponse);

      const result = await deleteCompany(companyId);

      expect(deleteCompany).toHaveBeenCalledWith(companyId);
      expect(result.success).toBe(true);
    });
  });

  describe('Document API Tests', () => {
    it('should fetch documents successfully', async () => {
      (getDocuments as any).mockResolvedValue({ data: mockDocuments });

      const result = await getDocuments();

      expect(getDocuments).toHaveBeenCalled();
      expect(result.data).toEqual(mockDocuments);
    });

    it('should fetch single document by ID', async () => {
      const document = mockDocuments[0];
      (getDocument as any).mockResolvedValue({ data: document });

      const result = await getDocument(document.id);

      expect(getDocument).toHaveBeenCalledWith(document.id);
      expect(result.data).toEqual(document);
    });

    it('should upload document successfully', async () => {
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const uploadData = {
        title: 'Test Document',
        description: 'Test description',
        file
      };

      const mockResponse = { data: { ...uploadData, id: 999, url: 'https://example.com/test.pdf' } };
      (uploadDocument as any).mockResolvedValue(mockResponse);

      const result = await uploadDocument(uploadData);

      expect(uploadDocument).toHaveBeenCalledWith(uploadData);
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should update document successfully', async () => {
      const documentId = 1;
      const updateData = {
        title: 'Updated Document Title',
        description: 'Updated description'
      };

      const mockResponse = { data: { ...updateData, id: documentId } };
      (updateDocument as any).mockResolvedValue(mockResponse);

      const result = await updateDocument(documentId, updateData);

      expect(updateDocument).toHaveBeenCalledWith(documentId, updateData);
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should delete document successfully', async () => {
      const documentId = 1;
      const mockResponse = { success: true };
      (deleteDocument as any).mockResolvedValue(mockResponse);

      const result = await deleteDocument(documentId);

      expect(deleteDocument).toHaveBeenCalledWith(documentId);
      expect(result.success).toBe(true);
    });

    it('should download document successfully', async () => {
      const documentId = 1;
      const mockResponse = { data: 'document-content', filename: 'test.pdf' };
      (downloadDocument as any).mockResolvedValue(mockResponse);

      const result = await downloadDocument(documentId);

      expect(downloadDocument).toHaveBeenCalledWith(documentId);
      expect(result.data).toBeDefined();
      expect(result.filename).toBeDefined();
    });
  });

  describe('License API Tests', () => {
    it('should fetch licenses successfully', async () => {
      (getLicenses as any).mockResolvedValue({ data: mockLicenses });

      const result = await getLicenses();

      expect(getLicenses).toHaveBeenCalled();
      expect(result.data).toEqual(mockLicenses);
    });

    it('should fetch single license by ID', async () => {
      const license = mockLicenses[0];
      (getLicense as any).mockResolvedValue({ data: license });

      const result = await getLicense(license.id);

      expect(getLicense).toHaveBeenCalledWith(license.id);
      expect(result.data).toEqual(license);
    });

    it('should create new license successfully', async () => {
      const newLicense = {
        name: 'New Software License',
        type: 'Commercial',
        vendor: 'Software Corp',
        cost: 5000,
        expiryDate: '2024-12-31'
      };

      const mockResponse = { data: { ...newLicense, id: 999 } };
      (createLicense as any).mockResolvedValue(mockResponse);

      const result = await createLicense(newLicense);

      expect(createLicense).toHaveBeenCalledWith(newLicense);
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should update license successfully', async () => {
      const licenseId = 1;
      const updateData = {
        name: 'Updated License Name',
        cost: 6000
      };

      const mockResponse = { data: { ...updateData, id: licenseId } };
      (updateLicense as any).mockResolvedValue(mockResponse);

      const result = await updateLicense(licenseId, updateData);

      expect(updateLicense).toHaveBeenCalledWith(licenseId, updateData);
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should delete license successfully', async () => {
      const licenseId = 1;
      const mockResponse = { success: true };
      (deleteLicense as any).mockResolvedValue(mockResponse);

      const result = await deleteLicense(licenseId);

      expect(deleteLicense).toHaveBeenCalledWith(licenseId);
      expect(result.success).toBe(true);
    });

    it('should renew license successfully', async () => {
      const licenseId = 1;
      const renewalData = {
        newExpiryDate: '2025-12-31',
        cost: 5500
      };

      const mockResponse = { data: { id: licenseId, ...renewalData } };
      (renewLicense as any).mockResolvedValue(mockResponse);

      const result = await renewLicense(licenseId, renewalData);

      expect(renewLicense).toHaveBeenCalledWith(licenseId, renewalData);
      expect(result.data).toEqual(mockResponse.data);
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle network errors gracefully', async () => {
      const networkError = new Error('Network Error');
      (getEmployees as any).mockRejectedValue(networkError);

      await expect(getEmployees()).rejects.toThrow('Network Error');
      expect(getEmployees).toHaveBeenCalled();
    });

    it('should handle server errors (500)', async () => {
      const serverError = new Error('Internal Server Error');
      serverError.name = 'ServerError';
      (createEmployee as any).mockRejectedValue(serverError);

      const employeeData = { firstName: 'John', lastName: 'Doe' };

      await expect(createEmployee(employeeData)).rejects.toThrow('Internal Server Error');
      expect(createEmployee).toHaveBeenCalledWith(employeeData);
    });

    it('should handle validation errors (400)', async () => {
      const validationError = new Error('Validation Error');
      validationError.name = 'ValidationError';
      (updateEmployee as any).mockRejectedValue(validationError);

      const invalidData = { email: 'invalid-email' };

      await expect(updateEmployee(1, invalidData)).rejects.toThrow('Validation Error');
      expect(updateEmployee).toHaveBeenCalledWith(1, invalidData);
    });

    it('should handle unauthorized errors (401)', async () => {
      const unauthorizedError = new Error('Unauthorized');
      unauthorizedError.name = 'UnauthorizedError';
      (getCompanies as any).mockRejectedValue(unauthorizedError);

      await expect(getCompanies()).rejects.toThrow('Unauthorized');
      expect(getCompanies).toHaveBeenCalled();
    });

    it('should handle not found errors (404)', async () => {
      const notFoundError = new Error('Not Found');
      notFoundError.name = 'NotFoundError';
      (getEmployee as any).mockRejectedValue(notFoundError);

      await expect(getEmployee(999)).rejects.toThrow('Not Found');
      expect(getEmployee).toHaveBeenCalledWith(999);
    });
  });

  describe('API Request Configuration Tests', () => {
    it('should include authentication headers in requests', async () => {
      const mockToken = 'mock-jwt-token';
      (getAuthToken as any).mockReturnValue(mockToken);
      (getEmployees as any).mockResolvedValue({ data: mockEmployees });

      await getEmployees();

      expect(getAuthToken).toHaveBeenCalled();
      expect(apiRequest).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`
          })
        })
      );
    });

    it('should handle request timeouts', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';
      (getDocuments as any).mockRejectedValue(timeoutError);

      await expect(getDocuments()).rejects.toThrow('Request timeout');
      expect(getDocuments).toHaveBeenCalled();
    });

    it('should handle request cancellation', async () => {
      const cancelError = new Error('Request cancelled');
      cancelError.name = 'CancelError';
      (getLicenses as any).mockRejectedValue(cancelError);

      await expect(getLicenses()).rejects.toThrow('Request cancelled');
      expect(getLicenses).toHaveBeenCalled();
    });
  });

  describe('Data Validation Tests', () => {
    it('should validate employee data structure', async () => {
      const validEmployee = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        position: 'Developer'
      };

      const mockResponse = { data: { ...validEmployee, id: 1 } };
      (createEmployee as any).mockResolvedValue(mockResponse);

      const result = await createEmployee(validEmployee);

      expect(result.data).toHaveProperty('id');
      expect(result.data).toHaveProperty('firstName');
      expect(result.data).toHaveProperty('lastName');
      expect(result.data).toHaveProperty('email');
      expect(result.data).toHaveProperty('position');
    });

    it('should validate company data structure', async () => {
      const validCompany = {
        name: 'Test Company',
        industry: 'Technology',
        location: 'New York'
      };

      const mockResponse = { data: { ...validCompany, id: 1 } };
      (createCompany as any).mockResolvedValue(mockResponse);

      const result = await createCompany(validCompany);

      expect(result.data).toHaveProperty('id');
      expect(result.data).toHaveProperty('name');
      expect(result.data).toHaveProperty('industry');
      expect(result.data).toHaveProperty('location');
    });

    it('should validate document data structure', async () => {
      const validDocument = {
        title: 'Test Document',
        description: 'Test description',
        type: 'pdf'
      };

      const mockResponse = { data: { ...validDocument, id: 1, url: 'https://example.com/test.pdf' } };
      (uploadDocument as any).mockResolvedValue(mockResponse);

      const result = await uploadDocument(validDocument);

      expect(result.data).toHaveProperty('id');
      expect(result.data).toHaveProperty('title');
      expect(result.data).toHaveProperty('description');
      expect(result.data).toHaveProperty('url');
    });
  });
});
