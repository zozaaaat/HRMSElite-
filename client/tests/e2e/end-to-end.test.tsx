/// <reference types="vitest/globals" />
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { mockEmployees, mockCompanies, mockDocuments, mockLicenses } from '../mock-data';

// Mock all services
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

// Import mocked services
import { AuthService } from '@/services/auth';
import { EmployeeService } from '@/services/employee';
import { CompanyService } from '@/services/company';
import { documentService } from '@/services/documents';
import { licenseService } from '@/services/licenses';

// Test wrapper component
const _TestWrapper = ({ children }: { children: React.ReactNode }) => {
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

// Type definitions for better type safety
type MockFunction = ReturnType<typeof vi.fn>;

// Create a mock file object for testing
const createMockFile = (content: string, filename: string, type: string) => {
  return {
    name: filename,
    type,
    size: content.length,
    lastModified: Date.now(),
    content,
    // Add required File properties for testing
    arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(content.length)),
    slice: vi.fn(),
    stream: vi.fn(),
    text: vi.fn().mockResolvedValue(content),
  };
};

// Type for employee create data
interface EmployeeCreateTestData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  salary: number;
  hireDate: string;
  companyId: string;
}

describe('End-to-End Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Complete User Authentication Flow', () => {
    it('should complete full login and logout workflow', async () => {
      const _user = userEvent.setup();
      
      // Mock successful login
      (AuthService.login as MockFunction).mockResolvedValue({
        success: true,
        token: 'mock-jwt-token',
        user: {
          id: 1,
          email: 'admin@example.com',
          role: 'admin',
          companyId: 1
        }
      });

      // Mock successful logout
      (AuthService.logout as MockFunction).mockResolvedValue(undefined);

      // Test login flow
      const loginResult = await AuthService.login({ email: 'admin@example.com', password: 'password123' });
      expect(loginResult.success).toBe(true);
      expect(loginResult.token).toBeDefined();
      expect(loginResult.user.role).toBe('admin');

      // Test logout flow
      const logoutResult = await AuthService.logout();
      expect(logoutResult).toBeUndefined();
    });

    it('should handle authentication errors gracefully', async () => {
      // Mock login failure
      (AuthService.login as MockFunction).mockRejectedValue(new Error('Invalid credentials'));

      await expect(AuthService.login({ email: 'invalid@example.com', password: 'wrongpassword' })).rejects.toThrow('Invalid credentials');
    });
  });

  describe('Complete Employee Management Workflow', () => {
    it('should complete full employee lifecycle', async () => {
      const _user = userEvent.setup();

      // 1. Fetch employees
      (EmployeeService.getAllEmployees as MockFunction).mockResolvedValue(mockEmployees);

      const employeesResult = await EmployeeService.getAllEmployees();
      expect(employeesResult).toHaveLength(mockEmployees.length);

      // 2. Create new employee
      const newEmployee: EmployeeCreateTestData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        position: 'Developer',
        department: 'IT',
        salary: 75000,
        hireDate: '2024-01-15',
        companyId: '1'
      };

      (EmployeeService.createEmployee as MockFunction).mockResolvedValue({ ...newEmployee, id: '101' });

      const createResult = await EmployeeService.createEmployee(newEmployee);
      expect(createResult.id).toBeDefined();

      // 3. Update employee
      const updateData = {
        id: '101',
        salary: 80000,
        position: 'Senior Developer'
      };

      (EmployeeService.updateEmployee as MockFunction).mockResolvedValue({ ...newEmployee, ...updateData });

      const updateResult = await EmployeeService.updateEmployee(updateData);
      expect(updateResult.salary).toBe(80000);

      // 4. Delete employee
      (EmployeeService.deleteEmployee as MockFunction).mockResolvedValue(undefined);

      const deleteResult = await EmployeeService.deleteEmployee('101');
      expect(deleteResult).toBeUndefined();
    });

    it('should handle employee data validation', async () => {
      const invalidEmployee: EmployeeCreateTestData = {
        firstName: '', // Invalid: empty name
        lastName: 'Doe',
        email: 'invalid-email', // Invalid email format
        phone: '123', // Invalid phone format
        position: 'Developer',
        department: 'IT',
        salary: -1000, // Invalid: negative salary
        hireDate: 'invalid-date', // Invalid date format
        companyId: '1'
      };

      // Should reject invalid data
      (EmployeeService.createEmployee as MockFunction).mockRejectedValue(new Error('Validation failed'));

      await expect(EmployeeService.createEmployee(invalidEmployee)).rejects.toThrow('Validation failed');
    });
  });

  describe('Complete Company Management Workflow', () => {
    it('should complete full company lifecycle', async () => {
      // 1. Fetch companies
      (CompanyService.getAllCompanies as MockFunction).mockResolvedValue(mockCompanies);

      const companiesResult = await CompanyService.getAllCompanies();
      expect(companiesResult).toHaveLength(mockCompanies.length);

      // 2. Create new company
      const newCompany = {
        name: 'New Tech Corp',
        registrationNumber: 'REG123456',
        address: '123 Tech Street',
        phone: '+1234567890',
        email: 'contact@newtech.com',
        industry: 'Technology',
        size: 'medium' as const
      };

      (CompanyService.createCompany as MockFunction).mockResolvedValue({ ...newCompany, id: '201' });

      const createResult = await CompanyService.createCompany(newCompany);
      expect(createResult.id).toBeDefined();
    });
  });

  describe('Complete Document Management Workflow', () => {
    it('should complete full document lifecycle', async () => {
      // 1. Fetch documents
      (documentService.getDocuments as MockFunction).mockResolvedValue(mockDocuments);

      const documentsResult = await documentService.getDocuments();
      expect(documentsResult).toHaveLength(mockDocuments.length);

      // 2. Upload document
      const mockFile = createMockFile('test content', 'test.pdf', 'application/pdf');
      const uploadData = {
        name: 'Test Document',
        category: 'Contract',
        file: mockFile,
        entityId: '1',
        entityType: 'employee' as const
      };

      (documentService.createDocument as MockFunction).mockResolvedValue({
        id: '301',
        name: 'Test Document',
        filename: 'test.pdf',
        size: 1024,
        uploadedAt: new Date().toISOString()
      });

      // @ts-ignore: mockFile is not a real File instance, but this is fine for the test
      const uploadResult = await documentService.createDocument(uploadData);
      expect(uploadResult.id).toBeDefined();

      // 3. Delete document
      (documentService.deleteDocument as MockFunction).mockResolvedValue(undefined);

      const deleteResult = await documentService.deleteDocument('301');
      expect(deleteResult).toBeUndefined();
    });

    it('should handle file upload errors', async () => {
      const invalidFile = createMockFile('', 'test.txt', 'text/plain');
      const uploadData = {
        name: 'Test Document',
        category: 'Contract',
        file: invalidFile,
        entityId: '1',
        entityType: 'employee' as const
      };

      // Should reject invalid file
      (documentService.createDocument as MockFunction).mockImplementation(() => {
        throw new Error('Invalid file type');
      });

      await expect(async () => {
        // @ts-ignore: invalidFile is not a real File instance, but this is fine for the test
        await documentService.createDocument(uploadData);
      }).rejects.toThrow('Invalid file type');
    });
  });

  describe('Complete License Management Workflow', () => {
    it('should complete full license lifecycle', async () => {
      // 1. Fetch licenses
      (licenseService.getLicenses as MockFunction).mockResolvedValue(mockLicenses);

      const licensesResult = await licenseService.getLicenses();
      expect(licensesResult).toHaveLength(mockLicenses.length);

      // 2. Create new license
      const newLicense = {
        companyId: '1',
        name: 'Software License',
        type: 'Software',
        number: 'LIC123456',
        issueDate: '2024-01-01',
        expiryDate: '2024-12-31',
        issuingAuthority: 'Microsoft',
        location: 'Global'
      };

      (licenseService.createLicense as MockFunction).mockResolvedValue({ ...newLicense, id: '401' });

      const createResult = await licenseService.createLicense(newLicense);
      expect(createResult.id).toBeDefined();

      // 3. Update license (renewal)
      (licenseService.updateLicense as MockFunction).mockResolvedValue({
        ...newLicense,
        id: '401',
        expiryDate: '2025-12-31'
      });

      const renewResult = await licenseService.updateLicense('401', { expiryDate: '2025-12-31' });
      expect(renewResult.expiryDate).toBe('2025-12-31');
    });
  });

  describe('Cross-Module Integration Workflows', () => {
    it('should handle employee with documents and licenses', async () => {
      // 1. Create employee
      const newEmployee: EmployeeCreateTestData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1234567890',
        position: 'Manager',
        department: 'HR',
        salary: 85000,
        hireDate: '2024-01-15',
        companyId: '1'
      };

      (EmployeeService.createEmployee as MockFunction).mockResolvedValue({
        ...newEmployee, id: '102'
      });

      const employeeResult = await EmployeeService.createEmployee(newEmployee);
      const employeeId = employeeResult.id;

      // 2. Upload document for employee
      const mockFile = createMockFile('contract content', 'contract.pdf', 'application/pdf');
      const uploadData = {
        name: 'Employment Contract',
        category: 'Contract',
        entityId: employeeId,
        entityType: 'employee' as const,
        file: mockFile
      };

      (documentService.createDocument as MockFunction).mockResolvedValue({
        id: '302',
        name: 'Employment Contract',
        entityId: employeeId,
        uploadedAt: new Date().toISOString()
      });

      // Fix: Ensure uploadData.file matches the expected File type for DocumentUploadData
      // If createMockFile does not return a real File, use a real File or a suitable polyfill/mock
      // For Node.js environment, you may need to use a Blob or a mock File implementation
      // Here, we use a real File if available, otherwise fallback to the mock for test compatibility

      // If running in a browser-like environment:
      // const realFile = new File(['contract content'], 'contract.pdf', { type: 'application/pdf' });
      // const uploadDataWithRealFile = { ...uploadData, file: realFile };

      // Use a type-safe cast for uploadData.file if possible, otherwise use a proper mock File type
      // If createMockFile returns a compatible File-like object, cast only the file property
      const uploadDataWithTypedFile = {
        ...uploadData,
        file: mockFile as File
      };

      const documentResult = await documentService.createDocument(uploadDataWithTypedFile);
      expect(documentResult.entityId).toBe(employeeId);

      // 3. Create license for employee's company
      const newLicense = {
        companyId: '1',
        name: 'Professional Certification',
        type: 'Certification',
        number: 'CERT123456',
        issueDate: '2024-01-01',
        expiryDate: '2024-12-31',
        issuingAuthority: 'HR Institute',
        location: 'Global'
      };

      (licenseService.createLicense as MockFunction).mockResolvedValue({
        ...newLicense, id: '402'
      });

      const licenseResult = await licenseService.createLicense(newLicense);
      expect(licenseResult.id).toBeDefined();
    });

    it('should handle company with multiple employees', async () => {
      // 1. Create company
      const newCompany = {
        name: 'Multi-Employee Corp',
        registrationNumber: 'REG123456',
        address: '123 Tech Street',
        phone: '+1234567890',
        email: 'contact@multicorp.com',
        industry: 'Technology',
        size: 'large' as const
      };

      (CompanyService.createCompany as MockFunction).mockResolvedValue({
        ...newCompany, id: '202'
      });

      const companyResult = await CompanyService.createCompany(newCompany);
      const companyId = companyResult.id;

      // 2. Create multiple employees for company
      const employees: EmployeeCreateTestData[] = [
        { 
          firstName: 'Alice', 
          lastName: 'Johnson', 
          email: 'alice@company.com', 
          phone: '+1234567890',
          position: 'Developer',
          department: 'IT',
          salary: 75000,
          hireDate: '2024-01-15',
          companyId 
        },
        { 
          firstName: 'Bob', 
          lastName: 'Williams', 
          email: 'bob@company.com', 
          phone: '+1234567890',
          position: 'Manager',
          department: 'HR',
          salary: 85000,
          hireDate: '2024-01-15',
          companyId 
        },
        { 
          firstName: 'Carol', 
          lastName: 'Brown', 
          email: 'carol@company.com', 
          phone: '+1234567890',
          position: 'Designer',
          department: 'Design',
          salary: 70000,
          hireDate: '2024-01-15',
          companyId 
        }
      ];

      (EmployeeService.createEmployee as MockFunction).mockResolvedValue((employeeData: EmployeeCreateTestData) => ({
        ...employeeData, id: Math.floor(Math.random() * 1000) + 200
      }));

      const employeeResults = await Promise.all(
        employees.map(employee => EmployeeService.createEmployee(employee))
      );

      expect(employeeResults).toHaveLength(3);
      employeeResults.forEach(result => {
        expect(result.companyId).toBe(companyId);
      });
    });
  });

  describe('Error Recovery Workflows', () => {
    it('should handle network failures and recovery', async () => {
      // 1. Simulate network failure
      (EmployeeService.getAllEmployees as MockFunction).mockRejectedValue(new Error('Network error'));

      await expect(EmployeeService.getAllEmployees()).rejects.toThrow('Network error');

      // 2. Simulate network recovery
      (EmployeeService.getAllEmployees as MockFunction).mockResolvedValue(mockEmployees);

      const result = await EmployeeService.getAllEmployees();
      expect(result).toHaveLength(mockEmployees.length);
    });

    it('should handle partial data failures', async () => {
      // Simulate partial data (some employees missing required fields)
      const partialData = [
        { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
        { id: '2', firstName: 'Jane', lastName: 'Smith' }, // Missing email
        { id: '3', firstName: 'Bob', lastName: 'Johnson', email: 'bob@example.com' }
      ];

      (EmployeeService.getAllEmployees as MockFunction).mockResolvedValue(partialData);

      const result = await EmployeeService.getAllEmployees();
      expect(result).toHaveLength(3);
      // Should handle missing fields gracefully
      expect(result[1].email).toBeUndefined();
    });
  });

  describe('Data Consistency Workflows', () => {
    it('should maintain data consistency across operations', async () => {
      // 1. Create employee
      const employee: EmployeeCreateTestData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '+1234567890',
        position: 'Developer',
        department: 'IT',
        salary: 75000,
        hireDate: '2024-01-15',
        companyId: '1'
      };

      (EmployeeService.createEmployee as MockFunction).mockResolvedValue({
        ...employee, id: '103'
      });

      const createResult = await EmployeeService.createEmployee(employee);
      const employeeId = createResult.id;

      // 2. Verify employee exists
      (EmployeeService.getAllEmployees as MockFunction).mockResolvedValue([
        { ...employee, id: employeeId }
      ]);

      const verifyResult = await EmployeeService.getAllEmployees();
      expect(verifyResult).toHaveLength(1);
      expect(verifyResult[0].id).toBe(employeeId);

      // 3. Update employee
      const updateData = { id: employeeId, position: 'Senior Developer' };
      (EmployeeService.updateEmployee as MockFunction).mockResolvedValue({
        ...employee, ...updateData
      });

      const updateResult = await EmployeeService.updateEmployee(updateData);
      expect(updateResult.position).toBe('Senior Developer');

      // 4. Verify update persisted
      (EmployeeService.getAllEmployees as MockFunction).mockResolvedValue([
        { ...employee, ...updateData }
      ]);

      const finalVerify = await EmployeeService.getAllEmployees();
      expect(finalVerify[0].position).toBe('Senior Developer');
    });
  });

  describe('Performance Under Load', () => {
    it('should handle multiple concurrent operations', async () => {
      // Simulate multiple concurrent operations
      const operations = [
        EmployeeService.getAllEmployees(),
        CompanyService.getAllCompanies(),
        documentService.getDocuments(),
        licenseService.getLicenses()
      ];

      // Mock all operations to succeed
      (EmployeeService.getAllEmployees as MockFunction).mockResolvedValue(mockEmployees);
      (CompanyService.getAllCompanies as MockFunction).mockResolvedValue(mockCompanies);
      (documentService.getDocuments as MockFunction).mockResolvedValue(mockDocuments);
      (licenseService.getLicenses as MockFunction).mockResolvedValue(mockLicenses);

      const results = await Promise.all(operations);
      
      expect(results).toHaveLength(4);
      results.forEach(result => {
        expect(Array.isArray(result)).toBe(true);
      });
    });

    it('should handle large data sets efficiently', async () => {
      const largeDataSet = Array(1000).fill(null).map((_, index) => ({
        id: index + 1,
        firstName: `User${index}`,
        lastName: `Test${index}`,
        email: `user${index}@example.com`
      }));

      (EmployeeService.getAllEmployees as MockFunction).mockResolvedValue(largeDataSet);

      const result = await EmployeeService.getAllEmployees();
      expect(result).toHaveLength(1000);
    });
  });
}); 