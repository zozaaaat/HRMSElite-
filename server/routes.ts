import type {Express, Request, Response} from 'express';
import {createServer, type Server} from 'http';
import {storage} from './models/storage';
import {log} from './utils/logger';
import type {User} from '../shared/types/user';

// User type is already declared in auth middleware

// Removed advanced routes import as file was deleted
import {
  insertLicenseSchema, insertEmployeeLeaveSchema, type InsertCompany
} from '../shared/schema';
import {registerEmployeeRoutes} from './routes/employee-routes';
import {registerPayrollRoutes} from './routes/payroll-routes';
import {registerLicenseRoutes} from './routes/license-routes';
import { registerDocumentRoutes } from './routes/v1/document-routes';
import aiRoutes from './routes/ai';
import authRoutes from './routes/auth-routes';
import qualityRoutes from './routes/quality-routes';
// import notificationRoutes from "./routes/notification-routes";
import {metricsEndpoint, healthCheckWithMetrics} from './middleware/metrics';

// Helper function to safely log errors
const safeLogError = (message: string, error: unknown): void => {
  const errorData = error instanceof Error ? error : { error: String(error) };
  log.error(message, errorData);
};


export async function registerRoutes (app: Express): Promise<Server> {

  // Import unified authentication middleware
  const {isAuthenticated, requireRole} = await import('./middleware/auth');

  // Register unified authentication routes
  app.use('/api/auth', authRoutes);

  // Register additional routes
  registerEmployeeRoutes(app);
  registerPayrollRoutes(app);
  registerLicenseRoutes(app);
  registerDocumentRoutes(app);

  // Register AI routes
  app.use('/api/ai', isAuthenticated, aiRoutes);

  // Register quality monitoring routes
  app.use('/api', qualityRoutes);

  // Register notification routes
  // app.use('/api/notifications', isAuthenticated, notificationRoutes);

  // Root route for testing
  app.get('/', (req, res) => {
    res.json({ message: 'HRMS Elite API is running successfully!' });
  });

  // Monitoring and metrics endpoints
  app.get('/metrics', metricsEndpoint);
  app.get('/api/health', healthCheckWithMetrics);


  // System dashboard routes (Super Admin)
  app.get('/api/dashboard/stats', isAuthenticated, async (req, res) => {

    try {

      const stats = {
        'totalCompanies': 10,
        'totalEmployees': 250,
        'activeCompanies': 8,
        'pendingApprovals': 5
      };
      res.json(stats);

    } catch (error) {

      log.error('Error fetching dashboard stats:', error instanceof Error ? error : { error: String(error) });
      res.status(500).json({'message': 'Failed to fetch dashboard stats'});

    }

  });

  app.get('/api/companies', async (req, res) => {

    try {

      const companies = await storage.getAllCompanies();

      // إرجاع بيانات تجريبية دائماً في البيئة التطويرية
      if (companies.length === 0 || process.env.NODE_ENV === 'development') {

        const mockCompanies = [
          {
            'id': 'company-1',
            'name': 'شركة الاتحاد الخليجي',
            'commercialFileName': 'الاتحاد الخليجي للتجارة',
            'department': 'التجارة العامة',
            'classification': 'شركة ذات مسؤولية محدودة',
            'status': 'active',
            'employeeCount': 45,
            'industry': 'التجارة',
            'establishmentDate': '2020-01-15'
          },
          {
            'id': 'company-2',
            'name': 'شركة النيل الأزرق',
            'commercialFileName': 'النيل الأزرق للمقاولات',
            'department': 'المقاولات والإنشاءات',
            'classification': 'شركة مساهمة',
            'status': 'active',
            'employeeCount': 78,
            'industry': 'الإنشاءات',
            'establishmentDate': '2018-05-20'
          },
          {
            'id': 'company-3',
            'name': 'شركة قمة النيل',
            'commercialFileName': 'قمة النيل للخدمات',
            'department': 'الخدمات اللوجستية',
            'classification': 'شركة ذات مسؤولية محدودة',
            'status': 'active',
            'employeeCount': 32,
            'industry': 'الخدمات',
            'establishmentDate': '2019-09-10'
          }
        ];
        res.json(mockCompanies);

      } else {

        res.json(companies);

      }

    } catch (error) {

      log.error('Error fetching companies:', error instanceof Error ? error : { error: String(error) });
      res.status(500).json({'message': 'Failed to fetch companies'});

    }

  });

  app.post('/api/companies', isAuthenticated, async (req:  Request, res:  Response) => {

    try {

      // Check if user is super admin
      const userRole = (req.user as User)?.role ?? "user";
      if (userRole !== 'super_admin') {

        return res.status(403).json({'message': 'Only Super Admin can add companies'});

      }

      const companyData = req.body as InsertCompany; // Type the request body
      const company = await storage.createCompany(companyData);
      res.status(201).json(company);

    } catch (error) {

      log.error('Error creating company:', error instanceof Error ? error : { error: String(error) });
      res.status(500).json({'message': 'Failed to create company'});

    }

  });

  // Company-specific routes
  app.get('/api/companies/:companyId', async (req, res) => {

    try {

      const {companyId} = req.params;

      // بيانات تجريبية للشركات
      const mockCompanies = {
        'company-1': {
          'id': 'company-1',
          'name': 'شركة الاتحاد الخليجي',
          'commercialFileName': 'الاتحاد الخليجي للتجارة',
          'department': 'التجارة العامة',
          'classification': 'شركة ذات مسؤولية محدودة',
          'status': 'active',
          'employeeCount': 45,
          'industry': 'التجارة',
          'establishmentDate': '2020-01-15'
        },
        '1': {
          'id': '1',
          'name': 'شركة الاتحاد الخليجي',
          'commercialFileName': 'الاتحاد الخليجي للتجارة',
          'department': 'التجارة العامة',
          'classification': 'شركة ذات مسؤولية محدودة',
          'status': 'active',
          'employeeCount': 45,
          'industry': 'التجارة',
          'establishmentDate': '2020-01-15'
        }
      };

      if (process.env.NODE_ENV === 'development' && (mockCompanies as Record<string, unknown>)[companyId]) {

        return res.json((mockCompanies as Record<string, unknown>)[companyId]);

      }

      const company = await storage.getCompany(companyId);
      if (!company) {

        return res.status(404).json({'message': 'Company not found'});

      }
      res.json(company);

    } catch (error) {

      log.error('Error fetching company:', error instanceof Error ? error : { error: String(error) });
      res.status(500).json({'message': 'Failed to fetch company'});

    }

  });

  app.get('/api/companies/:companyId/stats', async (req, res) => {

    try {

      const {companyId} = req.params;

      // بيانات تجريبية لإحصائيات الشركة
      if (process.env.NODE_ENV === 'development') {

        const mockStats = {
          'totalEmployees': 45,
          'activeEmployees': 42,
          'inactiveEmployees': 3,
          'totalDepartments': 8,
          'presentToday': 38,
          'absentToday': 4,
          'lateToday': 3,
          'pendingLeaves': 2,
          'thisMonthHires': 3,
          'thisMonthTerminations': 1
        };
        return res.json(mockStats);

      }

      const stats = await storage.getCompanyStats(companyId);
      res.json(stats);

    } catch (error) {

      log.error('Error fetching company stats:', error instanceof Error ? error : { error: String(error) });
      res.status(500).json({'message': 'Failed to fetch company stats'});

    }

  });

  // Employee routes are now unified in employee-routes.ts
  // Both /api/employees and /api/companies/:companyId/employees are handled by unifiedEmployeeHandler

  // Employee creation is now handled in employee-routes.ts
  // This route is removed to avoid duplication

  // License routes
  app.get('/api/companies/:companyId/licenses', isAuthenticated, async (req, res) => {

    try {

      const {companyId} = req.params;
      if (!companyId) {
        return res.status(400).json({'message': 'Company ID is required'});
      }
      const licenses = await storage.getCompanyLicenses(companyId);
      res.json(licenses);

    } catch (error) {

      log.error('Error fetching licenses:', error instanceof Error ? error : { error: String(error) });
      res.status(500).json({'message': 'Failed to fetch licenses'});

    }

  });

  app.get('/api/licenses/:licenseId', isAuthenticated, async (req, res) => {

    try {

      const {licenseId} = req.params;
      if (!licenseId) {
        return res.status(400).json({'message': 'License ID is required'});
      }
      const license = await storage.getLicense(licenseId);
      if (!license) {

        return res.status(404).json({'message': 'License not found'});

      }
      res.json(license);

    } catch (error) {

      safeLogError('Error fetching license:', error);
      res.status(500).json({'message': 'Failed to fetch license'});

    }

  });

  app.post('/api/companies/:companyId/licenses', isAuthenticated, async (req, res) => {

    try {

      const {companyId} = req.params;
      const licenseData = insertLicenseSchema.parse({...req.body, companyId});
      const license = await storage.createLicense(licenseData);
      res.status(201).json(license);

    } catch (error) {

      safeLogError('Error creating license:', error);
      res.status(500).json({'message': 'Failed to create license'});

    }

  });

  // Leave management routes
  app.get('/api/companies/:companyId/leaves', isAuthenticated, async (req, res) => {

    try {

      const {companyId} = req.params;
      if (!companyId) {
        return res.status(400).json({'message': 'Company ID is required'});
      }
      const status = req.query.status as string;
      const leaves = await storage.getCompanyLeaves(companyId, status);
      res.json(leaves);

    } catch (error) {

      safeLogError('Error fetching leaves:', error);
      res.status(500).json({'message': 'Failed to fetch leaves'});

    }

  });

  app.get('/api/employees/:employeeId/leaves', isAuthenticated, async (req, res) => {

    try {

      const {employeeId} = req.params;
      if (!employeeId) {
        return res.status(400).json({'message': 'Employee ID is required'});
      }
      const leaves = await storage.getEmployeeLeaves(employeeId);
      res.json(leaves);

    } catch (error) {

      safeLogError('Error fetching employee leaves:', error);
      res.status(500).json({'message': 'Failed to fetch employee leaves'});

    }

  });

  app.post('/api/employees/:employeeId/leaves', isAuthenticated, async (req, res) => {

    try {

      const {employeeId} = req.params;
      const leaveData = insertEmployeeLeaveSchema.parse({...req.body, employeeId});
      const leave = await storage.createLeave(leaveData);
      res.status(201).json(leave);

    } catch (error) {

      safeLogError('Error creating leave:', error);
      res.status(500).json({'message': 'Failed to create leave'});

    }

  });

  app.post('/api/leaves/:leaveId/approve',
   isAuthenticated,
   async (req:  Request,
   res:  Response) => {

    try {

      const {leaveId} = req.params;
      const approverId = (req.user as User)?.sub || 'unknown';
      // TODO: Implement approveLeave method in storage
      const leave = { id: leaveId, status: 'approved', approverId };
      res.json(leave);

    } catch (error) {

      safeLogError('Error approving leave:', error);
      res.status(500).json({'message': 'Failed to approve leave'});

    }

  });

  app.post('/api/leaves/:leaveId/reject',
   isAuthenticated,
   async (req:  Request,
   res:  Response) => {

    try {

      const {leaveId} = req.params;
      const {reason} = req.body as { reason: string };
      const approverId = (req.user as User)?.sub || 'unknown';
      // TODO: Implement rejectLeave method in storage
      const leave = { id: leaveId, status: 'rejected', approverId, reason };
      res.json(leave);

    } catch (error) {

      safeLogError('Error rejecting leave:', error);
      res.status(500).json({'message': 'Failed to reject leave'});

    }

  });

  // Attendance routes are now handled in employee-routes.ts

  // Leave balance routes are now handled in employee-routes.ts

  // Leave request routes are now handled in employee-routes.ts

  // Payroll routes
  app.get('/api/payroll/employee/:employeeId', isAuthenticated, async (req, res) => {

    try {

      const {employeeId: _employeeId} = req.params;
      const payrollData = {
        'basicSalary': 1200,
        'allowances': 300,
        'overtime': 150,
        'deductions': 75,
        'netSalary': 1575,
        'payPeriod': 'January 2025',
        'payDate': '2025-01-31'
      };
      res.json(payrollData);

    } catch (error) {

      safeLogError('Error fetching payroll:', error);
      res.status(500).json({'message': 'Failed to fetch payroll'});

    }

  });

  // Performance routes
  app.get('/api/performance/overview', isAuthenticated, async (req, res) => {

    try {

      const performanceData = {
        'overall': 4.2,
        'goals': 85,
        'feedback': 12,
        'improvements': 3,
        'evaluations': [
          {'category': 'Quality', 'score': 4.5},
          {'category': 'Productivity', 'score': 4.0},
          {'category': 'Teamwork', 'score': 4.3},
          {'category': 'Leadership', 'score': 3.8}
        ]
      };
      res.json(performanceData);

    } catch (error) {

      safeLogError('Error fetching performance data:', error);
      res.status(500).json({'message': 'Failed to fetch performance data'});

    }

  });

  // Training routes
  app.get('/api/training/courses', isAuthenticated, async (req, res) => {

    try {

      const courses = [
        {
          'id': '1',
          'title': 'أساسيات إدارة الموارد البشرية',
          'instructor': 'د. محمد السالم',
          'duration': '8 ساعات',
          'enrolledCount': 45,
          'rating': 4.8,
          'status': 'available'
        },
        {
          'id': '2',
          'title': 'القيادة الفعالة',
          'instructor': 'أ. سارة القحطاني',
          'duration': '12 ساعة',
          'enrolledCount': 32,
          'rating': 4.9,
          'status': 'available'
        }
      ];
      res.json(courses);

    } catch (error) {

      safeLogError('Error fetching courses:', error);
      res.status(500).json({'message': 'Failed to fetch courses'});

    }

  });

  // Recruitment routes
  app.get('/api/recruitment/jobs',
   isAuthenticated,
   requireRole(['super_admin',
   'company_manager']),
   async (req,
   res) => {

    try {

      const jobs = [
        {
          'id': '1',
          'title': 'محاسب أول',
          'department': 'المحاسبة',
          'location': 'الكويت',
          'type': 'دوام كامل',
          'applicants': 25,
          'status': 'active',
          'postedDate': '2025-01-20'
        },
        {
          'id': '2',
          'title': 'مطور برمجيات',
          'department': 'تقنية المعلومات',
          'location': 'الكويت',
          'type': 'دوام كامل',
          'applicants': 18,
          'status': 'active',
          'postedDate': '2025-01-22'
        }
      ];
      res.json(jobs);

    } catch (error) {

      safeLogError('Error fetching jobs:', error);
      res.status(500).json({'message': 'Failed to fetch jobs'});

    }

  });

  app.get('/api/recruitment/applicants',
   isAuthenticated,
   requireRole(['super_admin',
   'company_manager']),
   async (req,
   res) => {

    try {

      const applicants = [
        {
          'id': '1',
          'name': 'خالد أحمد المطيري',
          'email': 'khalid@email.com',
          'phone': '+965 9999 1234',
          'position': 'محاسب أول',
          'experience': '5 سنوات',
          'status': 'pending',
          'appliedDate': '2025-01-25'
        },
        {
          'id': '2',
          'name': 'نوال محمد العتيبي',
          'email': 'nawal@email.com',
          'phone': '+965 9999 5678',
          'position': 'مطور برمجيات',
          'experience': '3 سنوات',
          'status': 'shortlisted',
          'appliedDate': '2025-01-26'
        }
      ];
      res.json(applicants);

    } catch (error) {

      safeLogError('Error fetching applicants:', error);
      res.status(500).json({'message': 'Failed to fetch applicants'});

    }

  });

  // تم حذف هذا المسار المكرر نهائياً

  // New attendance API routes to fix [object Object] issue
  app.get('/api/attendance/:companyId', async (req, res) => {

    try {

      const {companyId} = req.params;

      // التحقق من صحة المعرف
      if (typeof companyId !== 'string' || companyId === '[object Object]') {

        return res.status(400).json({'message': 'Invalid company ID'});

      }

      // إضافة بيانات تجريبية للحضور
      const mockAttendance = [
        {
          'id': 'att-1',
          'employeeId': 'emp-1',
          'employeeName': 'أحمد محمد علي',
          'date': new Date().toISOString().split('T')[0],
          'checkIn': '08:30',
          'checkOut': '17:00',
          'status': 'present',
          'workingHours': 8.5,
          'overtime': 0.5
        },
        {
          'id': 'att-2',
          'employeeId': 'emp-2',
          'employeeName': 'فاطمة سالم أحمد',
          'date': new Date().toISOString().split('T')[0],
          'checkIn': '08:45',
          'checkOut': '17:15',
          'status': 'present',
          'workingHours': 8.5,
          'overtime': 0.5
        },
        {
          'id': 'att-3',
          'employeeId': 'emp-3',
          'employeeName': 'محمد عبدالله',
          'date': new Date().toISOString().split('T')[0],
          'checkIn': '09:00',
          'checkOut': null,
          'status': 'present',
          'workingHours': 0,
          'overtime': 0
        }
      ];

      res.json(mockAttendance);

    } catch (error) {

      safeLogError('Error fetching attendance:', error);
      res.status(500).json({'message': 'Failed to fetch attendance'});

    }

  });

  // New leaves API routes
  app.get('/api/leaves/:companyId', async (req, res) => {

    try {

      const {companyId} = req.params;

      // التحقق من صحة المعرف
      if (typeof companyId !== 'string' || companyId === '[object Object]') {

        return res.status(400).json({'message': 'Invalid company ID'});

      }

      // إضافة بيانات تجريبية للإجازات
      const mockLeaves = [
        {
          'id': 'leave-1',
          'employeeId': 'emp-1',
          'employeeName': 'أحمد محمد علي',
          'type': 'annual',
          'startDate': '2025-02-10',
          'endDate': '2025-02-12',
          'days': 3,
          'reason': 'إجازة شخصية',
          'status': 'pending',
          'appliedDate': '2025-01-28'
        },
        {
          'id': 'leave-2',
          'employeeId': 'emp-2',
          'employeeName': 'فاطمة سالم أحمد',
          'type': 'sick',
          'startDate': '2025-02-15',
          'endDate': '2025-02-16',
          'days': 2,
          'reason': 'إجازة مرضية',
          'status': 'approved',
          'appliedDate': '2025-01-25'
        }
      ];

      res.json(mockLeaves);

    } catch (error) {

      safeLogError('Error fetching leaves:', error);
      res.status(500).json({'message': 'Failed to fetch leaves'});

    }

  });

  app.get('/api/leaves/employee/:employeeId', async (req, res) => {

    try {

      const {employeeId: _employeeId} = req.params;

      // إضافة بيانات تجريبية لإجازات الموظف
      const mockLeaves = [
        {
          'id': 'leave-1',
          'type': 'annual',
          'startDate': '2025-02-10',
          'endDate': '2025-02-12',
          'days': 3,
          'reason': 'إجازة شخصية',
          'status': 'pending',
          'appliedDate': '2025-01-28'
        }
      ];

      res.json(mockLeaves);

    } catch (error) {

      safeLogError('Error fetching employee leaves:', error);
      res.status(500).json({'message': 'Failed to fetch employee leaves'});

    }

  });

  // Documents routes
  app.get('/api/documents', isAuthenticated, async (req, res) => {

    try {

      const documents = [
        {
          'id': '1',
          'name': 'سياسة الموارد البشرية 2025',
          'type': 'application/pdf',
          'category': 'policies',
          'size': '2.5 MB',
          'uploadedBy': 'إدارة الموارد البشرية',
          'uploadDate': '2025-01-15',
          'status': 'active'
        },
        {
          'id': '2',
          'name': 'دليل الموظف الجديد',
          'type': 'application/pdf',
          'category': 'guides',
          'size': '1.8 MB',
          'uploadedBy': 'إدارة الموارد البشرية',
          'uploadDate': '2025-01-10',
          'status': 'active'
        }
      ];
      res.json(documents);

    } catch (error) {

      safeLogError('Error fetching documents:', error);
      res.status(500).json({'message': 'Failed to fetch documents'});

    }

  });

  // Notification routes
  app.get('/api/notifications', async (req:  Request, res:  Response) => {

    try {

      // Return mock notifications for development
      const notifications = [
        {
          'id': '1',
          'title': 'مرحباً بكم في نظام إدارة الموارد البشرية',
          'message': 'تم تفعيل النظام بنجاح',
          'type': 'info',
          'isRead': false,
          'createdAt': new Date().toISOString(),
          'userId': 'admin',
          'companyId': 'company-1'
        }
      ];
      res.json(notifications);

    } catch (error) {

      safeLogError('Error fetching notifications:', error);
      res.status(500).json({'message': 'Failed to fetch notifications'});

    }

  });

  app.get('/api/notifications/unread-count',
   isAuthenticated,
   async (req:  Request,
   res:  Response) => {

    try {

      const _userId = (req.user as User)?.sub || 'unknown';
      const _companyId = req.query.companyId as string;
      // TODO: Implement getUnreadNotificationCount method in storage
      const count = 5; // Mock count
      res.json({count});

    } catch (error) {

      safeLogError('Error fetching unread notification count:', error);
      res.status(500).json({'message': 'Failed to fetch unread notification count'});

    }

  });

  app.post('/api/notifications/:notificationId/read', isAuthenticated, async (req, res) => {

    try {

      const {notificationId} = req.params;
      if (!notificationId) {
        return res.status(400).json({'message': 'Notification ID is required'});
      }
      await storage.markNotificationAsRead(notificationId);
      res.json({'success': true});

    } catch (error) {

      safeLogError('Error marking notification as read:', error);
      res.status(500).json({'message': 'Failed to mark notification as read'});

    }

  });

  // Document routes
  app.get('/api/:entityType/:entityId/documents', isAuthenticated, async (req, res) => {

    try {

      const {entityType, _entityId} = req.params;
      if (!entityType || !['employee', 'company', 'license'].includes(entityType)) {

        return res.status(400).json({'message': 'Invalid entity type'});

      }
      // TODO: Implement getEntityDocuments method in storage
      const documents: Array<{
        id: string;
        name: string;
        type: string;
        category: string;
        size: string;
        uploadDate: string;
        uploadedBy: string;
        status: string;
      }> = [];
      res.json(documents);

    } catch (error) {

      safeLogError('Error fetching documents:', error);
      res.status(500).json({'message': 'Failed to fetch documents'});

    }

  });

  // Register advanced routes


  // Government Forms API endpoints
  app.get('/api/government-forms/templates', async (req, res) => {

    try {

      const templates = [
        {
          'id': 'manpower_license',
          'nameAr': 'رخصة القوى العاملة',
          'ministry': 'وزارة الداخلية - الهيئة العامة للقوى العاملة',
          'fields': ['company_name', 'license_number', 'activity_type', 'employee_count']
        },
        {
          'id': 'residence_permit',
          'nameAr': 'تصريح إقامة',
          'ministry': 'وزارة الداخلية - الأمن العام',
          'fields': ['employee_name', 'passport_number', 'nationality', 'job_title', 'salary']
        }
      ];
      res.json(templates);

    } catch {

      res.status(500).json({'error': 'Server error'});

    }

  });

  app.post('/api/government-forms/fill', async (req, res) => {

    try {

      const {formId, employeeId, formData} = req.body as { formId: string; employeeId: string; formData: unknown };
      log.info(`Filling form ${formId} for employee ${employeeId}`, formData as Record<string, unknown>, 'ROUTES');
      res.json({'success': true, 'message': 'تم ملء النموذج بنجاح'});

    } catch {

      res.status(500).json({'error': 'Server error'});

    }

  });

  // Administrative Employees & Permissions APIs
  app.get('/api/administrative-employees', async (req, res) => {

    try {

      const adminEmployees = [
        {
          'id': 'admin1',
          'fullName': 'أحمد محمد علي',
          'jobTitle': 'مسؤول الموارد البشرية',
          'role': 'administrative_employee',
          'permissions': ['hr', 'reports']
        },
        {
          'id': 'admin2',
          'fullName': 'فاطمة سالم',
          'jobTitle': 'مسؤولة المحاسبة',
          'role': 'administrative_employee',
          'permissions': ['accounting', 'reports']
        },
        {
          'id': 'admin3',
          'fullName': 'محمد خالد',
          'jobTitle': 'مسؤول المشتريات',
          'role': 'administrative_employee',
          'permissions': ['purchasing', 'inventory']
        }
      ];
      res.json(adminEmployees);

    } catch {

      res.status(500).json({'error': 'Server error'});

    }

  });

  app.get('/api/permissions/:employeeId', async (req, res) => {

    try {

      const {employeeId} = req.params;

      // Mock permissions data - في التطبيق الحقيقي ستأتي من قاعدة البيانات
      const mockPermissions = {
        'admin1': {
          'hr': {
            'employees_view': true,
            'employees_create': true,
            'employees_edit': true,
            'employees_delete': false,
            'leaves_approve': true,
            'payroll_process': false,
            'violations_manage': true
          },
          'reports': {
            'reports_view': true,
            'reports_create': false,
            'reports_export': true,
            'analytics_access': false
          }
        },
        'admin2': {
          'accounting': {
            'financial_view': true,
            'invoices_create': true,
            'expenses_approve': true,
            'budgets_manage': false,
            'taxes_process': true,
            'financial_export': true
          },
          'reports': {
            'reports_view': true,
            'reports_create': true,
            'reports_export': true,
            'analytics_access': true
          }
        },
        'admin3': {
          'purchasing': {
            'purchases_view': true,
            'orders_create': true,
            'orders_approve': false,
            'vendors_manage': true
          },
          'inventory': {
            'inventory_view': true,
            'items_add': true,
            'stock_adjust': false,
            'orders_approve': false,
            'suppliers_manage': true
          }
        }
      };

      res.json((mockPermissions as Record<string, unknown>)[employeeId] ?? {});

    } catch {

      res.status(500).json({'error': 'Server error'});

    }

  });

  app.put('/api/permissions/:employeeId', async (req, res) => {

    try {

      const {employeeId} = req.params;
      const permissions = req.body as Record<string, unknown>;

      log.info(`Updating permissions for employee ${employeeId}`, permissions, 'ROUTES');

      // هنا ستتم معالجة حفظ الصلاحيات في قاعدة البيانات
      res.json({'success': true, 'message': 'تم تحديث الصلاحيات بنجاح'});

    } catch {

      res.status(500).json({'error': 'Server error'});

    }

  });

  // AI Analytics routes
  app.get('/api/ai-analytics/:companyId', async (req, res) => {

    try {

      const {companyId: _companyId} = req.params;
      const analyticsData = {
        'overview': {
          'totalEmployees': 450,
          'employeeTrend': 12.5,
          'avgSalary': 2800,
          'salaryTrend': 8.3,
          'turnoverRate': 3.2,
          'turnoverTrend': -15.4,
          'satisfaction': 87,
          'satisfactionTrend': 5.7
        },
        'charts': {
          'employeeGrowth': [
            {'month': 'يناير', 'employees': 420, 'predictions': 435},
            {'month': 'فبراير', 'employees': 425, 'predictions': 440},
            {'month': 'مارس', 'employees': 430, 'predictions': 445},
            {'month': 'أبريل', 'employees': 435, 'predictions': 450},
            {'month': 'مايو', 'employees': 440, 'predictions': 455},
            {'month': 'يونيو', 'employees': 450, 'predictions': 465}
          ],
          'departmentDistribution': [
            {'name': 'تقنية المعلومات', 'value': 150, 'color': '#0088FE'},
            {'name': 'المبيعات', 'value': 120, 'color': '#00C49F'},
            {'name': 'التسويق', 'value': 80, 'color': '#FFBB28'},
            {'name': 'الموارد البشرية', 'value': 50, 'color': '#FF8042'},
            {'name': 'المالية', 'value': 50, 'color': '#8884d8'}
          ],
          'salaryAnalysis': [
            {'department': 'تقنية المعلومات', 'current': 3500, 'predicted': 3700},
            {'department': 'المبيعات', 'current': 2800, 'predicted': 2950},
            {'department': 'التسويق', 'current': 2600, 'predicted': 2750},
            {'department': 'الموارد البشرية', 'current': 2400, 'predicted': 2520},
            {'department': 'المالية', 'current': 3200, 'predicted': 3350}
          ]
        }
      };
      res.json(analyticsData);

    } catch (error) {

      safeLogError('Error fetching AI analytics:', error);
      res.status(500).json({'message': 'Failed to fetch AI analytics'});

    }

  });

  app.get('/api/ai-predictions/:companyId', async (req, res) => {

    try {

      const predictions = [
        {
          'id': 1,
          'type': 'employee_turnover',
          'title': 'توقع معدل دوران الموظفين',
          'prediction': 'انخفاض بنسبة 15% في الربع القادم',
          'confidence': 85,
          'impact': 'positive',
          'timeframe': '3 أشهر',
          'details': 'بناء على تحليل رضا الموظفين وسياسات الشركة الجديدة'
        },
        {
          'id': 2,
          'type': 'salary_optimization',
          'title': 'تحسين هيكل الرواتب',
          'prediction': 'إمكانية توفير 180,000 ريال سنوياً',
          'confidence': 78,
          'impact': 'positive',
          'timeframe': '6 أشهر',
          'details': 'من خلال إعادة توزيع الرواتب وتحسين نظام المكافآت'
        },
        {
          'id': 3,
          'type': 'recruitment_needs',
          'title': 'احتياجات التوظيف',
          'prediction': 'الحاجة لتوظيف 25 موظف جديد',
          'confidence': 92,
          'impact': 'neutral',
          'timeframe': '4 أشهر',
          'details': 'لمواكبة النمو المتوقع في المشاريع الجديدة'
        }
      ];
      res.json(predictions);

    } catch (error) {

      safeLogError('Error fetching AI predictions:', error);
      res.status(500).json({'message': 'Failed to fetch AI predictions'});

    }

  });

  app.post('/api/ai-chat', async (req, res) => {

    try {

      const {messages} = req.body as { messages: Array<{ content: string }> };

      // Get the last user message
      const lastMessage = messages[messages.length - 1];
      const userMessage = lastMessage?.content ?? '';

      // Enhanced AI responses for HRMS
      const responses: Record<string, string> = {
        'ما هو معدل دوران الموظفين الحالي؟': 'معدل دوران الموظفين الحالي هو 3.2% وهو منخفض بنسبة 15.4% مقارنة بالشهر الماضي، مما يدل على تحسن في رضا الموظفين. هذا المعدل يعتبر صحياً للشركة.',
  
        'أعطني تحليل رضا الموظفين': 'رضا الموظفين الحالي 87% مع ارتفاع 5.7%. أعلى الأقسام رضا: تقنية المعلومات (92%)، أقلها: المبيعات (78%). ننصح بتحسين بيئة العمل في قسم المبيعات.',
  
        'ما هي توقعات النمو للشهر القادم؟': 'نتوقع نمو بنسبة 3.5% في عدد الموظفين الشهر القادم، مع التركيز على توظيف مطورين وموظفي مبيعات. النمو مدفوع بمشاريع جديدة.',
  
        'أعطني تقرير الغياب لهذا الشهر': 'تقرير الغياب لهذا الشهر:\n\n• إجمالي أيام العمل: 22 يوم\n• نسبة الحضور: 92%\n• عدد أيام الغياب: 45 يوم\n• متوسط التأخير: 12 دقيقة\n\nالتوصية: قسم IT لديه أفضل نسبة حضور (95%)',
  
        'كم رخصة ستنتهي خلال الشهر القادم؟': 'تحليل التراخيص المنتهية:\n\n⚠️ تراخيص ستنتهي خلال 30 يوم:\n• شركة النيل الأزرق - 15 يوم\n• شركة الاتحاد الخليجي - 30 يوم\n\n📊 إجمالي التراخيص النشطة: 156\n📈 نسبة التجديد المتوقعة: 85%',
  
        'أعطني تحليل أداء الموظفين': 'تحليل أداء الموظفين:\n\n🏆 أفضل أداء:\n• أحمد محمد - 95%\n• سارة أحمد - 91%\n\n⚠️ يحتاج متابعة:\n• محمد حسن - 72%\n\n📈 متوسط الأداء العام: 87%',
  
        'ما هي التوصيات لتحسين الأداء؟': 'التوصيات الذكية للتحسين:\n\n1. 🎯 تدريب إضافي لـ 3 موظفين في قسم المبيعات\n2. 📅 تحسين جدول العمل لتقليل التأخير\n3. 🔄 مراجعة سياسات الغياب\n4. 💡 إدخال نظام حوافز لتحسين الأداء',
  
        'أعطني إحصائيات الحضور': 'إحصائيات الحضور الشاملة:\n\n📊 النسب:\n• الحضور: 92%\n• الغياب: 6%\n• التأخير: 2%\n\n🏢 أفضل الأقسام:\n1. IT - 95%\n2. المالية - 93%\n3. الموارد البشرية - 90%',
  
        'حلل حالة جميع التراخيص': 'تحليل شامل للتراخيص:\n\n📋 الحالة:\n• نشطة: 65%\n• تنتهي قريباً: 15%\n• منتهية: 10%\n• قيد التجديد: 10%\n\n💰 التكلفة المتوقعة للتجديد: 45,000 ريال'
      };

      // Find matching response or generate default
      let response = responses[userMessage];

      if (!response) {

        // Check for partial matches
        const partialMatch = Object.keys(responses).find(key =>
          userMessage.includes(key) ?? key.includes(userMessage)
        );

        if (partialMatch) {

          response = responses[partialMatch];

        } else {

          response = 'أفهم سؤالك. يمكنني مساعدتك في:\n\n• تحليل البيانات والإحصائيات\n• تقارير الغياب والحضور\n• تحليل أداء الموظفين\n• متابعة التراخيص والوثائق\n• التوصيات الذكية للتحسين\n\nما الذي تريد معرفته تحديداً؟';

        }

      }

      // Return in the format expected by the ai package
      res.json({
        'id': Date.now().toString(),
        'role': 'assistant',
        'content': response,
        'createdAt': new Date().toISOString()
      });

    } catch (error) {

      safeLogError('Error processing AI chat:', error);
      res.status(500).json({
        'error': 'Failed to process AI chat',
        'message': 'حدث خطأ في معالجة الرسالة. يرجى المحاولة مرة أخرى.'
      });

    }

  });

  app.post('/api/ai-insights/generate', async (req, res) => {

    try {

      const {type, _companyId} = req.body as { type: string; _companyId: string };

      const insights = {
        'comprehensive': {
          'message': 'تم توليد رؤى جديدة بنجاح',
          'insights': [
            'قسم تقنية المعلومات يحقق أفضل النتائج',
            'فرصة تحسين الرواتب في قسم التسويق',
            'الحاجة لبرامج تدريب إضافية'
          ]
        }
      };

      res.json((insights as Record<string, unknown>)[type] ?? {'message': 'تم توليد الرؤى بنجاح'});

    } catch (error) {

      safeLogError('Error generating AI insights:', error);
      res.status(500).json({'message': 'Failed to generate AI insights'});

    }

  });

  // Early Warning System routes
  app.get('/api/early-warnings/:companyId', async (req, res) => {

    try {

      const {companyId: _companyId} = req.params;

      const alerts = [
        {
          'id': 1,
          'type': 'turnover_risk',
          'severity': 'high',
          'title': 'خطر ارتفاع معدل دوران الموظفين',
          'description': 'معدل دوران الموظفين في قسم المبيعات وصل إلى 8.5% هذا الشهر',
          'impact': 'قد يؤثر على الأداء العام للقسم',
          'recommendation': 'مراجعة رواتب ومكافآت قسم المبيعات',
          'timestamp': new Date().toISOString(),
          'department': 'المبيعات',
          'value': 8.5,
          'threshold': 5.0,
          'trend': 'increasing'
        },
        {
          'id': 2,
          'type': 'budget_variance',
          'severity': 'medium',
          'title': 'تجاوز الميزانية المخصصة للرواتب',
          'description': 'الإنفاق على الرواتب تجاوز الميزانية بنسبة 12%',
          'impact': 'ضغط على الميزانية العامة للشركة',
          'recommendation': 'مراجعة هيكل الرواتب والمكافآت',
          'timestamp': new Date().toISOString(),
          'department': 'المالية',
          'value': 112,
          'threshold': 100,
          'trend': 'increasing'
        },
        {
          'id': 3,
          'type': 'satisfaction_drop',
          'severity': 'medium',
          'title': 'انخفاض رضا الموظفين',
          'description': 'رضا الموظفين في قسم التسويق انخفض إلى 68%',
          'impact': 'قد يؤدي إلى زيادة معدل الاستقالات',
          'recommendation': 'إجراء جلسات استماع مع موظفي التسويق',
          'timestamp': new Date().toISOString(),
          'department': 'التسويق',
          'value': 68,
          'threshold': 70,
          'trend': 'decreasing'
        }
      ];

      res.json(alerts);

    } catch (error) {

      safeLogError('Error fetching early warnings:', error);
      res.status(500).json({'message': 'Failed to fetch early warnings'});

    }

  });

  app.get('/api/trend-analysis/:companyId', async (req, res) => {

    try {

      const trends = {
        'turnover': [
          {'month': 'سبتمبر', 'value': 3.2, 'threshold': 5.0},
          {'month': 'أكتوبر', 'value': 4.1, 'threshold': 5.0},
          {'month': 'نوفمبر', 'value': 5.8, 'threshold': 5.0},
          {'month': 'ديسمبر', 'value': 6.2, 'threshold': 5.0},
          {'month': 'يناير', 'value': 7.1, 'threshold': 5.0}
        ],
        'satisfaction': [
          {'month': 'سبتمبر', 'value': 85, 'threshold': 70},
          {'month': 'أكتوبر', 'value': 82, 'threshold': 70},
          {'month': 'نوفمبر', 'value': 78, 'threshold': 70},
          {'month': 'ديسمبر', 'value': 74, 'threshold': 70},
          {'month': 'يناير', 'value': 71, 'threshold': 70}
        ],
        'budget': [
          {'month': 'سبتمبر', 'value': 95, 'threshold': 100},
          {'month': 'أكتوبر', 'value': 98, 'threshold': 100},
          {'month': 'نوفمبر', 'value': 103, 'threshold': 100},
          {'month': 'ديسمبر', 'value': 108, 'threshold': 100},
          {'month': 'يناير', 'value': 112, 'threshold': 100}
        ]
      };

      res.json(trends);

    } catch (error) {

      safeLogError('Error fetching trend analysis:', error);
      res.status(500).json({'message': 'Failed to fetch trend analysis'});

    }

  });

  app.post('/api/early-warnings/settings', async (req, res) => {

    try {

      const {settings, companyId} = req.body as { settings: Record<string, unknown>; companyId: string };

      log.info(`Updating early warning settings for company ${companyId}`, settings, 'ROUTES');

      res.json({
        'success': true,
        'message': 'تم حفظ إعدادات التنبيه بنجاح'
      });

    } catch (error) {

      safeLogError('Error updating early warning settings:', error);
      res.status(500).json({'message': 'Failed to update settings'});

    }

  });

  // Register advanced routes

  // Advanced System APIs for Production
  app.get('/api/system/health', (req, res) => {

    res.json({
      'status': 'healthy',
      'uptime': process.uptime(),
      'timestamp': new Date().toISOString(),
      'services': {
        'database': 'connected',
        'api': 'operational',
        'auth': 'active'
      }
    });

  });

  app.get('/api/analytics/dashboard', (req, res) => {

    res.json({
      'employeeGrowth': [
        {'month': 'يناير', 'count': 45},
        {'month': 'فبراير', 'count': 52},
        {'month': 'مارس', 'count': 48},
        {'month': 'أبريل', 'count': 61},
        {'month': 'مايو', 'count': 55},
        {'month': 'يونيو', 'count': 67}
      ],
      'departmentDistribution': [
        {'name': 'الإنتاج', 'value': 45, 'color': '#0088FE'},
        {'name': 'المبيعات', 'value': 35, 'color': '#00C49F'},
        {'name': 'الإدارة', 'value': 25, 'color': '#FFBB28'},
        {'name': 'المالية', 'value': 15, 'color': '#FF8042'}
      ],
      'attendanceRate': 92.5,
      'performanceScore': 87.3
    });

  });

  app.get('/api/quick-stats', (req, res) => {

    res.json({
      'totalEmployees': 273,
      'presentToday': 251,
      'onLeave': 12,
      'pendingRequests': 8,
      'activeProjects': 15,
      'completedTasks': 142
    });

  });

  // Notifications APIs
  app.get('/api/notifications', (req, res) => {

    res.json([
      {
        'id': '1',
        'title': 'طلب إجازة جديد',
        'message': 'تم تقديم طلب إجازة من أحمد محمد',
        'type': 'info',
        'timestamp': new Date().toISOString(),
        'read': false
      },
      {
        'id': '2',
        'title': 'انتهاء صلاحية ترخيص',
        'message': 'ترخيص التجارة الإلكترونية سينتهي خلال 30 يوم',
        'type': 'warning',
        'timestamp': new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        'read': false
      },
      {
        'id': '3',
        'title': 'تم الموافقة على الطلب',
        'message': 'تم الموافقة على طلب الإجازة المرضية',
        'type': 'success',
        'timestamp': new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        'read': true
      }
    ]);

  });

  app.patch('/api/notifications/:id/read', (req, res) => {

    res.json({'success': true, 'message': 'Notification marked as read'});

  });

  app.delete('/api/notifications/:id', (req, res) => {

    res.json({'success': true, 'message': 'Notification deleted'});

  });

  app.patch('/api/notifications/mark-all-read', (req, res) => {

    res.json({'success': true, 'message': 'All notifications marked as read'});

  });

  // Attendance APIs are now handled in employee-routes.ts

  // Leave Request APIs
  // Leave request routes are now handled in employee-routes.ts

  // Mobile APIs
  app.get('/api/mobile/integrations', isAuthenticated, async (req:  Request, res:  Response) => {

    try {

      const integrations = [
        {
          'id': 'mobile1',
          'name': 'تطبيق الموظفين',
          'type': 'PWA',
          'status': 'active',
          'users': 85,
          'lastSync': new Date().toISOString(),
          'features': ['تسجيل الحضور', 'طلب إجازة', 'عرض الراتب', 'الإشعارات']
        }
      ];
      res.json(integrations);

    } catch (error) {

      safeLogError('Error fetching mobile integrations:', error);
      res.status(500).json({'message': 'Failed to fetch mobile integrations'});

    }

  });

  app.get('/api/mobile/device-registrations',
   isAuthenticated,
   async (req:  Request,
   res:  Response) => {

    try {

      const devices = [
        {
          'id': 'device1',
          'deviceName': 'جهاز تسجيل الحضور - المدخل الرئيسي',
          'location': 'المبنى الرئيسي - الطابق الأول',
          'status': 'online',
          'registeredUsers': 125,
          'lastPing': new Date().toISOString()
        }
      ];
      res.json(devices);

    } catch (error) {

      safeLogError('Error fetching device registrations:', error);
      res.status(500).json({'message': 'Failed to fetch device registrations'});

    }

  });

  app.get('/api/mobile/stats/:companyId',
   isAuthenticated,
   async (req:  Request,
   res:  Response) => {

    try {

      const stats = {
        'activeUsers': 156,
        'dailyCheckIns': 142,
        'appInstalls': 189,
        'notificationsSent': 45
      };
      res.json(stats);

    } catch (error) {

      safeLogError('Error fetching mobile stats:', error);
      res.status(500).json({'message': 'Failed to fetch mobile stats'});

    }

  });

  // تم حذف هذا المسار المكرر الثالث

  // Employee creation is now handled in employee-routes.ts

  // Attendance APIs are now handled in employee-routes.ts

  // Leave request routes are now handled in employee-routes.ts

  // Payroll APIs - مع فصل البيانات حسب الشركة
  app.get('/api/payroll', isAuthenticated, async (req, res) => {

    try {

      const companyId = req.query.companyId as string;
      if (!companyId) {

        return res.status(400).json({'message': 'Company ID is required'});

      }

      const payrollData = [
        {
          companyId,
          'employeeId': '1',
          'employeeName': 'أحمد محمد علي',
          'month': '2025-01',
          'basicSalary': 8000,
          'allowances': 1200,
          'overtime': 400,
          'deductions': 800,
          'netSalary': 8800,
          'status': 'processed'
        },
        {
          companyId,
          'employeeId': '2',
          'employeeName': 'فاطمة سالم أحمد',
          'month': '2025-01',
          'basicSalary': 6500,
          'allowances': 900,
          'overtime': 200,
          'deductions': 650,
          'netSalary': 6950,
          'status': 'processed'
        },
        {
          companyId,
          'employeeId': '3',
          'employeeName': 'خالد عبدالرحمن',
          'month': '2025-01',
          'basicSalary': 7500,
          'allowances': 1000,
          'overtime': 300,
          'deductions': 750,
          'netSalary': 8050,
          'status': 'pending'
        }
      ];
      res.json(payrollData);

    } catch (error) {

      safeLogError('Error fetching payroll data:', error);
      res.status(500).json({'message': 'Failed to fetch payroll data'});

    }

  });

  // Documents APIs - مع فصل البيانات حسب الشركة
  app.get('/api/documents', isAuthenticated, async (req, res) => {

    try {

      const companyId = req.query.companyId as string;
      if (!companyId) {

        return res.status(400).json({'message': 'Company ID is required'});

      }

      const documents = [
        {
          'id': '1',
          companyId,
          'name': 'عقد العمل - أحمد محمد علي.pdf',
          'type': 'contract',
          'category': 'contracts',
          'size': '2.5 MB',
          'uploadDate': '2025-01-20',
          'uploadedBy': 'مدير الموارد البشرية',
          'employee': 'أحمد محمد علي',
          'status': 'active'
        },
        {
          'id': '2',
          companyId,
          'name': 'كشف المرتب - يناير 2025.xlsx',
          'type': 'payroll',
          'category': 'payroll',
          'size': '1.2 MB',
          'uploadDate': '2025-01-15',
          'uploadedBy': 'محاسب الرواتب',
          'employee': 'جميع الموظفين',
          'status': 'processed'
        },
        {
          'id': '3',
          companyId,
          'name': 'تقرير الأداء السنوي.pdf',
          'type': 'report',
          'category': 'reports',
          'size': '5.8 MB',
          'uploadDate': '2025-01-10',
          'uploadedBy': 'مدير الشركة',
          'employee': 'إدارة الشركة',
          'status': 'reviewed'
        }
      ];
      res.json(documents);

    } catch (error) {

      safeLogError('Error fetching documents:', error);
      res.status(500).json({'message': 'Failed to fetch documents'});

    }

  });

  app.delete('/api/documents/:id', isAuthenticated, async (req, res) => {

    try {

      const {id} = req.params;
      res.json({'message': 'Document deleted successfully', id});

    } catch (error) {

      safeLogError('Error deleting document:', error);
      res.status(500).json({'message': 'Failed to delete document'});

    }

  });

  // Notifications APIs are now handled in the main routes section

  // AI Reports and Analytics endpoints
  app.get('/api/ai/summary', isAuthenticated, async (req:  Request, res:  Response) => {

    try {

      const {companyId} = req.query;

      // Generate AI-powered summary based on company data
      const aiSummary = {
        'companyId': companyId ?? "default",
        'generatedAt': new Date().toISOString(),
        'summary': {
          'overview': 'تحليل شامل لبيانات الشركة يظهر نمواً إيجابياً في معظم المؤشرات مع بعض المجالات التي تحتاج إلى تحسين.',
  
          'keyInsights': [
            'معدل دوران الموظفين منخفض (3.2%) مما يدل على رضا الموظفين',
            'قسم تقنية المعلومات يحقق أفضل النتائج مع معدل حضور 95%',
            'الحاجة لتحسين سياسات الغياب في قسم المبيعات',
            'فرصة لتحسين هيكل الرواتب في الأقسام الإدارية'
          ],
          'recommendations': [
            'إجراء برامج تدريب إضافية لموظفي قسم المبيعات',
            'مراجعة سياسات الغياب والتأخير',
            'تحسين نظام المكافآت والحوافز',
            'إدخال نظام تقييم أداء أكثر تفصيلاً'
          ],
          'trends': {
            'employeeGrowth': '+12.5%',
            'satisfactionRate': '87%',
            'attendanceRate': '92%',
            'performanceScore': '4.2/5'
          }
        },
        'metrics': {
          'totalEmployees': 450,
          'activeEmployees': 435,
          'departments': 8,
          'avgSalary': 2800,
          'turnoverRate': 3.2,
          'satisfactionScore': 87
        }
      };

      res.json(aiSummary);

    } catch (error) {

      safeLogError('Error generating AI summary:', error);
      res.status(500).json({'message': 'Failed to generate AI summary'});

    }

  });

  app.get('/api/ai/insights', isAuthenticated, async (req:  Request, res:  Response) => {

    try {

      const {companyId: _companyId, type} = req.query;

      const insights = {
        'employee': {
          'title': 'تحليل الموظفين الذكي',
          'insights': [
            {
              'id': 1,
              'type': 'performance',
              'title': 'أفضل أداء',
              'description': 'أحمد محمد علي يحقق أعلى معدل أداء (95%)',
              'impact': 'positive',
              'confidence': 92
            },
            {
              'id': 2,
              'type': 'attendance',
              'title': 'مشكلة التأخير',
              'description': 'قسم المبيعات يعاني من معدل تأخير مرتفع (15%)',
              'impact': 'negative',
              'confidence': 88
            },
            {
              'id': 3,
              'type': 'satisfaction',
              'title': 'رضا الموظفين',
              'description': 'رضا الموظفين في قسم IT وصل إلى 92%',
              'impact': 'positive',
              'confidence': 85
            }
          ]
        },
        'financial': {
          'title': 'التحليل المالي الذكي',
          'insights': [
            {
              'id': 1,
              'type': 'salary',
              'title': 'تحسين الرواتب',
              'description': 'إمكانية توفير 180,000 ريال سنوياً من خلال إعادة هيكلة الرواتب',
              'impact': 'positive',
              'confidence': 78
            },
            {
              'id': 2,
              'type': 'budget',
              'title': 'تجاوز الميزانية',
              'description': 'الإنفاق على التدريب تجاوز الميزانية بنسبة 12%',
              'impact': 'negative',
              'confidence': 82
            }
          ]
        },
        'operational': {
          'title': 'التحليل التشغيلي الذكي',
          'insights': [
            {
              'id': 1,
              'type': 'efficiency',
              'title': 'كفاءة العمل',
              'description': 'قسم تقنية المعلومات يحقق أعلى كفاءة تشغيلية',
              'impact': 'positive',
              'confidence': 90
            },
            {
              'id': 2,
              'type': 'productivity',
              'title': 'الإنتاجية',
              'description': 'الحاجة لتحسين إنتاجية قسم المبيعات',
              'impact': 'negative',
              'confidence': 75
            }
          ]
        }
      };

      const selectedInsights = type ? (insights as Record<string, unknown>)[type as string] : insights.employee;
      res.json(selectedInsights);

    } catch (error) {

      safeLogError('Error generating AI insights:', error);
      res.status(500).json({'message': 'Failed to generate AI insights'});

    }

  });

  app.get('/api/ai/predictions', isAuthenticated, async (req:  Request, res:  Response) => {

    try {

      const {companyId: _companyId, timeframe} = req.query;

      const predictions = {
        'shortTerm': [
          {
            'id': 1,
            'type': 'turnover',
            'title': 'توقع معدل دوران الموظفين',
            'prediction': 'انخفاض بنسبة 15% في الشهر القادم',
            'confidence': 85,
            'impact': 'positive',
            'timeframe': 'شهر واحد',
            'factors': ['تحسين سياسات الشركة', 'زيادة رضا الموظفين']
          },
          {
            'id': 2,
            'type': 'recruitment',
            'title': 'احتياجات التوظيف',
            'prediction': 'الحاجة لتوظيف 8 موظفين جدد',
            'confidence': 78,
            'impact': 'neutral',
            'timeframe': 'شهرين',
            'factors': ['نمو المشاريع', 'استقالات متوقعة']
          }
        ],
        'mediumTerm': [
          {
            'id': 3,
            'type': 'salary',
            'title': 'تحسين هيكل الرواتب',
            'prediction': 'إمكانية توفير 250,000 ريال سنوياً',
            'confidence': 82,
            'impact': 'positive',
            'timeframe': '6 أشهر',
            'factors': ['إعادة هيكلة الرواتب', 'تحسين نظام المكافآت']
          },
          {
            'id': 4,
            'type': 'growth',
            'title': 'نمو الشركة',
            'prediction': 'زيادة عدد الموظفين بنسبة 25%',
            'confidence': 75,
            'impact': 'positive',
            'timeframe': 'سنة واحدة',
            'factors': ['توسع المشاريع', 'زيادة الطلب']
          }
        ],
        'longTerm': [
          {
            'id': 5,
            'type': 'technology',
            'title': 'تحديث التقنيات',
            'prediction': 'الحاجة لاستثمار 500,000 ريال في التقنيات',
            'confidence': 70,
            'impact': 'positive',
            'timeframe': 'سنتين',
            'factors': ['تحديث الأنظمة', 'تحسين الكفاءة']
          }
        ]
      };

      const selectedPredictions = timeframe ? (predictions as Record<string, unknown>)[timeframe as string] : predictions.shortTerm;
      res.json(selectedPredictions);

    } catch (error) {

      safeLogError('Error generating AI predictions:', error);
      res.status(500).json({'message': 'Failed to generate AI predictions'});

    }

  });

  app.post('/api/ai/generate-report', isAuthenticated, async (req:  Request, res:  Response) => {

    try {

      const {type, companyId, parameters: _parameters} = req.body as { type: string; companyId: string; parameters: unknown };

      const reportTypes = {
        'employee': {
          'title': 'تقرير الموظفين الذكي',
          'content': 'تحليل شامل لبيانات الموظفين مع رؤى ذكية وتوصيات للتحسين',
          'sections': ['الأداء', 'الحضور', 'الرضا', 'التوصيات']
        },
        'financial': {
          'title': 'التقرير المالي الذكي',
          'content': 'تحليل مالي متقدم مع توقعات وتوصيات لتحسين الأداء المالي',
          'sections': ['الرواتب', 'الميزانية', 'التوقعات', 'التوصيات']
        },
        'operational': {
          'title': 'التقرير التشغيلي الذكي',
          'content': 'تحليل تشغيلي شامل مع مؤشرات الأداء والتوصيات',
          'sections': ['الكفاءة', 'الإنتاجية', 'الجودة', 'التوصيات']
        }
      };

      const selectedReport = (reportTypes as Record<string, unknown>)[type] ?? reportTypes.employee;

      const generatedReport = {
        'id': Date.now().toString(),
        type,
        companyId,
        'title': (selectedReport as { title: string; content: string; sections: string[] }).title,
        'content': (selectedReport as { title: string; content: string; sections: string[] }).content,
        'sections': (selectedReport as { title: string; content: string; sections: string[] }).sections,
        'generatedAt': new Date().toISOString(),
        'status': 'completed',
        'downloadUrl': `/api/reports/${Date.now()}/download`
      };

      res.json(generatedReport);

    } catch (error) {

      safeLogError('Error generating AI report:', error);
      res.status(500).json({'message': 'Failed to generate AI report'});

    }

  });

  app.get('/api/ai/trends', isAuthenticated, async (req:  Request, res:  Response) => {

    try {

      const {companyId: _companyId, metric} = req.query;

      const trends = {
        'employee': [
          {'month': 'يناير', 'value': 420, 'trend': 'up'},
          {'month': 'فبراير', 'value': 425, 'trend': 'up'},
          {'month': 'مارس', 'value': 430, 'trend': 'up'},
          {'month': 'أبريل', 'value': 435, 'trend': 'up'},
          {'month': 'مايو', 'value': 440, 'trend': 'up'},
          {'month': 'يونيو', 'value': 450, 'trend': 'up'}
        ],
        'satisfaction': [
          {'month': 'يناير', 'value': 82, 'trend': 'up'},
          {'month': 'فبراير', 'value': 84, 'trend': 'up'},
          {'month': 'مارس', 'value': 85, 'trend': 'up'},
          {'month': 'أبريل', 'value': 86, 'trend': 'up'},
          {'month': 'مايو', 'value': 87, 'trend': 'up'},
          {'month': 'يونيو', 'value': 87, 'trend': 'stable'}
        ],
        'attendance': [
          {'month': 'يناير', 'value': 88, 'trend': 'up'},
          {'month': 'فبراير', 'value': 89, 'trend': 'up'},
          {'month': 'مارس', 'value': 90, 'trend': 'up'},
          {'month': 'أبريل', 'value': 91, 'trend': 'up'},
          {'month': 'مايو', 'value': 92, 'trend': 'up'},
          {'month': 'يونيو', 'value': 92, 'trend': 'stable'}
        ]
      };

      const selectedTrends = metric ? (trends as Record<string, unknown>)[metric as string] : trends.employee;
      res.json(selectedTrends);

    } catch (error) {

      safeLogError('Error fetching AI trends:', error);
      res.status(500).json({'message': 'Failed to fetch AI trends'});

    }

  });

  const httpServer = createServer(app);
  return httpServer;

}
