export interface UserWithCompanies {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  companies: Array<{
    id: string;
    companyId: string;
    role: string;
    permissions: string[];
    company: {
      id: string;
      name: string;
      logoUrl?: string;
    };
  }>;
}

export interface DashboardStats {
  totalCompanies: number;
  totalEmployees: number;
  totalLicenses: number;
  urgentAlerts: number;
}

export interface CompanyStats {
  totalEmployees: number;
  activeEmployees: number;
  pendingLeaves: number;
  urgentAlerts: number;
}

export interface RecentActivity {
  id: string;
  type: 'employee_added' | 'leave_approved' | 'document_uploaded' | 'license_expired';
  description: string;
  time: string;
  userId?: string;
  entityId?: string;
}

export interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  actionUrl?: string;
  createdAt: string;
}

export interface EmployeeFormData {
  civilId: string;
  fullName: string;
  nationality: string;
  type: 'citizen' | 'expatriate';
  jobTitle: string;
  actualJobTitle?: string;
  hireDate?: string;
  workPermitStart?: string;
  workPermitEnd?: string;
  monthlySalary?: number;
  actualSalary?: number;
  phone?: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  notes?: string;
  licenseId?: string;
}

export interface LeaveFormData {
  type: 'annual' | 'sick' | 'maternity' | 'emergency' | 'unpaid';
  startDate: string;
  endDate: string;
  days: number;
  reason?: string;
}

export interface LicenseFormData {
  licenseNumber: string;
  name: string;
  holderCivilId?: string;
  issuingAuthority?: string;
  type: 'main' | 'branch';
  issueDate?: string;
  expiryDate?: string;
  address?: string;
  description?: string;
}

export interface CompanyFormData {
  name: string;
  commercialFileNumber?: string;
  commercialFileName?: string;
  commercialFileStatus?: boolean;
  establishmentDate?: string;
  commercialRegistrationNumber?: string;
  classification?: string;
  department?: string;
  fileType?: string;
  legalEntity?: string;
  ownershipCategory?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}

export interface FilterOptions {
  status?: string[];
  nationality?: string[];
  type?: string[];
  jobTitle?: string[];
  licenseId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  pagination?: PaginationInfo;
  message?: string;
}

export interface ErrorResponse {
  message: string;
  code?: string;
  details?: any;
}
