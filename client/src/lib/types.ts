export interface Employee {
  id: string;
  name: string;
  fullName?: string;
  position?: string;
  jobTitle?: string;
  actualJobTitle?: string;
  department?: string;
  workLocation?: string;
  hireDate?: string;
  workPermitStart?: string;
  workPermitEnd?: string;
  contractType?: string;
  probationPeriod?: string;
  passportNumber?: string;
  passportExpiry?: string;
  residenceNumber?: string;
  residenceExpiry?: string;
  medicalInsurance?: string;
  bankAccount?: string;
  monthlySalary?: string;
  salary?: number;
  actualSalary?: string;
  companyId?: string;
  status?: string;
  email?: string;
  phone?: string;
}

export interface Company {
  id: string;
  name: string;
  commercialFileName?: string;
  industryType?: string;
  location?: string;
  employees?: number;
  licenses?: number;
  status?: string;
  industry?: string;
  establishedDate?: string;
}

export interface SyncStatus {
  status: 'completed' | 'running' | 'stopped';
  recordsProcessed?: number;
  errors?: number;
  warnings?: number;
  lastRun?: string;
  nextRun?: string;
  duration?: string;
}

export interface Integration {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'pending';
  type: string;
  lastSync?: string;
}

export interface Mapping {
  id: string;
  sourceField: string;
  targetField: string;
  type: string;
}

export interface Leave {
  id: string;
  employeeId?: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  days: number;
  reason?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Deduction {
  id: string;
  type: 'late' | 'absence' | 'loan' | 'insurance' | 'other';
  amount: number;
  date: string;
  description: string;
  status: 'active' | 'completed' | 'cancelled';
}

export interface User {
  id: string;
  role: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  isActive: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  companyId: string | null;
  permissions: unknown;
}
