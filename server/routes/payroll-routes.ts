import type {Express, Request} from 'express';
import logger from '../utils/logger';
import { isAuthenticated, requireRole } from '../middleware/auth';

// Define interface for payroll processing request body
interface PayrollProcessRequest {
  month?: number;
  year?: number;
}

export function registerPayrollRoutes (app: Express) {

  // Payroll routes use proper authentication middleware

  // Payroll routes
  app.get('/api/payroll/employee/:employeeId', isAuthenticated, async (req, res) => {

    try {

      const {employeeId} = req.params;
      const {month, year} = req.query;

      const payrollData = {
        employeeId,
        'month': month ?? new Date().getMonth() + 1,
        'year': year ?? new Date().getFullYear(),
        'basicSalary': 2500.00,
        'allowances': [
          {'type': 'housing', 'name': 'بدل سكن', 'amount': 500.00},
          {'type': 'transport', 'name': 'بدل مواصلات', 'amount': 200.00},
          {'type': 'meal', 'name': 'بدل وجبات', 'amount': 150.00}
        ],
        'deductions': [
          {'type': 'tax', 'name': 'ضريبة الدخل', 'amount': 125.00},
          {'type': 'insurance', 'name': 'التأمين الاجتماعي', 'amount': 175.00},
          {'type': 'loan', 'name': 'قرض شخصي', 'amount': 100.00}
        ],
        'overtime': {
          'hours': 10,
          'rate': 15.00,
          'amount': 150.00
        },
        'bonus': 0.00,
        'totalAllowances': 850.00,
        'totalDeductions': 400.00,
        'grossSalary': 3500.00,
        'netSalary': 3100.00,
        'paymentDate': '2025-01-31',
        'status': 'processed',
        'paymentMethod': 'bank_transfer',
        'bankAccount': '****1234',
        'notes': 'راتب شهر يناير 2025'
      };

      res.json(payrollData);

    } catch (error) {

      logger.error('Error fetching payroll data:', error instanceof Error ? error : new Error(String(error)));
      res.status(500).json({'message': 'Failed to fetch payroll data'});

    }

  });

  app.get('/api/payroll/company/:companyId',
   isAuthenticated,
   requireRole(['super_admin',
   'company_manager']),
   async (req,
   res) => {

    try {

      const {companyId} = req.params;
      const {month, year} = req.query;

      const payrollSummary = {
        companyId,
        'month': month ?? new Date().getMonth() + 1,
        'year': year ?? new Date().getFullYear(),
        'totalEmployees': 45,
        'processedEmployees': 43,
        'pendingEmployees': 2,
        'totalGrossSalary': 157500.00,
        'totalAllowances': 38250.00,
        'totalDeductions': 18000.00,
        'totalNetSalary': 139750.00,
        'summary': {
          'basicSalariesTotal': 119250.00,
          'allowancesTotal': 38250.00,
          'overtimeTotal': 6750.00,
          'bonusesTotal': 12000.00,
          'deductionsTotal': 18000.00,
          'taxesTotal': 5625.00,
          'insuranceTotal': 7875.00,
          'loansTotal': 4500.00
        },
        'payrollStatus': 'in_progress',
        'processedDate': null,
        'approvedBy': null,
        'paymentSchedule': 'monthly',
        'nextPaymentDate': '2025-01-31'
      };

      res.json(payrollSummary);

    } catch (error) {

      logger.error('Error fetching company payroll:', error instanceof Error ? error : new Error(String(error)));
      res.status(500).json({'message': 'Failed to fetch company payroll'});

    }

  });

  app.post('/api/payroll/process/:companyId',
   isAuthenticated,
   requireRole(['super_admin',
   'company_manager']),
   async (req: Request<{companyId: string}, unknown, PayrollProcessRequest>,
   res) => {

    try {

      const {companyId} = req.params;
      const {month, year} = req.body;

      // Mock payroll processing
      res.json({
        'success': true,
        'message': 'تم معالجة الرواتب بنجاح',
        companyId,
        month,
        year,
        'processedEmployees': 43,
        'totalAmount': 139750.00,
        'processedAt': new Date().toISOString(),
        'processedBy': req.user?.sub
      });

    } catch (error) {

      logger.error('Error processing payroll:', error instanceof Error ? error : new Error(String(error)));
      res.status(500).json({'message': 'Failed to process payroll'});

    }

  });

  app.get('/api/payroll/reports/:companyId',
   isAuthenticated,
   requireRole(['super_admin',
   'company_manager']),
   async (req,
   res) => {

    try {

      const {companyId: _companyId} = req.params;
      const {type, period: _period} = req.query;

      const reports = {
        'monthly': {
          'title': 'تقرير الرواتب الشهري',
          'data': [
            {
  'month': 'يناير', 'employees': 43, 'totalSalary': 139750.00, 'totalDeductions': 18000.00
},
            {
  'month': 'ديسمبر', 'employees': 41, 'totalSalary': 132500.00, 'totalDeductions': 17200.00
},
            {
  'month': 'نوفمبر', 'employees': 40, 'totalSalary': 128000.00, 'totalDeductions': 16800.00
}
          ]
        },
        'yearly': {
          'title': 'تقرير الرواتب السنوي',
          'data': [
            {
  'year': '2025', 'employees': 43, 'totalSalary': 1677000.00, 'totalDeductions': 216000.00
},
            {
  'year': '2024', 'employees': 38, 'totalSalary': 1520000.00, 'totalDeductions': 195200.00
}
          ]
        },
        'departmental': {
          'title': 'تقرير الرواتب حسب القسم',
          'data': [
            {'department': 'تقنية المعلومات', 'employees': 12, 'totalSalary': 48000.00},
            {'department': 'المبيعات', 'employees': 15, 'totalSalary': 37500.00},
            {'department': 'الإدارة', 'employees': 8, 'totalSalary': 32000.00},
            {'department': 'المحاسبة', 'employees': 8, 'totalSalary': 22250.00}
          ]
        }
      };

      res.json((reports as Record<string, unknown>)[type as string] ?? reports.monthly);

    } catch (error) {

      logger.error('Error fetching payroll reports:', error instanceof Error ? error : new Error(String(error)));
      res.status(500).json({'message': 'Failed to fetch payroll reports'});

    }

  });

  app.get('/api/payroll/taxes/:companyId',
   isAuthenticated,
   requireRole(['super_admin',
   'company_manager']),
   async (req,
   res) => {

    try {

      const {companyId} = req.params;

      const taxData = {
        companyId,
        'currentPeriod': {
          'month': new Date().getMonth() + 1,
          'year': new Date().getFullYear(),
          'totalTaxableIncome': 157500.00,
          'totalTaxDeducted': 5625.00,
          'socialInsurance': 7875.00,
          'otherDeductions': 4500.00
        },
        'quarterlyTax': {
          'q1': {'period': 'Q1 2025', 'taxable': 472500.00, 'tax': 16875.00},
          'q2': {'period': 'Q2 2024', 'taxable': 450000.00, 'tax': 15750.00},
          'q3': {'period': 'Q3 2024', 'taxable': 465000.00, 'tax': 16275.00},
          'q4': {'period': 'Q4 2024', 'taxable': 480000.00, 'tax': 16800.00}
        },
        'yearlyTax': {
          'year': 2024,
          'totalTaxableIncome': 1867500.00,
          'totalTaxDeducted': 65700.00,
          'effectiveRate': 3.52
        },
        'upcomingDeadlines': [
          {
  'type': 'quarterly_return', 'deadline': '2025-04-15', 'description': 'الإقرار الضريبي الربعي'
},
          {
  'type': 'annual_return', 'deadline': '2025-03-31', 'description': 'الإقرار الضريبي السنوي'
}
        ]
      };

      res.json(taxData);

    } catch (error) {

      logger.error('Error fetching tax data:', error instanceof Error ? error : new Error(String(error)));
      res.status(500).json({'message': 'Failed to fetch tax data'});

    }

  });

  app.get('/api/payroll/slips/:employeeId', isAuthenticated, async (req, res) => {

    try {

      const {employeeId} = req.params;
      const {year} = req.query;

      const payslips = [
        {
          'id': 'slip-2025-01',
          employeeId,
          'month': 1,
          'year': 2025,
          'grossSalary': 3500.00,
          'netSalary': 3100.00,
          'generatedDate': '2025-01-31',
          'downloadUrl': `/api/payroll/slips/${employeeId}/slip-2025-01/download`
        },
        {
          'id': 'slip-2024-12',
          employeeId,
          'month': 12,
          'year': 2024,
          'grossSalary': 3500.00,
          'netSalary': 3080.00,
          'generatedDate': '2024-12-31',
          'downloadUrl': `/api/payroll/slips/${employeeId}/slip-2024-12/download`
        }
      ];

      let filteredSlips = payslips;
      if (year) {

        filteredSlips = payslips.filter(slip => slip.year === parseInt(year as string));

      }

      res.json(filteredSlips);

    } catch (error) {

      logger.error('Error fetching pay slips:', error instanceof Error ? error : new Error(String(error)));
      res.status(500).json({'message': 'Failed to fetch pay slips'});

    }

  });

  app.get('/api/payroll/slips/:employeeId/:slipId/download', isAuthenticated, async (req, res) => {

    try {

      const {employeeId, slipId} = req.params;

      // In real app, generate and return PDF
      res.json({
        'message': 'Pay slip PDF would be generated and downloaded here',
        employeeId,
        slipId,
        'downloadUrl': `/files/payslips/${slipId}.pdf`
      });

    } catch (error) {

      logger.error('Error downloading pay slip:', error instanceof Error ? error : new Error(String(error)));
      res.status(500).json({'message': 'Failed to download pay slip'});

    }

  });

}
