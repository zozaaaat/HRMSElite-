import type {Company, Employee, License, DbUser, EmployeeLeave, Document} from '../../../shared/schema';
export type { Company };
import type { ReactNode } from 'react';

// Route Props Types
export interface RoleBasedDashboardProps {
  role: string;
}

// User and Authentication Types
export interface UserProps {
  user?: DbUser;
}

// Company Related Types
export interface CompanyCardProps {
  company: Company;
  onEdit?: (company: Company) => void;
  onDelete?: (companyId: string) => void;
  onViewDetails?: (companyId: string) => void;
}

export interface CompanyFormProps {
  editingCompany?: Company;
  onSubmit: (company: Partial<Company>) => void;
  onCancel: () => void;
}

export interface CompanyListProps {
  companies: Company[];
  onCompanySelect?: (company: Company) => void;
  onEdit?: (company: Company) => void;
  onDelete?: (companyId: string) => void;
}

// Employee Related Types
export interface EmployeeCardProps {
  employee: Employee;
  company?: Company;
  onEdit?: (employee: Employee) => void;
  onDelete?: (employeeId: string) => void;
  onViewDetails?: (employeeId: string) => void;
}

export interface EmployeeFormProps {
  editingEmployee?: Employee;
  companies: Company[];
  onSubmit: (employee: Partial<Employee>) => void;
  onCancel: () => void;
}

export interface EmployeeListProps {
  employees: Employee[];
  companies: Company[];
  onEmployeeSelect?: (employee: Employee) => void;
  onEdit?: (employee: Employee) => void;
  onDelete?: (employeeId: string) => void;
}

// License Related Types
export interface LicenseCardProps {
  license: License;
  company?: Company;
  onEdit?: (license: License) => void;
  onDelete?: (licenseId: string) => void;
  onViewDetails?: (licenseId: string) => void;
}

export interface LicenseFormProps {
  editingLicense?: License;
  companies: Company[];
  onSubmit: (license: Partial<License>) => void;
  onCancel: () => void;
}

// Leave Request Types
export interface LeaveRequestProps {
  leave: EmployeeLeave;
  employee?: Employee;
  onApprove?: (leaveId: string) => void;
  onReject?: (leaveId: string, reason: string) => void;
  onEdit?: (leave: EmployeeLeave) => void;
}

export interface LeaveRequestFormProps {
  editingLeave?: EmployeeLeave;
  employees: Employee[];
  onSubmit: (leave: Partial<EmployeeLeave>) => void;
  onCancel: () => void;
}

// Document Types
export interface DocumentCardProps {
  document: Document;
  employee?: Employee;
  company?: Company;
  onView?: (documentId: string) => void;
  onDownload?: (documentId: string) => void;
  onDelete?: (documentId: string) => void;
}

export interface DocumentFormProps {
  editingDocument?: Document;
  employees: Employee[];
  companies: Company[];
  onSubmit: (document: Partial<Document>) => void;
  onCancel: () => void;
}

// Search and Filter Types
export interface SearchFilterProps {
  companies: Company[];
  employees: Employee[];
  licenses: License[];
  onSearch: (query: string, filters: SearchFilters) => void;
  onClear: () => void;
}

export interface SearchFilters {
  type?: 'company' | 'employee' | 'license' | 'all';
  status?: string;
  companyId?: string;
  department?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface SearchResultProps {
  results: SearchResult[];
  onItemClick: (item: SearchResult) => void;
}

export interface SearchResult {
  id: string;
  type: 'company' | 'employee' | 'license';
  title: string;
  subtitle: string;
  description: string;
  status: string;
  relevance: number;
  data: Company | Employee | License;
}

// Dashboard Widget Types
export interface DashboardWidgetProps {
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon?: ReactNode;
  onClick?: () => void;
}

export interface ChartDataProps {
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  title: string;
  type: 'bar' | 'line' | 'pie' | 'doughnut';
}

// Form Types
export interface FormFieldProps {
  label: string;
  name: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea' | 'file';
  value: string | number | boolean | undefined;
  onChange: (value: string | number | boolean) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  disabled?: boolean;
}

// Modal Types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Table Types
export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  onRowClick?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  loading?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (value: unknown, item: T) => ReactNode;
  sortable?: boolean;
  width?: string;
}

