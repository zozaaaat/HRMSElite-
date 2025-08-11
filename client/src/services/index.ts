// Services index file
// Export all service functions from this central location

export * from './api';

// Explicit re-exports to avoid conflicting `Company` symbols
export { AuthService } from './auth';
export type { User, AuthResponse, LoginCredentials, Company as AuthCompany } from './auth';

export * from './employee';

export { CompanyService } from './company';
export type { Company, CreateCompanyData, UpdateCompanyData } from './company';

export * from './payroll';
export * from './attendance';
export * from './documents';
export * from './notifications';
