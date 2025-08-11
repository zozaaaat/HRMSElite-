import type { 
  User, 
  Company, 
  Employee, 
  License, 
  EmployeeLeave, 
  Document, 
  EmployeeDeduction, 
  EmployeeViolation,
  CompanyWithStats,
  EmployeeWithDetails,
  LicenseWithDetails
} from '../../shared/schema';
import type {
  GovernmentForm,
  GovernmentFormRequest,
  DashboardStats,
  DashboardActivity,
  CompanyWithStats as ExtendedCompanyWithStats,
  EmployeeWithStats,
  AttendanceRecord,
  SearchableItem,
  AdvancedSearchFilters,
  AccountingIntegration,
  FieldMapping,
  LeaveRequestData,
  AttendanceData
} from '../src/types/component-props';

// ===== USER MOCK DATA =====
export const mockUser: Partial<User> = {
  id: '1',
  email: 'ahmed@example.com',
  firstName: 'أحمد',
  lastName: 'محمد',
  profileImageUrl: null,
  role: 'company_manager',
  companyId: '1',
  permissions: '[]',
  isActive: true,
  sub: null,
  claims: null,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-12-01'),
};

export const mockAdminUser: Partial<User> = {
  id: '2',
  email: 'admin@example.com',
  firstName: 'مدير',
  lastName: 'النظام',
  profileImageUrl: null,
  role: 'super_admin',
  companyId: null,
  permissions: '["all"]',
  isActive: true,
  sub: null,
  claims: null,
  createdAt: new Date('2022-01-01'),
  updatedAt: new Date('2023-12-01'),
};

export const mockWorkerUser: Partial<User> = {
  id: '3',
  email: 'worker@example.com',
  firstName: 'عامل',
  lastName: 'مثال',
  profileImageUrl: null,
  role: 'worker',
  companyId: '1',
  permissions: '["read"]',
  isActive: true,
  sub: null,
  claims: null,
  createdAt: new Date('2023-06-01'),
  updatedAt: new Date('2023-12-01'),
};

// ===== COMPANY MOCK DATA =====
export const mockCompany: Partial<Company> = {
  id: '1',
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
  industryType: 'مجوهرات',
  businessActivity: 'تجارة المجوهرات والأحجار الكريمة',
  location: 'مباركية',
  taxNumber: 'TAX123456',
  chambers: 'غرفة تجارة الكويت',
  partnerships: '[]',
  importExportLicense: 'IE123456',
  specialPermits: '[]',
  createdAt: new Date('2020-01-01'),
  updatedAt: new Date('2023-12-01'),
};

export const mockCompanyWithStats: Partial<CompanyWithStats> = {
  ...mockCompany,
  activeEmployees: 23,
  urgentAlerts: 2,
};

export const mockExtendedCompanyWithStats: Partial<ExtendedCompanyWithStats> = {
  ...mockCompany,
  employeeCount: 25,
  licenseCount: 3,
  companyStatus: 'active',
  industryType: 'مجوهرات',
  location: 'مباركية',
};

// ===== EMPLOYEE MOCK DATA =====
export const mockEmployee: Partial<Employee> = {
  id: '1',
  companyId: '1',
  firstName: 'أحمد',
  lastName: 'محمد علي',
  email: 'ahmed@nileblue.com',
  phone: '+96512345678',
  address: 'شارع السلام، الكويت',
  nationality: 'مصري',
  passportNumber: 'A12345678',
  civilId: '123456789012',
  residenceNumber: 'R123456',
  jobTitle: 'مدير مبيعات',
  department: 'المبيعات',
  hireDate: '2021-03-15',
  salary: 800,
  employeeType: 'expatriate',
  status: 'active',
  emergencyContact: 'سارة أحمد',
  emergencyPhone: '+96598765432',
  bankAccount: 'KW123456789012345678901234',
  createdAt: new Date('2021-03-15'),
  updatedAt: new Date('2023-12-01'),
};

export const mockEmployeeWithDetails: Partial<EmployeeWithDetails> = {
  ...mockEmployee,
  company: mockCompany as Company,
  license: undefined,
  recentLeaves: [],
  totalDeductions: 0,
  totalViolations: 0,
};

export const mockEmployeeWithStats: Partial<EmployeeWithStats> = {
  ...mockEmployee,
  company: mockCompany as Company,
  recentLeaves: [],
  totalDeductions: 0,
  totalViolations: 0,
  employmentStatus: 'active',
  department: 'المبيعات',
  jobTitle: 'مدير مبيعات',
  nationality: 'مصري',
};

// ===== DOCUMENT MOCK DATA =====
export const mockDocument: Partial<Document> = {
  id: '1',
  entityId: '1',
  entityType: 'employee',
  type: 'passport',
  name: 'جواز سفر أحمد محمد',
  fileName: 'passport-1.pdf',
  fileUrl: '/documents/passport-1.pdf',
  fileSize: 1024000,
  mimeType: 'application/pdf',
  description: 'جواز سفر ساري المفعول',
  uploadedBy: '2',
  isActive: true,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-12-01'),
};

