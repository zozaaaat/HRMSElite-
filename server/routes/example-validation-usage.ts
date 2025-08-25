import type {Express, Request, Response} from 'express';
import {z} from 'zod';
import {validateInput} from '../middleware/validateInput';
import {
  insertEmployeeSchema,
  insertCompanySchema,
  insertLicenseSchema,
  InsertEmployee,
  InsertCompany,
  InsertLicense
} from '../../shared/schema';
import {storage} from '../models/storage';
import {log} from '../utils/logger';

// Custom validation schemas for specific use cases
const employeeSearchSchema = z.object({
  'query': z.string().min(1, 'يجب إدخال نص للبحث').max(100, 'نص البحث طويل جداً'),
  'department': z.string().optional(),
  'status': z.enum(['active', 'inactive', 'on_leave', 'terminated', 'archived']).optional(),
  'companyId': z.string().optional(),
  'page': z.number().min(1, 'رقم الصفحة يجب أن يكون أكبر من 0').optional().default(1),
  'limit': z.number().min(1,
   'عدد النتائج يجب أن يكون أكبر من 0').max(100,
   'عدد النتائج كبير جداً').optional().default(20)
});

const employeeUpdateSchema = z.object({
  'fullName': z.string().min(2, 'الاسم يجب أن يكون على الأقل حرفين').max(100, 'الاسم طويل جداً'),
  'position': z.string().min(2, 'المنصب يجب أن يكون على الأقل حرفين').max(100, 'المنصب طويل جداً'),
  'department': z.string().min(2, 'القسم يجب أن يكون على الأقل حرفين').max(100, 'القسم طويل جداً'),
  'salary': z.number().min(0, 'الراتب يجب أن يكون موجب'),
  'status': z.enum(['active', 'inactive', 'on_leave', 'terminated', 'archived']),
  'hireDate': z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'تاريخ التوظيف يجب أن يكون بصيغة YYYY-MM-DD')
});

const companySearchSchema = z.object({
  'name': z.string().optional(),
  'industryType': z.string().optional(),
  'location': z.string().optional(),
  'isActive': z.boolean().optional(),
  'page': z.number().min(1).optional().default(1),
  'limit': z.number().min(1).max(100).optional().default(20)
});

const licenseSearchSchema = z.object({
  'type': z.enum(['main',
   'branch',
   'commercial',
   'industrial',
   'professional',
   'import_export',
   'tailoring',
   'fabric',
   'jewelry',
   'restaurant',
   'service']).optional(),
  
  'status': z.enum(['active', 'expired', 'pending']).optional(),
  'companyId': z.string().optional(),
  'page': z.number().min(1).optional().default(1),
  'limit': z.number().min(1).max(100).optional().default(20)
});

// Updated document upload schema to match actual table requirements
const documentUploadSchema = z.object({
  'entityId': z.string().min(1, 'معرف الكيان مطلوب'),
  'entityType': z.enum(['employee', 'company', 'license'], {
    'errorMap': () => ({'message': 'نوع الكيان يجب أن يكون: employee, company, أو license'})
  }),
  'name': z.string().min(1, 'اسم المستند مطلوب').max(200, 'اسم المستند طويل جداً'),
  'type': z.enum(['passport',
   'residence',
   'license',
   'contract',
   'certificate',
   'civil_id',
   'work_permit',
   'health_certificate',
   'establishment_document',
   'tax_certificate',
   'chamber_membership',
   'import_export_license',
   'fire_permit',
   'municipality_permit',
   'other']),
  'fileName': z.string().min(1, 'اسم الملف مطلوب'),
  'fileUrl': z.string().min(1, 'رابط الملف مطلوب'),
  'uploadedBy': z.string().min(1, 'معرف المستخدم مطلوب'),
  'description': z.string().max(500, 'وصف المستند طويل جداً').optional(),
  'tags': z.string().optional() // JSON string as stored in database
});

// Updated leave request schema to match actual table requirements
const leaveRequestSchema = z.object({
  'employeeId': z.string().min(1, 'معرف الموظف مطلوب'),
  'type': z.enum(['annual', 'sick', 'maternity', 'emergency', 'unpaid']),
  'startDate': z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'تاريخ البداية يجب أن يكون بصيغة YYYY-MM-DD'),
  'endDate': z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'تاريخ النهاية يجب أن يكون بصيغة YYYY-MM-DD'),
  'days': z.number().min(1, 'عدد الأيام يجب أن يكون أكبر من 0'),
  'reason': z.string().min(10,
   'سبب الإجازة يجب أن يكون على الأقل 10 أحرف').max(500,
   'سبب الإجازة طويل جداً'),
  'notes': z.string().max(1000, 'الملاحظات طويلة جداً').optional()
});