// Notification Types
export interface NotificationProps {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Mutation Types
export interface MutationProps<T> {
  mutationFn: (data: T) => Promise<unknown>;
  onSuccess?: (data: unknown) => void;
  onError?: (error: unknown) => void;
}

// Filter Types
export interface FilterProps {
  filters: Record<string, unknown>;
  onFilterChange: (filters: Record<string, unknown>) => void;
  onClear: () => void;
}

// Advanced Search Types
export interface AdvancedSearchProps {
  companies: Company[];
  employees: Employee[];
  licenses: License[];
  onSearch: (query: string, filters: SearchFilters) => void;
  onClear: () => void;
}

export interface SearchResultsDisplayProps {
  results: SearchResult[];
  onItemClick: (item: SearchResult) => void;
  loading?: boolean;
}

// Attendance Types
export interface AttendanceProps {
  employeeId: string;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  status: 'present' | 'absent' | 'late' | 'on_leave';
  onCheckIn?: () => void;
  onCheckOut?: () => void;
}

// Payroll Types
export interface PayrollItemProps {
  employee: Employee;
  salary: number;
  deductions: number;
  bonuses: number;
  netSalary: number;
  period: string;
  onViewDetails: (employeeId: string) => void;
}

// Government Forms Types
export interface GovernmentFormProps {
  form: {
    id: string;
    name: string;
    type: string;
    status: string;
    requiredDocuments: string[];
    submissionDate?: Date;
  };
  onSubmit: (formData: Record<string, unknown>) => void;
  onView: (formId: string) => void;
}

// Accounting Integration Types
export interface AccountingIntegrationProps {
  integration: {
    id: string;
    name: string;
    type: string;
    status: 'connected' | 'disconnected' | 'pending';
    lastSync?: Date;
  };
  onConnect: (integrationId: string) => void;
  onDisconnect: (integrationId: string) => void;
  onConfigure: (integrationId: string) => void;
}

// ===== NEW INTERFACES FOR COMPONENTS USING 'ANY' TYPES =====

// Government Forms Extended Types
export interface GovernmentForm {
  id: string;
  formNameArabic?: string;
  formNameEnglish?: string;
  formType?: string;
  category?: string;
  status?: string;
  requiredDocuments?: string[];
  submissionDate?: Date;
  description?: string;
  isActive?: boolean;
  // Extended fields used by UI pages
  issuingAuthority?: string;
  fees?: string | number;
  processingTime?: string;
  validityPeriod?: string;
  lastUpdated?: string | Date;
}

export interface GovernmentFormRequest {
  id: string;
  formId: string;
  companyId: string;
  employeeId?: string;
  status: 'submitted' | 'processing' | 'completed' | 'rejected';
  submittedAt: Date;
  processedAt?: Date;
  notes?: string;
  documents?: string[];
  company?: Company;
  employee?: Employee;
  // Extended fields used by UI pages
  name?: string;
  requestType?: string;
  companyName?: string;
  submissionDate?: string | Date;
}

export interface GovernmentFormsProps {
  onFormSubmit?: (formData: Partial<GovernmentFormRequest>) => void;
  onRequestView?: (requestId: string) => void;
}

// Dashboard Extended Types
export interface DashboardStats {
  totalCompanies: number;
  activeCompanies: number;
  totalEmployees: number;
  activeEmployees: number;
  totalLicenses: number;
  activeLicenses: number;
  systemUsage: number;
  recentActivity: DashboardActivity[];
}

export interface DashboardActivity {
  id: string;
  type: 'company_created' | 'employee_added' | 'license_expired' | 'leave_requested';
  title: string;
  description: string;
  timestamp: Date;
  entityId?: string;
  entityType?: 'company' | 'employee' | 'license';
}

export interface CompanyWithStats extends Company {
  employeeCount?: number;
  licenseCount?: number;
  companyStatus?: 'active' | 'inactive' | 'pending';
}

export interface EmployeeWithStats extends Employee {
  company?: Company;
  recentLeaves?: EmployeeLeave[];
  totalDeductions?: number;
  totalViolations?: number;
  employmentStatus?: 'active' | 'inactive' | 'on_leave' | 'terminated';
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late' | 'on_leave';
  totalHours?: number;
  notes?: string;
}

// Advanced Search Extended Types
export interface SearchableItem {
  id: string;
  type: 'company' | 'employee' | 'license';
  name?: string;
  title?: string;
  status?: string;
  department?: string;
  location?: string;
  address?: string;
  hireDate?: string;
  createdAt?: string;
  issueDate?: string;
  nationality?: string;
  jobTitle?: string;
  monthlySalary?: number;
  commercialFileNumber?: string;
  number?: string;
}

export interface AdvancedSearchFilterProps {
  onFiltersChange: (filters: AdvancedSearchFilters) => void;
  onResultsChange: (results: SearchResult[]) => void;
  data: {
    companies: Company[];
    employees: Employee[];
    licenses: License[];
  };
}

export interface AdvancedSearchFilters {
  query: string;
  status: string[];
  department: string[];
  location: string[];
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  salaryRange: {
    min: number | null;
    max: number | null;
  };
  nationality: string[];
  jobTitle: string[];
}

// Accounting Integration Extended Types
export interface AccountingIntegration {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'pending';
  lastSync?: Date;
  connectionHealth?: string;
  syncFrequency?: string;
  dataTypes?: string[];
  config?: Record<string, unknown>;
  mapping?: FieldMapping[];
}

export interface FieldMapping {
  id: string;
  sourceField: string;
  targetField: string;
  fieldType: 'string' | 'number' | 'date' | 'boolean';
  isRequired: boolean;
  defaultValue?: string;
  hrmsField?: string;
  system?: string;
  accountingField?: string;
  mapped?: boolean;
}

// Leave Request Extended Types
export interface LeaveRequestData {
  employeeId: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason?: string;
}

// Attendance Extended Types
export interface AttendanceData {
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: string;
}

// Component Props for Specific Components
export interface RoleBasedDashboardComponentProps {
  userRole: 'super-admin' | 'company-manager' | 'admin-employee' | 'supervisor' | 'worker';
  companyId?: string;
  userId?: string;
}

export interface CompanyManagerDashboardProps {
  companyId: string;
}

export interface SupervisorDashboardProps {
  userId: string;
}

export interface WorkerDashboardProps {
  userId: string;
}

export interface InteractiveDashboardProps {
  userRole: string;
  companyId?: string;
  userId?: string;
}

export interface PDFReportsProps {
  companyId: string;
}

export interface SharedLayoutProps {
  children: ReactNode;
  user?: DbUser;
  userRole?: string;
  userName?: string;
  companyName?: string;
}

export interface LoginModalProps {
  company: Company;
  isOpen: boolean;
  onClose: () => void;
}

export interface EnhancedCompanyFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingCompany?: Company;
}

export interface EmployeesTableProps {
  employees: Employee[];
  companyId: string;
  showActions?: boolean;
}

export interface DocumentManagementProps {
  companyId: string;
  employeeId?: string;
}

export interface EmployeeOverviewProps {
  employee: Employee;
  company: Company;
}

export interface EmployeeJobInfoProps {
  employee: Employee;
  company: Company;
}

export interface CompanyDetailViewProps {
  company: Company;
  employees?: Employee[];
  licenses?: License[];
  onEdit?: (company: Company) => void;
  onDelete?: (companyId: string) => void;
}

// Generic Types for Components
export interface GenericListItem {
  id: string;
  [key: string]: unknown;
}

export interface GenericFilterOptions {
  [key: string]: string[] | number[] | Date[] | null;
}

export interface GenericSearchResult<T = unknown> {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  description: string;
  relevance: number;
  data: T;
}