// ===== LICENSE MOCK DATA =====
export const mockLicense: Partial<License> = {
  id: '1',
  companyId: '1',
  name: 'رخصة تجارية رئيسية',
  number: 'LIC123456',
  type: 'main',
  status: 'active',
  issueDate: '2020-01-01',
  expiryDate: '2025-01-01',
  issuingAuthority: 'إدارة التجارة',
  location: 'مباركية',
  description: 'رخصة تجارية رئيسية',
  documents: '[]',
  isActive: true,
  createdAt: new Date('2020-01-01'),
  updatedAt: new Date('2023-12-01'),
};

export const mockLicenseWithDetails = {
  id: '1',
  companyId: '1',
  name: 'رخصة تجارية رئيسية',
  number: 'LIC123456',
  type: 'main',
  status: 'active',
  issueDate: '2020-01-01',
  expiryDate: '2025-01-01',
  issuingAuthority: 'إدارة التجارة',
  location: 'مباركية',
  description: 'رخصة تجارية رئيسية',
  isActive: true,
  createdAt: new Date('2020-01-01'),
  updatedAt: new Date('2023-12-01'),
  company: mockCompany as Company,
  employees: [mockEmployee as Employee],
  documents: [mockDocument as Document],
} as Partial<LicenseWithDetails>;

// ===== EMPLOYEE LEAVE MOCK DATA =====
export const mockEmployeeLeave: Partial<EmployeeLeave> = {
  id: '1',
  employeeId: '1',
  type: 'annual',
  startDate: '2024-01-15',
  endDate: '2024-01-20',
  days: 5,
  reason: 'إجازة سنوية',
  status: 'approved',
  approvedBy: '2',
  approvedAt: new Date('2024-01-10'),
  createdAt: new Date('2024-01-05'),
  updatedAt: new Date('2024-01-10'),
};

// ===== EMPLOYEE DEDUCTION MOCK DATA =====
export const mockEmployeeDeduction: Partial<EmployeeDeduction> = {
  id: '1',
  employeeId: '1',
  type: 'late',
  amount: 50,
  reason: 'خصم تأخير - تأخير 30 دقيقة',
  date: '2024-01-15',
  status: 'active',
  processedBy: '2',
  createdAt: new Date('2024-01-15'),
};

// ===== EMPLOYEE VIOLATION MOCK DATA =====
export const mockEmployeeViolation: Partial<EmployeeViolation> = {
  id: '1',
  employeeId: '1',
  type: 'absence',
  description: 'غياب بدون إذن - غياب يوم كامل بدون إشعار مسبق',
  date: '2024-01-10',
  severity: 'medium',
  reportedBy: '2',
  createdAt: new Date('2024-01-10'),
};

// ===== ATTENDANCE MOCK DATA =====
export const mockAttendanceRecord: AttendanceRecord = {
  id: '1',
  employeeId: '1',
  date: '2024-01-15',
  checkIn: '08:00',
  checkOut: '17:00',
  status: 'present',
  totalHours: 9,
  notes: 'حضور طبيعي',
};

export const mockAttendanceData: AttendanceData = {
  employeeId: '1',
  date: '2024-01-15',
  checkIn: '08:00',
  checkOut: '17:00',
  status: 'present',
};

// ===== LEAVE REQUEST MOCK DATA =====
export const mockLeaveRequestData: LeaveRequestData = {
  employeeId: '1',
  type: 'annual',
  startDate: '2024-02-01',
  endDate: '2024-02-05',
  days: 4,
  reason: 'إجازة سنوية',
};

// ===== GOVERNMENT FORM MOCK DATA =====
export const mockGovernmentForm: GovernmentForm = {
  id: '1',
  formNameArabic: 'طلب إجازة سنوية',
  formNameEnglish: 'Annual Leave Request',
  formType: 'leave_request',
  category: 'employee_forms',
  status: 'active',
  requiredDocuments: ['passport', 'residence'],
  submissionDate: new Date('2024-01-15'),
  description: 'نموذج طلب إجازة سنوية للموظفين',
  isActive: true,
};

export const mockGovernmentFormRequest: GovernmentFormRequest = {
  id: '1',
  formId: '1',
  companyId: '1',
  employeeId: '1',
  status: 'submitted',
  submittedAt: new Date('2024-01-15'),
  processedAt: undefined,
  notes: 'طلب جديد',
  documents: ['doc1.pdf', 'doc2.pdf'],
  company: mockCompany as Company,
  employee: mockEmployee as Employee,
};

