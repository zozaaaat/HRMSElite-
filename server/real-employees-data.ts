import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load corrected employee data extracted from Excel files
let realEmployeesData: any = {};
try {
  const dataPath = path.join(__dirname, 'corrected-employees.json');
  if (fs.existsSync(dataPath)) {
    const rawData = fs.readFileSync(dataPath, 'utf8');
    realEmployeesData = JSON.parse(rawData);
    console.log('Loaded corrected employee data successfully');
  } else {
    console.log('Corrected employees file not found, trying original...');
    const fallbackPath = path.join(__dirname, 'extracted-employees.json');
    if (fs.existsSync(fallbackPath)) {
      const rawData = fs.readFileSync(fallbackPath, 'utf8');
      realEmployeesData = JSON.parse(rawData);
    }
  }
} catch (error) {
  console.error('Error loading real employees data:', error);
}

// Function to get employees for a specific company
export function getCompanyEmployees(companyId: string) {
  return realEmployeesData[companyId]?.employees || [];
}

// Function to get all employees
export function getAllEmployees() {
  const allEmployees: any[] = [];
  Object.values(realEmployeesData).forEach((company: any) => {
    if (company.employees) {
      allEmployees.push(...company.employees);
    }
  });
  return allEmployees;
}

// Function to get employee count for a company
export function getCompanyEmployeeCount(companyId: string) {
  return realEmployeesData[companyId]?.employees?.length || 0;
}

// Function to get real company data with actual employee counts
export function getRealCompanyData() {
  return {
    "1": {
      name: "شركة الاتحاد الخليجي للأقمشة",
      employeeCount: getCompanyEmployeeCount("1"),
      businessType: "أقمشة"
    },
    "2": {
      name: "شركة النيل الأزرق للمجوهرات", 
      employeeCount: getCompanyEmployeeCount("2"),
      businessType: "ذهب ومجوهرات"
    },
    "3": {
      name: "شركة قمة النيل للذهب",
      employeeCount: getCompanyEmployeeCount("3"),
      businessType: "ذهب ومجوهرات"
    },
    "4": {
      name: "شركة محمد أحمد إبراهيم",
      employeeCount: getCompanyEmployeeCount("4"),
      businessType: "عام"
    },
    "5": {
      name: "شركة ميلانو",
      employeeCount: getCompanyEmployeeCount("5"),
      businessType: "أزياء وخياطة"
    }
  };
}