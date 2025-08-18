/* eslint-env browser */
import {ApiService} from './api';

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'pending' | 'processed' | 'paid';
  paymentDate?: string;
  createdAt: string;
}

export interface CreatePayrollData {
  employeeId: string;
  month: string;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
}

export interface PayrollReport {
  totalEmployees: number;
  totalBasicSalary: number;
  totalAllowances: number;
  totalDeductions: number;
  totalNetSalary: number;
  records: PayrollRecord[];
}

export class PayrollService {

  static async getPayrollRecords (
    month?: string,
    year?: number,
    companyId?: string
  ): Promise<PayrollRecord[]> {

    const params = {
      ...(month && {month}),
      ...(year && {year}),
      ...(companyId && {companyId})
    };
    return ApiService.get<PayrollRecord[]>('/payroll', params);

  }

  static async getPayrollRecordById (id: string): Promise<PayrollRecord> {

    return ApiService.get<PayrollRecord>(`/payroll/${id}`);

  }

  static async createPayrollRecord (data: CreatePayrollData): Promise<PayrollRecord> {

    return ApiService.post<PayrollRecord>('/payroll', data);

  }

  static async updatePayrollRecord (id: string,
   data: Partial<CreatePayrollData>): Promise<PayrollRecord> {

    return ApiService.put<PayrollRecord>(`/payroll/${id}`, data);

  }

  static async deletePayrollRecord (id: string): Promise<void> {

    return ApiService.delete(`/payroll/${id}`);

  }

  static async processPayroll (month: string, year: number, companyId?: string): Promise<void> {

    const params = {month, year, ...(companyId && {companyId})};
    return ApiService.post('/payroll/process', params);

  }

  static async getPayrollReport (month: string,
   year: number,
   companyId?: string): Promise<PayrollReport> {

    const params = {month, year, ...(companyId && {companyId})};
    return ApiService.get<PayrollReport>('/payroll/report', params);

  }

  static async exportPayrollReport (month: string,
   year: number,
   companyId?: string): Promise<Blob> {

    const params = {month, year, ...(companyId && {companyId})};
    return ApiService.get<Blob>('/payroll/export', params);

  }

}
