import { describe, it, expect } from 'vitest';
import { 
  mockEmployee, 
  mockCompany, 
  mockUser, 
  mockLicense,
  createMockEmployee,
  createMockCompany 
} from './mock-data';

describe('Mock Data Examples', () => {
  it('should have properly typed employee data', () => {
    expect(mockEmployee.id).toBe('1');
    expect(mockEmployee.firstName).toBe('أحمد');
    expect(mockEmployee.lastName).toBe('محمد علي');
    expect(mockEmployee.email).toBe('ahmed@nileblue.com');
    expect(mockEmployee.nationality).toBe('مصري');
    expect(mockEmployee.jobTitle).toBe('مدير مبيعات');
    expect(mockEmployee.department).toBe('المبيعات');
    expect(mockEmployee.salary).toBe(800);
    expect(mockEmployee.status).toBe('active');
    expect(mockEmployee.employeeType).toBe('expatriate');
  });

  it('should have properly typed company data', () => {
    expect(mockCompany.id).toBe('1');
    expect(mockCompany.name).toBe('شركة النيل الأزرق للمجوهرات');
    expect(mockCompany.commercialFileNumber).toBe('123456');
    expect(mockCompany.commercialFileStatus).toBe(true);
    expect(mockCompany.totalEmployees).toBe(25);
    expect(mockCompany.totalLicenses).toBe(3);
    expect(mockCompany.isActive).toBe(true);
    expect(mockCompany.industryType).toBe('مجوهرات');
    expect(mockCompany.location).toBe('مباركية');
  });

  it('should have properly typed user data', () => {
    expect(mockUser.id).toBe('1');
    expect(mockUser.email).toBe('ahmed@example.com');
    expect(mockUser.firstName).toBe('أحمد');
    expect(mockUser.lastName).toBe('محمد');
    expect(mockUser.role).toBe('company_manager');
    expect(mockUser.isActive).toBe(true);
  });

  it('should have properly typed license data', () => {
    expect(mockLicense.id).toBe('1');
    expect(mockLicense.number).toBe('LIC123456');
    expect(mockLicense.type).toBe('main');
    expect(mockLicense.status).toBe('active');
    expect(mockLicense.issueDate).toBe('2020-01-01');
    expect(mockLicense.expiryDate).toBe('2025-01-01');
  });

  it('should allow creating custom mock data with overrides', () => {
    const customEmployee = createMockEmployee({
      firstName: 'سارة',
      lastName: 'أحمد',
      email: 'sara@example.com',
      monthlySalary: 1000
    });

    expect(customEmployee.firstName).toBe('سارة');
    expect(customEmployee.lastName).toBe('أحمد');
    expect(customEmployee.email).toBe('sara@example.com');
    expect(customEmployee.monthlySalary).toBe(1000);
    // Other fields should remain the same as the base mock
    expect(customEmployee.id).toBe('1');
    expect(customEmployee.nationality).toBe('مصري');
    expect(customEmployee.jobTitle).toBe('مدير مبيعات');
  });

  it('should allow creating custom company data with overrides', () => {
    const customCompany = createMockCompany({
      name: 'شركة قمة النيل',
      location: 'الجهراء',
      totalEmployees: 50,
      industryType: 'أقمشة'
    });

    expect(customCompany.name).toBe('شركة قمة النيل');
    expect(customCompany.location).toBe('الجهراء');
    expect(customCompany.totalEmployees).toBe(50);
    expect(customCompany.industryType).toBe('أقمشة');
    // Other fields should remain the same as the base mock
    expect(customCompany.id).toBe('1');
    expect(customCompany.commercialFileNumber).toBe('123456');
    expect(customCompany.isActive).toBe(true);
  });
}); 