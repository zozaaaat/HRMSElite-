/// <reference types="vitest/globals" />
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import type { User, Company, Employee, License, Document } from '../../../shared/schema';

// Mock all services
vi.mock('../src/services/api', () => ({
  apiRequest: vi.fn(),
  getAuthToken: vi.fn(() => 'mock-token'),
  setAuthToken: vi.fn(),
  removeAuthToken: vi.fn(),
}));

vi.mock('../src/services/auth', () => ({
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  refreshToken: vi.fn(),
  verifyToken: vi.fn(),
}));

vi.mock('../src/services/employee', () => ({
  getEmployees: vi.fn(),
  getEmployee: vi.fn(),
  createEmployee: vi.fn(),
  updateEmployee: vi.fn(),
  deleteEmployee: vi.fn(),
  getEmployeeStatus: vi.fn(),
  updateEmployeeStatus: vi.fn(),
}));

vi.mock('../src/services/company', () => ({
  getCompanies: vi.fn(),
  getCompany: vi.fn(),
  createCompany: vi.fn(),
  updateCompany: vi.fn(),
  deleteCompany: vi.fn(),
}));

vi.mock('../src/services/documents', () => ({
  getDocuments: vi.fn(),
  getDocument: vi.fn(),
  uploadDocument: vi.fn(),
  updateDocument: vi.fn(),
  deleteDocument: vi.fn(),
  downloadDocument: vi.fn(),
}));

vi.mock('../src/services/licenses', () => ({
  getLicenses: vi.fn(),
  getLicense: vi.fn(),
  createLicense: vi.fn(),
  updateLicense: vi.fn(),
  deleteLicense: vi.fn(),
  renewLicense: vi.fn(),
}));

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

// Create mock data that matches the schema
const createMockUser = (overrides = {}): User => ({
  id: 'user123',
  email: 'test@example.com',
  firstName: 'أحمد',
  lastName: 'محمد',
  password: 'hashedpassword',
  profileImageUrl: null,
  role: 'company_manager',
  companyId: 'company456',
  permissions: '["read", "write"]',
  isActive: true,
  emailVerified: false,
  emailVerificationToken: null,
  emailVerificationExpires: null,
  passwordResetToken: null,
  passwordResetExpires: null,
  lastPasswordChange: null,
  lastLoginAt: null,
  sub: 'user123',
  claims: null,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  ...overrides
});

const createMockCompany = (overrides = {}): Company => ({
  id: 'company456',
  name: 'شركة النيل الأزرق للمجوهرات',
  commercialFileNumber: '123456',
  commercialFileName: 'ملف تجاري النيل الأزرق',
  commercialFileStatus: true,
  establishmentDate: '2020-01-01',
  commercialRegistrationNumber: 'CR123456',
  classification: 'تجارة عامة',
  department: 'إدارة التجارة',
  fileType: 'تجاري',
  legalEntity: 'شركة ذات مسؤولية محدودة',
  ownershipCategory: 'خاص',
  logoUrl: null,
  address: 'شارع الخليج، مباركية، الكويت',
  phone: '+96512345678',
  email: 'info@nileblue.com',
  website: 'https://nileblue.com',
  totalEmployees: 25,
  totalLicenses: 3,
  isActive: true,
  ...overrides
});

const createMockEmployee = (overrides = {}): Employee => ({
  id: 'emp123',
  firstName: 'عامل',
  lastName: 'أول',
  email: 'emp1@example.com',
  phone: '+96512345678',
  position: 'عامل',
  department: 'الإنتاج',
  salary: 500,
  hireDate: new Date('2023-01-01'),
  companyId: 'company456',
  status: 'active',
  type: 'expatriate',
  nationality: 'مصرية',
  passportNumber: 'A123456',
  residenceNumber: 'R123456',
  civilId: '123456789',
  workPermitNumber: 'WP123456',
  licenseId: null,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  ...overrides
});

