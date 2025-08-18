export interface SalaryRecord {
  baseSalary: number;
  allowances?: number;
}

export interface Deduction {
  amount: number;
}

export interface PayrollResult {
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
}

export function calculatePayroll(salary: SalaryRecord, deductions: Deduction[] = []): PayrollResult {
  const grossSalary = salary.baseSalary + (salary.allowances ?? 0);
  const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
  const netSalary = grossSalary - totalDeductions;
  return { grossSalary, totalDeductions, netSalary };
}

export function generatePayrollReport(results: PayrollResult[]): string {
  const header = 'grossSalary,totalDeductions,netSalary';
  const rows = results.map(r => `${r.grossSalary},${r.totalDeductions},${r.netSalary}`);
  return [header, ...rows].join('\n');
}

export function generateChartData(results: PayrollResult[]) {
  return results.map((r, index) => ({
    period: index + 1,
    netSalary: r.netSalary
  }));
}

export function createCustomReport(results: PayrollResult[], filter: (r: PayrollResult) => boolean) {
  return results.filter(filter);
}
