import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  'definition': {
    'openapi': '3.1.0',
    'info': {
      'title': 'HRMS Elite API - نظام إدارة الموارد البشرية',
      'version': '1.0.0',
      'description': `
## نظام إدارة الموارد البشرية المتقدم - API توثيق شامل

### الميزات الرئيسية:
- 🤖 **الذكاء الاصطناعي**: تحليلات ذكية وتقارير متقدمة
- 👥 **إدارة الموظفين**: ملفات شاملة وإدارة الأقسام
- 💰 **إدارة الرواتب**: نظام رواتب متكامل وحسابات متقدمة
- 📄 **إدارة المستندات**: تتبع التراخيص وإدارة الملفات
- ⏰ **إدارة الحضور**: تتبع الحضور والإجازات
- 🏢 **إدارة الشركات**: دعم متعدد الشركات والفروع
- 🔐 **الأمان**: نظام أدوار وصلاحيات متقدم

### التقنيات المستخدمة:
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: SQLite with Drizzle ORM
- **Security**: Helmet, CSRF Protection, Rate Limiting
- **Authentication**: Session-based with Role-based Access Control

### للبدء:
1. قم بتشغيل الخادم: \`npm run dev\`
2. انتقل إلى: \`http://localhost:3000/api-docs\`
3. استخدم Swagger UI لاختبار API
      `,
      'contact': {
        'name': 'HRMS Elite Team',
        'email': 'support@hrmselite.com',
        'url': 'https://hrmselite.com'
      },
      'license': {
        'name': 'MIT',
        'url': 'https://opensource.org/licenses/MIT'
      },
      'termsOfService': 'https://hrmselite.com/terms'
    },
    'servers': [
      {
        'url': 'http://localhost:3000',
        'description': 'Development server - خادم التطوير'
      },
      {
        'url': 'https://api.hrmselite.com',
        'description': 'Production server - خادم الإنتاج'
      }
    ],
    'components': {
      'securitySchemes': {
        'sessionAuth': {
          'type': 'apiKey',
          'in': 'cookie',
          'name': 'connect.sid',
          'description': 'Session authentication cookie - ملف تعريف الجلسة'
        },
        'csrfToken': {
          'type': 'apiKey',
          'in': 'header',
          'name': 'X-CSRF-Token',
          'description': 'CSRF protection token - رمز الحماية من CSRF'
        }
      },
      'schemas': {
        'Company': {
          'type': 'object',
          'description': 'Company entity - كيان الشركة',
          'properties': {
            'id': {
              'type': 'string',
              'example': 'company-1',
              'description': 'Unique company identifier - معرف الشركة الفريد'
            },
            'name': {
              'type': 'string',
              'example': 'شركة الاتحاد الخليجي',
              'description': 'Company name - اسم الشركة'
            },
            'commercialFileName': {
              'type': 'string',
              'example': 'الاتحاد الخليجي للتجارة',
              'description': 'Commercial file name - اسم الملف التجاري'
            },
            'department': {
              'type': 'string',
              'example': 'التجارة العامة',
              'description': 'Department - القسم'
            },
            'classification': {
              'type': 'string',
              'example': 'شركة ذات مسؤولية محدودة',
              'description': 'Company classification - تصنيف الشركة'
            },
            'status': {
              'type': 'string',
              'enum': ['active', 'inactive'],
              'example': 'active',
              'description': 'Company status - حالة الشركة'
            },
            'employeeCount': {
              'type': 'integer',
              'example': 45,
              'description': 'Number of employees - عدد الموظفين'
            },
            'industry': {
              'type': 'string',
              'example': 'التجارة',
              'description': 'Industry type - نوع الصناعة'
            },
            'establishmentDate': {
              'type': 'string',
              'format': 'date',
              'example': '2020-01-15',
              'description': 'Company establishment date - تاريخ تأسيس الشركة'
            }
          },
          'required': ['name', 'commercialFileName', 'department', 'classification']
        },
        'Employee': {
          'type': 'object',
          'description': 'Employee entity - كيان الموظف',
          'properties': {
            'id': {
              'type': 'string',
              'example': 'emp-1',
              'description': 'Unique employee identifier - معرف الموظف الفريد'
            },
            'fullName': {
              'type': 'string',
              'example': 'أحمد محمد علي',
              'description': 'Employee full name - الاسم الكامل للموظف'
            },
            'position': {
              'type': 'string',
              'example': 'مهندس برمجيات',
              'description': 'Employee position - منصب الموظف'
            },
            'department': {
              'type': 'string',
              'example': 'تكنولوجيا المعلومات',
              'description': 'Employee department - قسم الموظف'
            },
            'salary': {
              'type': 'number',
              'example': 3500,
              'description': 'Employee salary - راتب الموظف'
            },
            'status': {
              'type': 'string',
              'enum': ['active', 'inactive', 'archived'],
              'example': 'active',
              'description': 'Employee status - حالة الموظف'
            },
            'hireDate': {
              'type': 'string',
              'format': 'date',
              'example': '2023-01-15',
              'description': 'Employee hire date - تاريخ تعيين الموظف'
            },
            'companyId': {
              'type': 'string',
              'example': 'company-1',
              'description': 'Associated company ID - معرف الشركة المرتبطة'
            }
          },
          'required': ['fullName', 'position', 'department', 'salary', 'companyId']
        },
        'Leave': {
          'type': 'object',
          'description': 'Leave request entity - كيان طلب الإجازة',
          'properties': {
            'id': {
              'type': 'string',
              'example': 'leave-1',
              'description': 'Unique leave identifier - معرف الإجازة الفريد'
            },
            'employeeId': {
              'type': 'string',
              'example': 'emp-1',
              'description': 'Employee ID - معرف الموظف'
            },
            'employeeName': {
              'type': 'string',
              'example': 'أحمد محمد علي',
              'description': 'Employee name - اسم الموظف'
            },
            'type': {
              'type': 'string',
              'enum': ['annual', 'sick', 'emergency', 'maternity'],
              'example': 'annual',
              'description': 'Leave type - نوع الإجازة'
            },
            'startDate': {
              'type': 'string',
              'format': 'date',
              'example': '2025-02-10',
              'description': 'Leave start date - تاريخ بداية الإجازة'
            },
            'endDate': {
              'type': 'string',
              'format': 'date',
              'example': '2025-02-12',
              'description': 'Leave end date - تاريخ نهاية الإجازة'
            },
            'days': {
              'type': 'integer',
              'example': 3,
              'description': 'Number of leave days - عدد أيام الإجازة'
            },
            'reason': {
              'type': 'string',
              'example': 'إجازة شخصية',
              'description': 'Leave reason - سبب الإجازة'
            },
            'status': {
              'type': 'string',
              'enum': ['pending', 'approved', 'rejected'],
              'example': 'pending',
              'description': 'Leave status - حالة الإجازة'
            },
            'appliedDate': {
              'type': 'string',
              'format': 'date',
              'example': '2025-01-28',
              'description': 'Date when leave was applied - تاريخ تقديم طلب الإجازة'
            }
          },
          'required': ['employeeId', 'type', 'startDate', 'endDate', 'reason']
        },
        'Attendance': {
          'type': 'object',
          'description': 'Attendance record entity - كيان سجل الحضور',
          'properties': {
            'id': {
              'type': 'string',
              'example': 'att-1',
              'description': 'Unique attendance identifier - معرف الحضور الفريد'
            },
            'employeeId': {
              'type': 'string',
              'example': 'emp-1',
              'description': 'Employee ID - معرف الموظف'
            },
            'employeeName': {
              'type': 'string',
              'example': 'أحمد محمد علي',
              'description': 'Employee name - اسم الموظف'
            },
            'date': {
              'type': 'string',
              'format': 'date',
              'example': '2025-01-28',
              'description': 'Attendance date - تاريخ الحضور'
            },
            'checkIn': {
              'type': 'string',
              'example': '08:30',
              'description': 'Check-in time - وقت الحضور'
            },
            'checkOut': {
              'type': 'string',
              'example': '17:00',
              'description': 'Check-out time - وقت الانصراف'
            },
            'status': {
              'type': 'string',
              'enum': ['present', 'absent', 'late'],
              'example': 'present',
              'description': 'Attendance status - حالة الحضور'
            },
            'workingHours': {
              'type': 'number',
              'example': 8.5,
              'description': 'Total working hours - إجمالي ساعات العمل'
            },
            'overtime': {
              'type': 'number',
              'example': 0.5,
              'description': 'Overtime hours - ساعات العمل الإضافي'
            }
          },
          'required': ['employeeId', 'date', 'checkIn']
        },
        'License': {
          'type': 'object',
          'description': 'License entity - كيان الترخيص',
          'properties': {
            'id': {
              'type': 'string',
              'example': 'license-1',
              'description': 'Unique license identifier - معرف الترخيص الفريد'
            },
            'companyId': {
              'type': 'string',
              'example': 'company-1',
              'description': 'Company ID - معرف الشركة'
            },
            'licenseNumber': {
              'type': 'string',
              'example': 'LIC-2025-001',
              'description': 'License number - رقم الترخيص'
            },
            'type': {
              'type': 'string',
              'example': 'Commercial License',
              'description': 'License type - نوع الترخيص'
            },
            'issueDate': {
              'type': 'string',
              'format': 'date',
              'example': '2025-01-01',
              'description': 'License issue date - تاريخ إصدار الترخيص'
            },
            'expiryDate': {
              'type': 'string',
              'format': 'date',
              'example': '2026-01-01',
              'description': 'License expiry date - تاريخ انتهاء الترخيص'
            },
            'status': {
              'type': 'string',
              'enum': ['active', 'expired', 'suspended'],
              'example': 'active',
              'description': 'License status - حالة الترخيص'
            }
          },
          'required': ['companyId', 'licenseNumber', 'type', 'issueDate', 'expiryDate']
        },
        'Payroll': {
          'type': 'object',
          'description': 'Payroll record entity - كيان سجل الرواتب',
          'properties': {
            'employeeId': {
              'type': 'string',
              'example': 'emp-1',
              'description': 'Employee ID - معرف الموظف'
            },
            'employeeName': {
              'type': 'string',
              'example': 'أحمد محمد علي',
              'description': 'Employee name - اسم الموظف'
            },
            'month': {
              'type': 'string',
              'example': '2025-01',
              'description': 'Payroll month - شهر الرواتب'
            },
            'basicSalary': {
              'type': 'number',
              'example': 8000,
              'description': 'Basic salary - الراتب الأساسي'
            },
            'allowances': {
              'type': 'number',
              'example': 1200,
              'description': 'Allowances - البدلات'
            },
            'overtime': {
              'type': 'number',
              'example': 400,
              'description': 'Overtime pay - العمل الإضافي'
            },
            'deductions': {
              'type': 'number',
              'example': 800,
              'description': 'Deductions - الخصومات'
            },
            'netSalary': {
              'type': 'number',
              'example': 8800,
              'description': 'Net salary - صافي الراتب'
            },
            'status': {
              'type': 'string',
              'enum': ['pending', 'processed', 'paid'],
              'example': 'processed',
              'description': 'Payroll status - حالة الرواتب'
            }
          },
          'required': ['employeeId', 'month', 'basicSalary']
        },
        'Notification': {
          'type': 'object',
          'description': 'Notification entity - كيان الإشعار',
          'properties': {
            'id': {
              'type': 'string',
              'example': '1',
              'description': 'Unique notification identifier - معرف الإشعار الفريد'
            },
            'type': {
              'type': 'string',
              'example': 'leave_request',
              'description': 'Notification type - نوع الإشعار'
            },
            'title': {
              'type': 'string',
              'example': 'طلب إجازة جديد',
              'description': 'Notification title - عنوان الإشعار'
            },
            'message': {
              'type': 'string',
              'example': 'أحمد محمد علي قدّم طلب إجازة سنوية',
              'description': 'Notification message - رسالة الإشعار'
            },
            'isRead': {
              'type': 'boolean',
              'example': false,
              'description': 'Read status - حالة القراءة'
            },
            'createdAt': {
              'type': 'string',
              'format': 'date-time',
              'example': '2025-01-28T10:30:00Z',
              'description': 'Creation timestamp - وقت الإنشاء'
            },
            'actionUrl': {
              'type': 'string',
              'example': '/leave-requests',
              'description': 'Action URL - رابط الإجراء'
            }
          },
          'required': ['type', 'title', 'message']
        },
        'AIAnalytics': {
          'type': 'object',
          'description': 'AI Analytics entity - كيان تحليلات الذكاء الاصطناعي',
          'properties': {
            'id': {
              'type': 'string',
              'example': 'analytics-1',
              'description': 'Unique analytics identifier - معرف التحليلات الفريد'
            },
            'type': {
              'type': 'string',
              'enum': ['attendance', 'performance', 'salary', 'turnover'],
              'example': 'attendance',
              'description': 'Analytics type - نوع التحليلات'
            },
            'data': {
              'type': 'object',
              'description': 'Analytics data - بيانات التحليلات'
            },
            'insights': {
              'type': 'array',
              'items': {'type': 'string'},
              'example': ['معدل الحضور مرتفع', 'تحسن في الأداء'],
              'description': 'AI insights - رؤى الذكاء الاصطناعي'
            },
            'recommendations': {
              'type': 'array',
              'items': {'type': 'string'},
              'example': ['زيادة التدريب', 'تحسين بيئة العمل'],
              'description': 'AI recommendations - توصيات الذكاء الاصطناعي'
            },
            'createdAt': {
              'type': 'string',
              'format': 'date-time',
              'example': '2025-01-28T10:30:00Z',
              'description': 'Creation timestamp - وقت الإنشاء'
            }
          },
          'required': ['type', 'data']
        },
        'Error': {
          'type': 'object',
          'description': 'Error response entity - كيان استجابة الخطأ',
          'properties': {
            'message': {
              'type': 'string',
              'example': 'حدث خطأ في الخادم',
              'description': 'Error message - رسالة الخطأ'
            },
            'status': {
              'type': 'integer',
              'example': 500,
              'description': 'HTTP status code - رمز حالة HTTP'
            },
            'timestamp': {
              'type': 'string',
              'format': 'date-time',
              'description': 'Error timestamp - وقت حدوث الخطأ'
            },
            'details': {
              'type': 'object',
              'description': 'Additional error details - تفاصيل إضافية للخطأ'
            }
          },
          'required': ['message', 'status']
        }
      }
    },
    'security': [
      {
        'sessionAuth': [],
        'csrfToken': []
      }
    ],
    'tags': [
      {
        'name': 'Authentication',
        'description': 'Authentication and authorization endpoints - نقاط نهاية المصادقة والتفويض'
      },
      {
        'name': 'Companies',
        'description': 'Company management endpoints - نقاط نهاية إدارة الشركات'
      },
      {
        'name': 'Employees',
        'description': 'Employee management endpoints - نقاط نهاية إدارة الموظفين'
      },
      {
        'name': 'Attendance',
        'description': 'Attendance tracking endpoints - نقاط نهاية تتبع الحضور'
      },
      {
        'name': 'Leaves',
        'description': 'Leave management endpoints - نقاط نهاية إدارة الإجازات'
      },
      {
        'name': 'Payroll',
        'description': 'Payroll management endpoints - نقاط نهاية إدارة الرواتب'
      },
      {
        'name': 'Documents',
        'description': 'Document management endpoints - نقاط نهاية إدارة المستندات'
      },
      {
        'name': 'AI',
        'description': 'Artificial Intelligence endpoints - نقاط نهاية الذكاء الاصطناعي'
      },
      {
        'name': 'Reports',
        'description': 'Reporting and analytics endpoints - نقاط نهاية التقارير والتحليلات'
      },
      {
        'name': 'System',
        'description': 'System health and monitoring endpoints - نقاط نهاية صحة النظام والمراقبة'
      }
    ]
  },
  'apis': [
    './server/routes.ts',
    './server/routes/*.ts',
    './server/index.ts',
    './server/routes-documentation.ts'
  ]
};

export const specs = swaggerJsdoc(options);