// ===== DASHBOARD MOCK DATA =====
export const mockDashboardActivity: DashboardActivity = {
  id: '1',
  type: 'employee_added',
  title: 'تم إضافة موظف جديد',
  description: 'تم إضافة أحمد محمد إلى الشركة',
  timestamp: new Date('2024-01-15'),
  entityId: '1',
  entityType: 'employee',
};

export const mockDashboardStats: DashboardStats = {
  totalCompanies: 10,
  activeCompanies: 8,
  totalEmployees: 150,
  activeEmployees: 145,
  totalLicenses: 25,
  activeLicenses: 23,
  systemUsage: 85,
  recentActivity: [mockDashboardActivity],
};

// ===== SEARCHABLE ITEM MOCK DATA =====
export const mockSearchableItem: SearchableItem = {
  id: '1',
  type: 'employee',
  name: 'أحمد محمد علي',
  title: 'مدير مبيعات',
  status: 'active',
  department: 'المبيعات',
  location: 'مباركية',
  address: 'شارع السلام، الكويت',
  hireDate: '2021-03-15',
  createdAt: '2021-03-15',
  nationality: 'مصري',
  jobTitle: 'مدير مبيعات',
  monthlySalary: 800,
};

// ===== ADVANCED SEARCH FILTERS MOCK DATA =====
export const mockAdvancedSearchFilters: AdvancedSearchFilters = {
  query: 'أحمد',
  status: ['active'],
  department: ['المبيعات'],
  location: ['مباركية'],
  dateRange: {
    from: new Date('2021-01-01'),
    to: new Date('2024-12-31'),
  },
  salaryRange: {
    min: 500,
    max: 1000,
  },
  nationality: ['مصري'],
  jobTitle: ['مدير مبيعات'],
};

// ===== ACCOUNTING INTEGRATION MOCK DATA =====
export const mockFieldMapping: FieldMapping = {
  id: '1',
  sourceField: 'employee_name',
  targetField: 'full_name',
  fieldType: 'string',
  isRequired: true,
  defaultValue: '',
  hrmsField: 'firstName',
  system: 'hrms',
  accountingField: 'employee_name',
  mapped: true,
};

export const mockAccountingIntegration: AccountingIntegration = {
  id: '1',
  name: 'QuickBooks Integration',
  type: 'accounting',
  status: 'connected',
  lastSync: new Date('2024-01-15'),
  connectionHealth: 'excellent',
  syncFrequency: 'daily',
  dataTypes: ['employees', 'payroll', 'attendance'],
  config: {
    apiKey: 'test_key',
    companyId: 'test_company',
  },
  mapping: [mockFieldMapping],
};

// ===== ARRAYS OF MOCK DATA =====
export const mockUsers: Partial<User>[] = [mockUser, mockAdminUser, mockWorkerUser];
export const mockCompanies: Partial<Company>[] = [mockCompany];
export const mockEmployees: Partial<Employee>[] = [mockEmployee];
export const mockLicenses: Partial<License>[] = [mockLicense];
export const mockEmployeeLeaves: Partial<EmployeeLeave>[] = [mockEmployeeLeave];
export const mockDocuments: Partial<Document>[] = [mockDocument];
export const mockEmployeeDeductions: Partial<EmployeeDeduction>[] = [mockEmployeeDeduction];
export const mockEmployeeViolations: Partial<EmployeeViolation>[] = [mockEmployeeViolation];
export const mockAttendanceRecords: AttendanceRecord[] = [mockAttendanceRecord];
export const mockGovernmentForms: GovernmentForm[] = [mockGovernmentForm];
export const mockGovernmentFormRequests: GovernmentFormRequest[] = [mockGovernmentFormRequest];
export const mockDashboardActivities: DashboardActivity[] = [mockDashboardActivity];
export const mockSearchableItems: SearchableItem[] = [mockSearchableItem];
export const mockAccountingIntegrations: AccountingIntegration[] = [mockAccountingIntegration];

// ===== TEST UTILITIES =====
export const createMockUser = (overrides: Partial<User> = {}): Partial<User> => ({
  ...mockUser,
  ...overrides,
});

export const createMockCompany = (overrides: Partial<Company> = {}): Partial<Company> => ({
  ...mockCompany,
  ...overrides,
});

export const createMockEmployee = (overrides: Partial<Employee> = {}): Partial<Employee> => ({
  ...mockEmployee,
  ...overrides,
});

export const createMockLicense = (overrides: Partial<License> = {}): Partial<License> => ({
  ...mockLicense,
  ...overrides,
});

export const createMockEmployeeLeave = (overrides: Partial<EmployeeLeave> = {}): Partial<EmployeeLeave> => ({
  ...mockEmployeeLeave,
  ...overrides,
});

export const createMockDocument = (overrides: Partial<Document> = {}): Partial<Document> => ({
  ...mockDocument,
  ...overrides,
}); 