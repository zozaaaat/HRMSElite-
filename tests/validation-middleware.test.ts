import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validateInput } from '../server/middleware/validateInput';
import { insertEmployeeSchema } from '../shared/schema';
import { sanitizeHtmlString } from '../server/utils/sanitize';

// Type declarations for expect matchers to resolve TypeScript strict mode issues
declare global {
  namespace jest {
    interface Matchers<R> {
      stringContaining(str: string): R;
    }
  }
}

interface EmployeeData {
  firstName: string;
  lastName: string;
  position?: string;
  department?: string;
  salary?: number;
  status?: string;
  hireDate?: string;
  companyId?: string;
}

interface LeaveRequest {
  employeeId: string;
  leaveType: 'annual' | 'sick' | 'maternity' | 'emergency' | 'unpaid';
  startDate: string;
  endDate: string;
  reason: string;
  notes?: string;
}

// Mock Express objects
const createMockRequest = (body: Record<string, unknown> = {}, query: Record<string, unknown> = {}, params: Record<string, unknown> = {}) => ({
  body,
  query,
  params,
  path: '/test',
  method: 'POST',
  ip: '127.0.0.1'
} as Request);

const createMockResponse = () => {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const createMockNext = () => vi.fn() as NextFunction;

describe('Validation Middleware', () => {
  let mockReq: Request;
  let mockRes: Response;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = createMockRequest();
    mockRes = createMockResponse();
    mockNext = createMockNext();
  });

  describe('validate (body validation)', () => {
    it('should pass validation for valid employee data', () => {
      const validEmployeeData: EmployeeData = {
        firstName: "أحمد",
        lastName: "محمد علي",
        position: "مهندس برمجيات",
        department: "تكنولوجيا المعلومات",
        salary: 3500,
        status: "active",
        hireDate: "2023-01-15",
        companyId: "company-1"
      };

      mockReq.body = validEmployeeData;
      const validateMiddleware = validateInput.body(insertEmployeeSchema);
      
      validateMiddleware(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockReq.body).toEqual(validEmployeeData);
    });

    it('should reject invalid employee data', () => {
      const invalidEmployeeData = {
        firstName: "", // خطأ: اسم فارغ
        lastName: "", // خطأ: اسم العائلة فارغ
        salary: -1000, // خطأ: راتب سالب
        status: "invalid_status" // خطأ: حالة غير صحيحة
      };

      mockReq.body = invalidEmployeeData;
      const validateMiddleware = validateInput.body(insertEmployeeSchema);
      
      validateMiddleware(mockReq, mockRes, mockNext);
      
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      
      const responseCall = mockRes.json as ReturnType<typeof vi.fn>;
      expect(responseCall).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation failed',
          message: 'بيانات غير صحيحة'
        })
      );
      
      // Check that details array exists and contains validation errors
      const lastCall = responseCall.mock.calls[0][0] as { details: unknown[]; timestamp?: string };
      expect(lastCall).toHaveProperty('details');
      expect(Array.isArray(lastCall.details)).toBe(true);
      expect(lastCall.details.length).toBeGreaterThan(0);
    });

    it('should handle missing required fields', () => {
      const incompleteData = {
        firstName: "أحمد"
        // missing required fields like lastName, companyId
      };

      mockReq.body = incompleteData;
      const validateMiddleware = validateInput.body(insertEmployeeSchema);
      
      validateMiddleware(mockReq, mockRes, mockNext);
      
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateQuery (query validation)', () => {
    it('should pass validation for valid search query', () => {
      const searchSchema = z.object({
        query: z.string().min(1, "يجب إدخال نص للبحث"),
        page: z.number().min(1).optional().default(1),
        limit: z.number().min(1).max(100).optional().default(20)
      });

      mockReq.query = {
        query: "أحمد",
        page: 1,
        limit: 20
      };

      const validateMiddleware = validateInput.query(searchSchema);
      validateMiddleware(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockReq.query).toEqual({
        query: "أحمد",
        page: 1,
        limit: 20
      });
    });

    it('should reject invalid search query', () => {
      const searchSchema = z.object({
        query: z.string().min(1, "يجب إدخال نص للبحث"),
        limit: z.number().min(1).max(100, "عدد النتائج كبير جداً")
      });

      mockReq.query = {
        query: "", // خطأ: نص فارغ
        limit: 150 // خطأ: عدد كبير جداً
      };

      const validateMiddleware = validateInput.query(searchSchema);
      validateMiddleware(mockReq, mockRes, mockNext);
      
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Query validation failed',
          message: 'معاملات البحث غير صحيحة'
        })
      );
    });
  });

  describe('validateParams (params validation)', () => {
    it('should pass validation for valid params', () => {
      const paramsSchema = z.object({
        id: z.string().min(1, "معرف الموظف مطلوب")
      });

      mockReq.params = { id: "emp-123" };
      const validateMiddleware = validateInput.params(paramsSchema);
      
      validateMiddleware(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should reject invalid params', () => {
      const paramsSchema = z.object({
        id: z.string().min(1, "معرف الموظف مطلوب")
      });

      mockReq.params = { id: "" }; // خطأ: معرف فارغ
      const validateMiddleware = validateInput.params(paramsSchema);
      
      validateMiddleware(mockReq, mockRes, mockNext);
      
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Parameters validation failed',
          message: 'معاملات الرابط غير صحيحة'
        })
      );
    });
  });

  describe('validateMultiple (multiple sources validation)', () => {
    it('should pass validation for valid multiple sources', () => {
      const validations = {
        params: z.object({ id: z.string().min(1, "معرف الموظف مطلوب") }),
        body: z.object({
          status: z.enum(["active", "inactive", "on_leave", "terminated", "archived"]),
          reason: z.string().min(10, "سبب التغيير يجب أن يكون على الأقل 10 أحرف")
        })
      };

      mockReq.params = { id: "emp-123" };
      mockReq.body = {
        status: "active",
        reason: "تم تحديث الحالة بناءً على طلب الإدارة"
      };

      const validateMiddleware = validateInput.multiple(validations);
      validateMiddleware(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should reject when any source is invalid', () => {
      const validations = {
        params: z.object({ id: z.string().min(1, "معرف الموظف مطلوب") }),
        body: z.object({
          status: z.enum(["active", "inactive", "on_leave", "terminated", "archived"]),
          reason: z.string().min(10, "سبب التغيير يجب أن يكون على الأقل 10 أحرف")
        })
      };

      mockReq.params = { id: "emp-123" }; // صحيح
      mockReq.body = {
        status: "invalid_status", // خطأ: حالة غير صحيحة
        reason: "قصير" // خطأ: سبب قصير جداً
      };

      const validateMiddleware = validateInput.multiple(validations);
      validateMiddleware(mockReq, mockRes, mockNext);
      
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      
      const responseCall = mockRes.json as ReturnType<typeof vi.fn>;
      expect(responseCall).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation failed',
          message: 'بيانات غير صحيحة'
        })
      );
      
      // Check that details array exists and contains validation errors
      const lastCall = responseCall.mock.calls[0][0] as { details: unknown[] };
      expect(lastCall).toHaveProperty('details');
      expect(Array.isArray(lastCall.details)).toBe(true);
      expect(lastCall.details.length).toBeGreaterThan(0);
    });
  });

  describe('sanitizeInput (input sanitization)', () => {
    it('should sanitize malicious input', () => {
      const maliciousData = {
        fullName: "<script>alert('xss')</script>أحمد <b>محمد</b>",
        description: "<p onclick=\"alert('xss')\">وصف <i>عادي</i></p>"
      };

      mockReq.body = maliciousData;
      validateInput.sanitize(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const body = mockReq.body as typeof maliciousData;
      expect(body.fullName).not.toContain('<script>');
      expect(body.fullName).toContain('<b>محمد</b>');
      expect(body.description).not.toContain('onclick');
      expect(body.description).toContain('<i>عادي</i>');
    });

    it('should handle nested objects', () => {
      const nestedData = {
        employee: {
          name: "<script>alert('xss')</script>أحمد",
          details: {
            note: "<span style=\"color:red\" onclick=\"alert('xss')\">ملاحظة</span>"
          }
        }
      };

      mockReq.body = nestedData;
      validateInput.sanitize(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const body = mockReq.body as typeof nestedData;
      expect(body.employee.name).not.toContain('<script>');
      expect(body.employee.details.note).not.toContain('onclick');
      expect(body.employee.details.note).not.toContain('style=');
    });

    it('should handle arrays', () => {
      const arrayData = {
        tags: [
          'عادي',
          '<script>alert("xss")</script>ضار',
          '<b onclick="alert(1)">آمن؟</b>'
        ]
      };

      mockReq.body = arrayData;
      validateInput.sanitize(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const body = mockReq.body as typeof arrayData;
      expect(body.tags[1]).not.toContain('<script>');
      expect(body.tags[2]).toBe('<b>آمن؟</b>');
    });
  });

  describe('HTML field validation', () => {
    it('should sanitize rich HTML fields via schema transform', () => {
      const htmlSchema = z.object({
        content: z.string().transform(sanitizeHtmlString)
      });

      mockReq.body = {
        content: "<img src=x onerror=alert('xss')><b>مرحبا</b>"
      };
      const middleware = validateInput.body(htmlSchema);
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect((mockReq.body as { content: string }).content).toBe('<b>مرحبا</b>');
    });
  });

  describe('Custom validation schemas', () => {
    it('should validate employee search schema', () => {
      const employeeSearchSchema = z.object({
        query: z.string().min(1, "يجب إدخال نص للبحث").max(100, "نص البحث طويل جداً"),
        department: z.string().optional(),
        status: z.enum(["active", "inactive", "on_leave", "terminated", "archived"]).optional(),
        page: z.number().min(1, "رقم الصفحة يجب أن يكون أكبر من 0").optional().default(1),
        limit: z.number().min(1, "عدد النتائج يجب أن يكون أكبر من 0").max(100, "عدد النتائج كبير جداً").optional().default(20)
      });

      const validSearchData = {
        query: "أحمد",
        department: "تكنولوجيا المعلومات",
        status: "active",
        page: 1,
        limit: 20
      };

      mockReq.query = validSearchData;
      const validateMiddleware = validateInput.query(employeeSearchSchema);
      validateMiddleware(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.query).toEqual({
        query: "أحمد",
        department: "تكنولوجيا المعلومات",
        status: "active",
        page: 1,
        limit: 20
      });
    });

    it('should validate leave request schema', () => {
      const leaveRequestSchema = z.object({
        employeeId: z.string().min(1, "معرف الموظف مطلوب"),
        leaveType: z.enum(["annual", "sick", "maternity", "emergency", "unpaid"]),
        startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "تاريخ البداية يجب أن يكون بصيغة YYYY-MM-DD"),
        endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "تاريخ النهاية يجب أن يكون بصيغة YYYY-MM-DD"),
        reason: z.string().min(10, "سبب الإجازة يجب أن يكون على الأقل 10 أحرف").max(500, "سبب الإجازة طويل جداً"),
        notes: z.string().max(1000, "الملاحظات طويلة جداً").optional()
      });

      const validLeaveData: LeaveRequest = {
        employeeId: "emp-123",
        leaveType: "annual",
        startDate: "2024-01-15",
        endDate: "2024-01-20",
        reason: "إجازة سنوية مخططة مسبقاً",
        notes: "ملاحظات إضافية"
      };

      mockReq.body = validLeaveData;
      const validateMiddleware = validateInput.body(leaveRequestSchema);
      validateMiddleware(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should handle validation errors gracefully', () => {
      const invalidData = {
        fullName: "",
        salary: "not_a_number",
        status: "invalid_status"
      };

      mockReq.body = invalidData;
      const validateMiddleware = validateInput.body(insertEmployeeSchema);
      validateMiddleware(mockReq, mockRes, mockNext);
      
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      
      const responseCall = mockRes.json as ReturnType<typeof vi.fn>;
      expect(responseCall).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation failed',
          message: 'بيانات غير صحيحة'
        })
      );
      
      // Check that details array exists and contains validation errors
      const lastCall = responseCall.mock.calls[0][0] as { details: unknown[]; timestamp?: string };
      expect(lastCall).toHaveProperty('details');
      expect(Array.isArray(lastCall.details)).toBe(true);
      expect(lastCall.details.length).toBeGreaterThan(0);
      expect(lastCall).toHaveProperty('timestamp');
      expect(typeof lastCall.timestamp).toBe('string');
    });

    it('should handle internal errors', () => {
      // Mock a schema that throws an error
      const problematicSchema = z.object({
        test: z.string().transform(() => {
          throw new Error("Internal schema error");
        })
      });

      mockReq.body = { test: "value" };
      const validateMiddleware = validateInput.body(problematicSchema);
      validateMiddleware(mockReq, mockRes, mockNext);
      
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Internal validation error',
          message: 'خطأ في التحقق من البيانات'
        })
      );
    });
  });
}); 