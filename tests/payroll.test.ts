import { describe, it, expect } from 'vitest';
import { calculatePayroll, generatePayrollReport, createCustomReport } from '@shared/payroll';

describe('payroll utilities', () => {
  it('calculates net salary with deductions', () => {
    const result = calculatePayroll({ baseSalary: 1000, allowances: 200 }, [{ amount: 100 }, { amount: 50 }]);
    expect(result).toEqual({ grossSalary: 1200, totalDeductions: 150, netSalary: 1050 });
  });

  it('exports report in CSV format', () => {
    const csv = generatePayrollReport([{ grossSalary: 1000, totalDeductions: 100, netSalary: 900 }]);
    expect(csv.trim().split('\n')[1]).toBe('1000,100,900');
  });

  it('creates custom reports', () => {
    const data = [
      { grossSalary: 1000, totalDeductions: 100, netSalary: 900 },
      { grossSalary: 2000, totalDeductions: 200, netSalary: 1800 }
    ];
    const filtered = createCustomReport(data, r => r.netSalary > 1000);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].netSalary).toBe(1800);
  });
});
