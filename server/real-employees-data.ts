import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the complete extracted data
const allExtractedData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'all-extracted-data.json'), 'utf8')
);

// Real employees data extracted from Excel files
export const realEmployeesData = {
  "1": { // الاتحاد الخليجي
    employees: 51,
    licenses: 1,
    documents: 9,
    contracts: 1,
    certifications: 1
  },
  "2": { // النيل الأزرق
    employees: 57,
    licenses: 5,
    documents: 11,
    contracts: 1,
    certifications: 1
  },
  "3": { // قمة النيل
    employees: 38,
    licenses: 1,
    documents: 9,
    contracts: 1,
    certifications: 1
  },
  "4": { // محمد أحمد إبراهيم
    employees: 52,
    licenses: 1,
    documents: 8,
    contracts: 0,
    certifications: 1
  },
  "5": { // ميلانو
    employees: 75,
    licenses: 1,
    documents: 9,
    contracts: 1,
    certifications: 1
  }
};

export const totalStats = {
  totalEmployees: 273,
  totalLicenses: 9,
  totalDocuments: 45,
  totalContracts: 4,
  totalCertifications: 5,
  totalFiles: 79
};

// Get all employees from extracted data
export function getAllEmployees() {
  const allEmployees = [];
  Object.values(allExtractedData.companies).forEach((company: any) => {
    allEmployees.push(...company.employees);
  });
  return allEmployees.slice(0, 50); // Return first 50 for API
}

// Get employees for a specific company
export function getCompanyEmployees(companyId: string) {
  const company = allExtractedData.companies[companyId];
  return company ? company.employees : [];
}

// Get real company data with counts
export function getRealCompanyData(companyId: string) {
  const company = allExtractedData.companies[companyId];
  if (!company) return null;
  
  return {
    id: companyId,
    name: company.name,
    employeeCount: company.employees.length,
    licenseCount: company.licenses.length,
    documentCount: company.documents.length + company.contracts.length + company.certifications.length,
    employees: company.employees,
    licenses: company.licenses,
    documents: [...company.documents, ...company.contracts, ...company.certifications]
  };
}

// Get all licenses
export function getAllLicenses() {
  const allLicenses = [];
  Object.values(allExtractedData.companies).forEach((company: any) => {
    allLicenses.push(...company.licenses);
  });
  return allLicenses;
}

// Get all documents
export function getAllDocuments() {
  const allDocs = [];
  Object.values(allExtractedData.companies).forEach((company: any) => {
    allDocs.push(...company.documents);
    allDocs.push(...company.contracts);
    allDocs.push(...company.certifications);
  });
  return allDocs;
}

// Get company licenses
export function getCompanyLicenses(companyId: string) {
  const company = allExtractedData.companies[companyId];
  return company ? company.licenses : [];
}

// Get company documents
export function getCompanyDocuments(companyId: string) {
  const company = allExtractedData.companies[companyId];
  if (!company) return [];
  return [...company.documents, ...company.contracts, ...company.certifications];
}

// Get all requests
export function getAllRequests() {
  const allRequests = [];
  Object.values(allExtractedData.companies).forEach((company: any) => {
    allRequests.push(...company.requests);
  });
  return allRequests;
}

// Get company requests
export function getCompanyRequests(companyId: string) {
  const company = allExtractedData.companies[companyId];
  return company ? company.requests : [];
}