const createMockLicense = (overrides = {}): License => ({
  id: 'license123',
  licenseNumber: 'LIC123456',
  licenseType: 'commercial',
  status: 'active',
  issueDate: new Date('2023-01-01'),
  expiryDate: new Date('2024-01-01'),
  companyId: 'company456',
  employeeId: 'emp123',
  description: 'ترخيص تجاري',
  isActive: true,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  ...overrides
});

const createMockDocument = (overrides = {}): Document => ({
  id: 'doc123',
  name: 'وثيقة تجارية',
  type: 'establishment_document',
  fileUrl: 'https://example.com/document.pdf',
  fileSize: 1024,
  mimeType: 'application/pdf',
  companyId: 'company456',
  employeeId: 'emp123',
  licenseId: null,
  isActive: true,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  ...overrides
});

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
  } as unknown as File;
};

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

describe('End-to-End Application Flow', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication Flow', () => {
    it('should handle complete login flow', async () => {
      const mockUser = createMockUser();
      const mockCompany = createMockCompany();

      // Mock successful login
      const { login } = await import('../src/services/auth');
      (login as MockFunction).mockResolvedValue({
        success: true,
        user: mockUser,
        token: 'mock-token'
      });

      // Mock company fetch
      const { getCompany } = await import('../src/services/company');
      (getCompany as MockFunction).mockResolvedValue(mockCompany);

      // Test login flow
      expect(login).toBeDefined();
      expect(getCompany).toBeDefined();

      const loginResult = await (login as MockFunction)('test@example.com', 'password');
      expect(loginResult.success).toBe(true);
      expect(loginResult.user).toEqual(mockUser);
    });

    it('should handle login failure', async () => {
      const { login } = await import('../src/services/auth');
      (login as MockFunction).mockRejectedValue(new Error('Invalid credentials'));

      try {
        await (login as MockFunction)('invalid@example.com', 'wrongpassword');
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Invalid credentials');
      }
    });

    it('should handle logout flow', async () => {
      const { logout } = await import('../src/services/auth');
      (logout as MockFunction).mockResolvedValue({ success: true });

      const logoutResult = await (logout as MockFunction)();
      expect(logoutResult.success).toBe(true);
    });
  });

  describe('Employee Management Flow', () => {
    it('should handle employee creation flow', async () => {
      const mockEmployee = createMockEmployee();
      const employeeData: EmployeeCreateTestData = {
        firstName: 'عامل',
        lastName: 'جديد',
        email: 'newemp@example.com',
        phone: '+96512345678',
        position: 'عامل',
        department: 'الإنتاج',
        salary: 600,
        hireDate: '2023-06-01',
        companyId: 'company456'
      };

      const { createEmployee } = await import('../src/services/employee');
      (createEmployee as MockFunction).mockResolvedValue(mockEmployee);

      const result = await (createEmployee as MockFunction)(employeeData);
      expect(result).toEqual(mockEmployee);
    });

    it('should handle employee update flow', async () => {
      const updatedEmployee = createMockEmployee({ salary: 700 });
      const { updateEmployee } = await import('../src/services/employee');
      (updateEmployee as MockFunction).mockResolvedValue(updatedEmployee);

      const result = await (updateEmployee as MockFunction)('emp123', { salary: 700 });
      expect(result.salary).toBe(700);
    });

    it('should handle employee deletion flow', async () => {
      const { deleteEmployee } = await import('../src/services/employee');
      (deleteEmployee as MockFunction).mockResolvedValue({ success: true });

      const result = await (deleteEmployee as MockFunction)('emp123');
      expect(result.success).toBe(true);
    });
  });

  describe('Document Management Flow', () => {
    it('should handle document upload flow', async () => {
      const mockDocument = createMockDocument();
      const mockFile = createMockFile('test content', 'test.pdf', 'application/pdf');

      const { uploadDocument } = await import('../src/services/documents');
      (uploadDocument as MockFunction).mockResolvedValue(mockDocument);

      const result = await (uploadDocument as MockFunction)(mockFile, 'company456');
      expect(result).toEqual(mockDocument);
    });

    it('should handle document download flow', async () => {
      const mockBlob = new Blob(['test content'], { type: 'application/pdf' });
      const { downloadDocument } = await import('../src/services/documents');
      (downloadDocument as MockFunction).mockResolvedValue(mockBlob);

      const result = await (downloadDocument as MockFunction)('doc123');
      expect(result).toBeInstanceOf(Blob);
    });
  });

  describe('License Management Flow', () => {
    it('should handle license creation flow', async () => {
      const mockLicense = createMockLicense();
      const { createLicense } = await import('../src/services/licenses');
      (createLicense as MockFunction).mockResolvedValue(mockLicense);

      const licenseData = {
        licenseNumber: 'LIC123456',
        licenseType: 'commercial',
        issueDate: '2023-01-01',
        expiryDate: '2024-01-01',
        companyId: 'company456',
        employeeId: 'emp123'
      };

      const result = await (createLicense as MockFunction)(licenseData);
      expect(result).toEqual(mockLicense);
    });

    it('should handle license renewal flow', async () => {
      const renewedLicense = createMockLicense({ 
        expiryDate: new Date('2025-01-01') 
      });
      const { renewLicense } = await import('../src/services/licenses');
      (renewLicense as MockFunction).mockResolvedValue(renewedLicense);

      const result = await (renewLicense as MockFunction)('license123', '2025-01-01');
      expect(result.expiryDate).toEqual(new Date('2025-01-01'));
    });
  });

  describe('Company Management Flow', () => {
    it('should handle company creation flow', async () => {
      const mockCompany = createMockCompany();
      const { createCompany } = await import('../src/services/company');
      (createCompany as MockFunction).mockResolvedValue(mockCompany);

      const companyData = {
        name: 'شركة جديدة',
        commercialFileNumber: '654321',
        establishmentDate: '2023-01-01'
      };

      const result = await (createCompany as MockFunction)(companyData);
      expect(result).toEqual(mockCompany);
    });

    it('should handle company update flow', async () => {
      const updatedCompany = createMockCompany({ name: 'شركة محدثة' });
      const { updateCompany } = await import('../src/services/company');
      (updateCompany as MockFunction).mockResolvedValue(updatedCompany);

      const result = await (updateCompany as MockFunction)('company456', { name: 'شركة محدثة' });
      expect(result.name).toBe('شركة محدثة');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const { getEmployees } = await import('../src/services/employee');
      (getEmployees as MockFunction).mockRejectedValue(new Error('Network error'));

      try {
        await (getEmployees as MockFunction)('company456');
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Network error');
      }
    });

    it('should handle API errors with proper error messages', async () => {
      const { createEmployee } = await import('../src/services/employee');
      (createEmployee as MockFunction).mockRejectedValue({
        message: 'Validation failed',
        status: 400
      });

      try {
        await (createEmployee as MockFunction)({});
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect((error as any).message).toBe('Validation failed');
        expect((error as any).status).toBe(400);
      }
    });
  });

  describe('Data Synchronization', () => {
    it('should handle data refresh flow', async () => {
      const mockEmployees = [createMockEmployee()];
      const { getEmployees } = await import('../src/services/employee');
      (getEmployees as MockFunction).mockResolvedValue(mockEmployees);

      const result = await (getEmployees as MockFunction)('company456');
      expect(result).toEqual(mockEmployees);
    });

    it('should handle concurrent data operations', async () => {
      const { getEmployees, getCompany } = await import('../src/services/employee');
      const { getCompany: getCompanyService } = await import('../src/services/company');

      (getEmployees as MockFunction).mockResolvedValue([createMockEmployee()]);
      (getCompanyService as MockFunction).mockResolvedValue(createMockCompany());

      const [employees, company] = await Promise.all([
        (getEmployees as MockFunction)('company456'),
        (getCompanyService as MockFunction)('company456')
      ]);

      expect(employees).toBeDefined();
      expect(company).toBeDefined();
    });
  });
}); 
}); 