export function registerExampleValidationRoutes (app: Express) {

  // Example 1: Employee creation with validation
  app.post('/api/employees',
    validateInput.sanitize, // Sanitize input first
    validateInput.body(insertEmployeeSchema), // Validate with Zod schema
    async (req: Request, res: Response) => {

      try {

        // Type assertion since req.body is validated by the middleware
        const employeeData = req.body as InsertEmployee;
        log.info('Creating new employee', {'employeeData': employeeData});

        // req.body is now validated and sanitized
        const newEmployee = await storage.createEmployee(employeeData);

        res.status(201).json({
          'message': 'تم إنشاء الموظف بنجاح',
          'employee': newEmployee
        });

      } catch (error) {

        log.error('Error creating employee', {
  'error': error instanceof Error ? error.message : 'Unknown error'
});
        res.status(500).json({
          'message': 'فشل في إنشاء الموظف',
          'error': error instanceof Error ? error.message : 'Unknown error'
        });

      }

    }
  );

  // Example 2: Employee search with query validation
  app.get('/api/employees/search',
    validateInput.query(employeeSearchSchema),
    async (req: Request, res: Response) => {

      try {

        // req.query is now validated
        const {query, department, status, companyId, page, limit} = req.query;

        log.info('Searching employees', {
          query, department, status, companyId, page, limit
        });

        const employees = await storage.searchEmployees({
          'search': query as string,
          'department': department as string,
          'status': status as string,
          'companyId': companyId as string
        });

        res.json({
          employees,
          'pagination': {
            'page': Number(page) || 1,
            'limit': Number(limit) || 20,
            'total': employees.length
          }
        });

      } catch (error) {

        log.error('Error searching employees', {
  'error': error instanceof Error ? error.message : 'Unknown error'
});
        res.status(500).json({'message': 'فشل في البحث عن الموظفين'});

      }

    }
  );

  // Example 3: Employee update with custom validation
  app.put('/api/employees/:id',
    validateInput.params(z.object({'id': z.string().min(1, 'معرف الموظف مطلوب')})),
    validateInput.body(employeeUpdateSchema),
    async (req: Request, res: Response) => {

      try {

        const {id} = req.params; // Validated
        const updateData = req.body as z.infer<typeof employeeUpdateSchema>; // Validated and sanitized

        // Ensure id is not undefined
        if (!id) {
          return res.status(400).json({'message': 'معرف الموظف مطلوب'});
        }

        log.info('Updating employee', {id, updateData});

        const updatedEmployee = await storage.updateEmployee(id, updateData);

        res.json({
          'message': 'تم تحديث بيانات الموظف بنجاح',
          'employee': updatedEmployee
        });

      } catch (error) {

        log.error('Error updating employee', {
  'error': error instanceof Error ? error.message : 'Unknown error'
});
        res.status(500).json({'message': 'فشل في تحديث بيانات الموظف'});

      }

    }
  );

  // Example 4: Company creation with validation
  app.post('/api/companies',
    validateInput.sanitize,
    validateInput.body(insertCompanySchema),
    async (req: Request, res: Response) => {

      try {

        const companyData = req.body as InsertCompany;
        log.info('Creating new company', {'companyData': companyData});

        const newCompany = await storage.createCompany(companyData);

        res.status(201).json({
          'message': 'تم إنشاء الشركة بنجاح',
          'company': newCompany
        });

      } catch (error) {

        log.error('Error creating company', {
  'error': error instanceof Error ? error.message : 'Unknown error'
});
        res.status(500).json({'message': 'فشل في إنشاء الشركة'});

      }

    }
  );

  // Example 5: License creation with validation
  app.post('/api/licenses',
    validateInput.sanitize,
    validateInput.body(insertLicenseSchema),
    async (req: Request, res: Response) => {

      try {

        const licenseData = req.body as InsertLicense;
        log.info('Creating new license', {'licenseData': licenseData});

        const newLicense = await storage.createLicense(licenseData);

        res.status(201).json({
          'message': 'تم إنشاء الرخصة بنجاح',
          'license': newLicense
        });

      } catch (error) {

        log.error('Error creating license', {
  'error': error instanceof Error ? error.message : 'Unknown error'
});
        res.status(500).json({'message': 'فشل في إنشاء الرخصة'});

      }

    }
  );

  // Example 6: Document upload with validation
  app.post('/api/v1/documents',
    validateInput.sanitize,
    validateInput.body(documentUploadSchema),
    async (req: Request, res: Response) => {

      try {

        const documentData = req.body as z.infer<typeof documentUploadSchema>;
        log.info('Uploading document', {'documentData': documentData});

        const newDocument = await storage.createDocument(documentData);

        res.status(201).json({
          'message': 'تم رفع المستند بنجاح',
          'document': newDocument
        });

      } catch (error) {

        log.error('Error uploading document', {
  'error': error instanceof Error ? error.message : 'Unknown error'
});
        res.status(500).json({'message': 'فشل في رفع المستند'});

      }

    }
  );

  // Example 7: Leave request with validation
  app.post('/api/leaves',
    validateInput.sanitize,
    validateInput.body(leaveRequestSchema),
    async (req: Request, res: Response) => {

      try {

        const leaveData = req.body as z.infer<typeof leaveRequestSchema>;
        log.info('Creating leave request', {'leaveData': leaveData});

        const newLeave = await storage.createLeave(leaveData);

        res.status(201).json({
          'message': 'تم تقديم طلب الإجازة بنجاح',
          'leave': newLeave
        });

      } catch (error) {

        log.error('Error creating leave request', {
  'error': error instanceof Error ? error.message : 'Unknown error'
});
        res.status(500).json({'message': 'فشل في تقديم طلب الإجازة'});

      }

    }
  );

  // Example 8: Multiple validation sources
  app.put('/api/employees/:id/status',
    validateInput.multiple({
      'params': z.object({'id': z.string().min(1, 'معرف الموظف مطلوب')}),
      'body': z.object({
        'status': z.enum(['active', 'inactive', 'on_leave', 'terminated', 'archived']),
        'reason': z.string().min(10,
   'سبب التغيير يجب أن يكون على الأقل 10 أحرف').max(500,
   'سبب التغيير طويل جداً')
      })
    }),
    async (req: Request, res: Response) => {

      try {

        const {id} = req.params; // Validated
        const {status, reason} = req.body as {
          status: 'active' | 'inactive' | 'on_leave' | 'terminated' | 'archived';
          reason: string;
        }; // Validated and sanitized

        // Ensure id is not undefined
        if (!id) {
          return res.status(400).json({'message': 'معرف الموظف مطلوب'});
        }

        log.info('Updating employee status', {id, status, reason});

        const updatedEmployee = await storage.updateEmployee(id, {status});

        res.json({
          'message': 'تم تحديث حالة الموظف بنجاح',
          'employee': updatedEmployee
        });

      } catch (error) {

        log.error('Error updating employee status', {
  'error': error instanceof Error ? error.message : 'Unknown error'
});
        res.status(500).json({'message': 'فشل في تحديث حالة الموظف'});

      }

    }
  );

  // Example 9: Search with query validation
  app.get('/api/companies/search',
    validateInput.query(companySearchSchema),
    async (req: Request, res: Response) => {

      try {

        const {name, industryType, location, isActive, page, limit} = req.query;

        log.info('Searching companies', {name, industryType, location, isActive, page, limit});

        // Use getAllCompanies since searchCompanies doesn't exist
        const companies = await storage.getAllCompanies();

        res.json({
          companies,
          'pagination': {
            'page': Number(page) || 1,
            'limit': Number(limit) || 20,
            'total': companies.length
          }
        });

      } catch (error) {

        log.error('Error searching companies', {
  'error': error instanceof Error ? error.message : 'Unknown error'
});
        res.status(500).json({'message': 'فشل في البحث عن الشركات'});

      }

    }
  );

  // Example 10: License search with validation
  app.get('/api/licenses/search',
    validateInput.query(licenseSearchSchema),
    async (req: Request, res: Response) => {

      try {

        const {type, status, companyId, page, limit} = req.query;

        log.info('Searching licenses', {type, status, companyId, page, limit});

        // Use getCompanyLicenses since searchLicenses doesn't exist
        const licenses = companyId ? await storage.getCompanyLicenses(companyId as string) : [];

        res.json({
          licenses,
          'pagination': {
            'page': Number(page) || 1,
            'limit': Number(limit) || 20,
            'total': licenses.length
          }
        });

      } catch (error) {

        log.error('Error searching licenses', {
  'error': error instanceof Error ? error.message : 'Unknown error'
});
        res.status(500).json({'message': 'فشل في البحث عن الرخص'});

      }

    }
  );

}
