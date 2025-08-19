import type { Express, Request, Response } from 'express';
import { storage } from '../../models/storage';
import { log } from '../../utils/logger';
import {
  insertEmployeeSchema,
  insertEmployeeLeaveSchema,
  insertEmployeeDeductionSchema,
  insertEmployeeViolationSchema,
  InsertEmployee
} from '@shared/schema';
import { isAuthenticated, requireRole } from '../../middleware/auth';
import {
  createErrorResponse,
  createSuccessResponse,
  createPaginatedResponse,
  extractPaginationParams,
  paginationMiddleware
} from '../../middleware/api-versioning';
import { generateETag, setETagHeader, matchesIfMatchHeader } from '../../utils/etag';

export function registerEmployeeRoutes(app: Express) {
  // Unified employee handler for both /api/v1/employees and /api/v1/companies/:companyId/employees
  const unifiedEmployeeHandler = async (req: Request, res: Response) => {
    try {
      const { companyId } = req.params;
      const _includeArchived = req.query.archived === 'true';
      const { page, pageSize } = extractPaginationParams(req);

      log.debug(`Unified employee handler called - companyId: ${companyId ?? "all"}`);

      // Mock data for development environment
      if (process.env.NODE_ENV === 'development') {
        const allMockEmployees = [
          {
            'id': 'emp-1',
            'fullName': 'أحمد محمد علي',
            'position': 'مهندس برمجيات',
            'department': 'تكنولوجيا المعلومات',
            'salary': 3500,
            'status': 'active',
            'hireDate': '2023-01-15',
            'companyId': 'company-1'
          },
          {
            'id': 'emp-2',
            'fullName': 'فاطمة سالم أحمد',
            'position': 'محاسبة',
            'department': 'المالية',
            'salary': 2800,
            'status': 'active',
            'hireDate': '2022-08-20',
            'companyId': 'company-1'
          },
          {
            'id': 'emp-3',
            'fullName': 'محمد عبدالله',
            'position': 'مشرف مبيعات',
            'department': 'المبيعات',
            'salary': 3200,
            'status': 'active',
            'hireDate': '2023-03-10',
            'companyId': 'company-1'
          },
          {
            'id': 'emp-4',
            'fullName': 'سارة أحمد عبدالله',
            'position': 'مهندسة تصميم',
            'department': 'التصميم',
            'salary': 3100,
            'status': 'active',
            'hireDate': '2023-02-01',
            'companyId': 'company-2'
          },
          {
            'id': 'emp-5',
            'fullName': 'خالد محمود',
            'position': 'مسؤول موارد بشرية',
            'department': 'الموارد البشرية',
            'salary': 2900,
            'status': 'active',
            'hireDate': '2022-11-15',
            'companyId': 'company-2'
          }
        ];

        // Filter by company if specified
        let filteredEmployees = allMockEmployees;
        if (companyId) {
          filteredEmployees = allMockEmployees.filter(emp => emp.companyId === companyId);
        }

        // Apply pagination
        const total = filteredEmployees.length;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

        const response = createPaginatedResponse(
          req,
          paginatedEmployees,
          total,
          page,
          pageSize,
          'Employees retrieved successfully'
        );

        res.json(response);
      } else {
        // Real database implementation would go here
        const employees = await storage.getEmployees(companyId);
        const response = createSuccessResponse(employees, 'Employees retrieved successfully');
        res.json(response);
      }

    } catch (error) {
      log.error('Error fetching employees:', error as Error);
      const errorResponse = createErrorResponse(
        'INTERNAL_ERROR',
        'Failed to fetch employees',
        { message: 'An error occurred while retrieving employees' },
        500
      );
      res.status(errorResponse.statusCode).json(errorResponse.body);
    }
  };

  // Get all employees with pagination
  app.get('/api/v1/employees',
    isAuthenticated,
    paginationMiddleware,
    unifiedEmployeeHandler
  );

  // Get employees by company with pagination
  app.get('/api/v1/companies/:companyId/employees',
    isAuthenticated,
    paginationMiddleware,
    unifiedEmployeeHandler
  );

  // Create new employee
  app.post('/api/v1/employees',
    isAuthenticated,
    requireRole(['admin', 'hr_manager']),
    async (req: Request, res: Response) => {
      try {
        const employeeData = {
          ...req.body,
          'createdBy': req.user?.sub,
          'createdAt': new Date(),
          'status': 'active'
        };

        const result = insertEmployeeSchema.safeParse(employeeData);
        if (!result.success) {
          const errorResponse = createErrorResponse(
            'VALIDATION_ERROR',
            'Invalid employee data',
            {
              details: result.error.issues,
              message: 'Employee data validation failed'
            },
            400
          );
          return res.status(errorResponse.statusCode).json(errorResponse.body);
        }

        const employee = await storage.createEmployee(result.data);
        const response = createSuccessResponse(employee, 'Employee created successfully');
        res.status(201).json(response);

      } catch (error) {
        log.error('Error creating employee:', error as Error);
        const errorResponse = createErrorResponse(
          'INTERNAL_ERROR',
          'Failed to create employee',
          { message: 'An error occurred while creating the employee' },
          500
        );
        res.status(errorResponse.statusCode).json(errorResponse.body);
      }
    }
  );

  // Get employee by ID
  app.get('/api/v1/employees/:id',
    isAuthenticated,
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        if (!id) {
          const errorResponse = createErrorResponse(
            'VALIDATION_ERROR',
            'Employee ID is required',
            { field: 'id', message: 'Employee ID parameter is missing' },
            400
          );
          return res.status(errorResponse.statusCode).json(errorResponse.body);
        }

        const employee = await storage.getEmployee(id);
        if (!employee) {
          const errorResponse = createErrorResponse(
            'NOT_FOUND',
            'Employee not found',
            { resource: 'employee', id },
            404
          );
          return res.status(errorResponse.statusCode).json(errorResponse.body);
        }

        const etag = generateETag(employee as any);
        setETagHeader(res, etag);
        const response = createSuccessResponse(employee, 'Employee retrieved successfully');
        res.json(response);

      } catch (error) {
        log.error('Error fetching employee:', error as Error);
        const errorResponse = createErrorResponse(
          'INTERNAL_ERROR',
          'Failed to fetch employee',
          { message: 'An error occurred while retrieving the employee' },
          500
        );
        res.status(errorResponse.statusCode).json(errorResponse.body);
      }
    }
  );

  // Update employee
  app.put('/api/v1/employees/:id',
    isAuthenticated,
    requireRole(['admin', 'hr_manager']),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        if (!id) {
          const errorResponse = createErrorResponse(
            'VALIDATION_ERROR',
            'Employee ID is required',
            { field: 'id', message: 'Employee ID parameter is missing' },
            400
          );
          return res.status(errorResponse.statusCode).json(errorResponse.body);
        }

        // Precondition: require If-Match
        const ifMatch = req.headers['if-match'];
        const current = await storage.getEmployee(id);
        if (!current) {
          const notFound = createErrorResponse(
            'NOT_FOUND',
            'Employee not found',
            { resource: 'employee', id },
            404
          );
          return res.status(notFound.statusCode).json(notFound.body);
        }
        const currentEtag = generateETag(current as any);
        if (!matchesIfMatchHeader(ifMatch as any, currentEtag)) {
          const precond = createErrorResponse(
            'PRECONDITION_FAILED',
            'ETag mismatch. Resource was modified by another request.',
            { expected: currentEtag },
            412
          );
          return res.status(precond.statusCode).json(precond.body);
        }

        const updateData = {
          ...req.body,
          'updatedBy': req.user?.sub,
          'updatedAt': new Date()
        };

        const employee = await storage.updateEmployee(id, updateData);
        const newEtag = generateETag(employee as any);
        setETagHeader(res, newEtag);
        const response = createSuccessResponse(employee, 'Employee updated successfully');
        res.json(response);

      } catch (error) {
        log.error('Error updating employee:', error as Error);
        const errorResponse = createErrorResponse(
          'INTERNAL_ERROR',
          'Failed to update employee',
          { message: 'An error occurred while updating the employee' },
          500
        );
        res.status(errorResponse.statusCode).json(errorResponse.body);
      }
    }
  );

  // Delete employee
  app.delete('/api/v1/employees/:id',
    isAuthenticated,
    requireRole(['admin', 'hr_manager']),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        if (!id) {
          const errorResponse = createErrorResponse(
            'VALIDATION_ERROR',
            'Employee ID is required',
            { field: 'id', message: 'Employee ID parameter is missing' },
            400
          );
          return res.status(errorResponse.statusCode).json(errorResponse.body);
        }

        await storage.deleteEmployee(id);
        const response = createSuccessResponse({ id }, 'Employee deleted successfully');
        res.json(response);

      } catch (error) {
        log.error('Error deleting employee:', error as Error);
        const errorResponse = createErrorResponse(
          'INTERNAL_ERROR',
          'Failed to delete employee',
          { message: 'An error occurred while deleting the employee' },
          500
        );
        res.status(errorResponse.statusCode).json(errorResponse.body);
      }
    }
  );

  // Get employee leaves with pagination
  app.get('/api/v1/employees/:id/leaves',
    isAuthenticated,
    paginationMiddleware,
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const { page, pageSize } = extractPaginationParams(req);

        if (!id) {
          const errorResponse = createErrorResponse(
            'VALIDATION_ERROR',
            'Employee ID is required',
            { field: 'id', message: 'Employee ID parameter is missing' },
            400
          );
          return res.status(errorResponse.statusCode).json(errorResponse.body);
        }

        // Mock leave data
        const mockLeaves = [
          {
            'id': 'leave-1',
            'employeeId': id,
            'employeeName': 'أحمد محمد علي',
            'type': 'annual',
            'startDate': '2025-02-10',
            'endDate': '2025-02-12',
            'days': 3,
            'reason': 'إجازة شخصية',
            'status': 'approved',
            'appliedDate': '2025-01-28T10:30:00.000Z'
          }
        ];

        const total = mockLeaves.length;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedLeaves = mockLeaves.slice(startIndex, endIndex);

        const response = createPaginatedResponse(
          req,
          paginatedLeaves,
          total,
          page,
          pageSize,
          'Employee leaves retrieved successfully'
        );

        res.json(response);

      } catch (error) {
        log.error('Error fetching employee leaves:', error as Error);
        const errorResponse = createErrorResponse(
          'INTERNAL_ERROR',
          'Failed to fetch employee leaves',
          { message: 'An error occurred while retrieving employee leaves' },
          500
        );
        res.status(errorResponse.statusCode).json(errorResponse.body);
      }
    }
  );

  // Create employee leave
  app.post('/api/v1/employees/:id/leaves',
    isAuthenticated,
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        if (!id) {
          const errorResponse = createErrorResponse(
            'VALIDATION_ERROR',
            'Employee ID is required',
            { field: 'id', message: 'Employee ID parameter is missing' },
            400
          );
          return res.status(errorResponse.statusCode).json(errorResponse.body);
        }

        const leaveData = {
          ...req.body,
          'employeeId': id,
          'appliedBy': req.user?.sub,
          'appliedDate': new Date(),
          'status': 'pending'
        };

        const result = insertEmployeeLeaveSchema.safeParse(leaveData);
        if (!result.success) {
          const errorResponse = createErrorResponse(
            'VALIDATION_ERROR',
            'Invalid leave data',
            {
              details: result.error.issues,
              message: 'Leave data validation failed'
            },
            400
          );
          return res.status(errorResponse.statusCode).json(errorResponse.body);
        }

        const leave = await storage.createEmployeeLeave(result.data);
        const response = createSuccessResponse(leave, 'Leave request created successfully');
        res.status(201).json(response);

      } catch (error) {
        log.error('Error creating employee leave:', error as Error);
        const errorResponse = createErrorResponse(
          'INTERNAL_ERROR',
          'Failed to create leave request',
          { message: 'An error occurred while creating the leave request' },
          500
        );
        res.status(errorResponse.statusCode).json(errorResponse.body);
      }
    }
  );

  // Get employee deductions with pagination
  app.get('/api/v1/employees/:id/deductions',
    isAuthenticated,
    paginationMiddleware,
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const { page, pageSize } = extractPaginationParams(req);

        if (!id) {
          const errorResponse = createErrorResponse(
            'VALIDATION_ERROR',
            'Employee ID is required',
            { field: 'id', message: 'Employee ID parameter is missing' },
            400
          );
          return res.status(errorResponse.statusCode).json(errorResponse.body);
        }

        // Mock deduction data
        const mockDeductions = [
          {
            'id': 'deduction-1',
            'employeeId': id,
            'employeeName': 'أحمد محمد علي',
            'type': 'salary_advance',
            'amount': 500,
            'reason': 'سلفة راتب',
            'date': '2025-01-15',
            'status': 'active'
          }
        ];

        const total = mockDeductions.length;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedDeductions = mockDeductions.slice(startIndex, endIndex);

        const response = createPaginatedResponse(
          req,
          paginatedDeductions,
          total,
          page,
          pageSize,
          'Employee deductions retrieved successfully'
        );

        res.json(response);

      } catch (error) {
        log.error('Error fetching employee deductions:', error as Error);
        const errorResponse = createErrorResponse(
          'INTERNAL_ERROR',
          'Failed to fetch employee deductions',
          { message: 'An error occurred while retrieving employee deductions' },
          500
        );
        res.status(errorResponse.statusCode).json(errorResponse.body);
      }
    }
  );

  // Create employee deduction
  app.post('/api/v1/employees/:id/deductions',
    isAuthenticated,
    requireRole(['admin', 'hr_manager', 'finance_manager']),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        if (!id) {
          const errorResponse = createErrorResponse(
            'VALIDATION_ERROR',
            'Employee ID is required',
            { field: 'id', message: 'Employee ID parameter is missing' },
            400
          );
          return res.status(errorResponse.statusCode).json(errorResponse.body);
        }

        const deductionData = {
          ...req.body,
          'employeeId': id,
          'createdBy': req.user?.sub,
          'createdAt': new Date(),
          'status': 'active'
        };

        const result = insertEmployeeDeductionSchema.safeParse(deductionData);
        if (!result.success) {
          const errorResponse = createErrorResponse(
            'VALIDATION_ERROR',
            'Invalid deduction data',
            {
              details: result.error.issues,
              message: 'Deduction data validation failed'
            },
            400
          );
          return res.status(errorResponse.statusCode).json(errorResponse.body);
        }

        const deduction = await storage.createEmployeeDeduction(result.data);
        const response = createSuccessResponse(deduction, 'Deduction created successfully');
        res.status(201).json(response);

      } catch (error) {
        log.error('Error creating employee deduction:', error as Error);
        const errorResponse = createErrorResponse(
          'INTERNAL_ERROR',
          'Failed to create deduction',
          { message: 'An error occurred while creating the deduction' },
          500
        );
        res.status(errorResponse.statusCode).json(errorResponse.body);
      }
    }
  );

  // Get employee violations with pagination
  app.get('/api/v1/employees/:id/violations',
    isAuthenticated,
    paginationMiddleware,
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const { page, pageSize } = extractPaginationParams(req);

        if (!id) {
          const errorResponse = createErrorResponse(
            'VALIDATION_ERROR',
            'Employee ID is required',
            { field: 'id', message: 'Employee ID parameter is missing' },
            400
          );
          return res.status(errorResponse.statusCode).json(errorResponse.body);
        }

        // Mock violation data
        const mockViolations = [
          {
            'id': 'violation-1',
            'employeeId': id,
            'employeeName': 'أحمد محمد علي',
            'type': 'late_arrival',
            'description': 'تأخر في الوصول للعمل',
            'date': '2025-01-20',
            'severity': 'minor',
            'status': 'active'
          }
        ];

        const total = mockViolations.length;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedViolations = mockViolations.slice(startIndex, endIndex);

        const response = createPaginatedResponse(
          req,
          paginatedViolations,
          total,
          page,
          pageSize,
          'Employee violations retrieved successfully'
        );

        res.json(response);

      } catch (error) {
        log.error('Error fetching employee violations:', error as Error);
        const errorResponse = createErrorResponse(
          'INTERNAL_ERROR',
          'Failed to fetch employee violations',
          { message: 'An error occurred while retrieving employee violations' },
          500
        );
        res.status(errorResponse.statusCode).json(errorResponse.body);
      }
    }
  );

  // Create employee violation
  app.post('/api/v1/employees/:id/violations',
    isAuthenticated,
    requireRole(['admin', 'hr_manager', 'supervisor']),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        if (!id) {
          const errorResponse = createErrorResponse(
            'VALIDATION_ERROR',
            'Employee ID is required',
            { field: 'id', message: 'Employee ID parameter is missing' },
            400
          );
          return res.status(errorResponse.statusCode).json(errorResponse.body);
        }

        const violationData = {
          ...req.body,
          'employeeId': id,
          'reportedBy': req.user?.sub,
          'reportedAt': new Date(),
          'status': 'active'
        };

        const result = insertEmployeeViolationSchema.safeParse(violationData);
        if (!result.success) {
          const errorResponse = createErrorResponse(
            'VALIDATION_ERROR',
            'Invalid violation data',
            {
              details: result.error.issues,
              message: 'Violation data validation failed'
            },
            400
          );
          return res.status(errorResponse.statusCode).json(errorResponse.body);
        }

        const violation = await storage.createEmployeeViolation(result.data);
        const response = createSuccessResponse(violation, 'Violation recorded successfully');
        res.status(201).json(response);

      } catch (error) {
        log.error('Error creating employee violation:', error as Error);
        const errorResponse = createErrorResponse(
          'INTERNAL_ERROR',
          'Failed to record violation',
          { message: 'An error occurred while recording the violation' },
          500
        );
        res.status(errorResponse.statusCode).json(errorResponse.body);
      }
    }
  );
}
