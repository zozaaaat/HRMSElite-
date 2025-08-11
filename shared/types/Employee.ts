export type EmployeeStatus = 'active' | 'inactive' | 'on_leave' | 'terminated' | 'archived';
export type EmployeeType = 'citizen' | 'expatriate';
export type Gender = 'male' | 'female';
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';

export interface Employee {
  id: string;
  companyId: string;
  licenseId?: string;
  firstName: string;
  lastName: string;
  arabicName?: string;
  englishName?: string;
  passportNumber?: string;
  civilId?: string;
  nationality?: string;
  dateOfBirth?: string;
  gender?: Gender;
  maritalStatus?: MaritalStatus;
  employeeType: EmployeeType;
  status: EmployeeStatus;
  position?: string;
  department?: string;
  hireDate?: string;
  salary?: number;
  phone?: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  photoUrl?: string;
  documents?: string[]; // JSON string array
  skills?: string[]; // JSON string array
  notes?: string;
  fullName?: string;
  jobTitle?: string;
  residenceNumber?: string;
  residenceExpiry?: string;
  medicalInsurance?: string;
  bankAccount?: string;
  workPermitStart?: string;
  workPermitEnd?: string;
  isArchived: boolean;
  archiveReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEmployeeRequest {
  companyId: string;
  licenseId?: string;
  firstName: string;
  lastName: string;
  arabicName?: string;
  englishName?: string;
  passportNumber?: string;
  civilId?: string;
  nationality?: string;
  dateOfBirth?: string;
  gender?: Gender;
  maritalStatus?: MaritalStatus;
  employeeType?: EmployeeType;
  status?: EmployeeStatus;
  position?: string;
  department?: string;
  hireDate?: string;
  salary?: number;
  phone?: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  photoUrl?: string;
  documents?: string[];
  skills?: string[];
  notes?: string;
  fullName?: string;
  jobTitle?: string;
  residenceNumber?: string;
  residenceExpiry?: string;
  medicalInsurance?: string;
  bankAccount?: string;
  workPermitStart?: string;
  workPermitEnd?: string;
}

export interface UpdateEmployeeRequest {
  licenseId?: string;
  firstName?: string;
  lastName?: string;
  arabicName?: string;
  englishName?: string;
  passportNumber?: string;
  civilId?: string;
  nationality?: string;
  dateOfBirth?: string;
  gender?: Gender;
  maritalStatus?: MaritalStatus;
  employeeType?: EmployeeType;
  status?: EmployeeStatus;
  position?: string;
  department?: string;
  hireDate?: string;
  salary?: number;
  phone?: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  photoUrl?: string;
  documents?: string[];
  skills?: string[];
  notes?: string;
  fullName?: string;
  jobTitle?: string;
  residenceNumber?: string;
  residenceExpiry?: string;
  medicalInsurance?: string;
  bankAccount?: string;
  workPermitStart?: string;
  workPermitEnd?: string;
}

export interface EmployeeWithCompany extends Employee {
  company?: {
    id: string;
    name: string;
    logoUrl?: string;
  };
}

export interface EmployeeWithDetails extends Employee {
  company: {
    id: string;
    name: string;
    logoUrl?: string;
  };
  license?: {
    id: string;
    name: string;
    type: string;
    number: string;
    status: string;
    expiryDate?: string;
  };
  recentLeaves: Array<{
    id: string;
    type: string;
    status: string;
    startDate: string;
    endDate: string;
    days: number;
    reason?: string;
  }>;
  totalDeductions: number;
  totalViolations: number;
}

export interface EmployeeFilters {
  companyId?: string;
  status?: EmployeeStatus;
  employeeType?: EmployeeType;
  department?: string;
  position?: string;
  nationality?: string;
  isArchived?: boolean;
  search?: string;
}

export interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  onLeaveEmployees: number;
  terminatedEmployees: number;
  archivedEmployees: number;
  citizens: number;
  expatriates: number;
  averageSalary: number;
  departments: Array<{
    name: string;
    count: number;
  }>;
  nationalities: Array<{
    nationality: string;
    count: number;
  }>;
}
