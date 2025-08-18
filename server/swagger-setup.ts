import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "HRMS Elite API",
      version: "1.0.0",
      description:
        "نظام إدارة الموارد البشرية المتكامل مع دعم الذكاء الاصطناعي",
      contact: {
        name: "API Support",
        email: "api-support@hrmselite.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "https://api.hrmselite.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        sessionAuth: {
          type: "apiKey",
          in: "cookie",
          name: "connect.sid",
          description: "معرف الجلسة المخزن في الكوكي",
        },
        csrfToken: {
          type: "apiKey",
          in: "header",
          name: "X-CSRF-Token",
          description: "رمز CSRF للحماية من الهجمات",
        },
      },
      schemas: {
        Company: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "معرف الشركة الفريد",
              example: "company-1",
            },
            name: {
              type: "string",
              description: "اسم الشركة",
              example: "شركة الاتحاد الخليجي",
            },
            commercialFileName: {
              type: "string",
              description: "الاسم التجاري",
              example: "الاتحاد الخليجي للتجارة",
            },
            department: {
              type: "string",
              description: "قسم الشركة",
              example: "التجارة العامة",
            },
            classification: {
              type: "string",
              description: "تصنيف الشركة",
              example: "شركة ذات مسؤولية محدودة",
            },
            status: {
              type: "string",
              enum: ["active", "inactive"],
              description: "حالة الشركة",
              example: "active",
            },
            employeeCount: {
              type: "integer",
              description: "عدد الموظفين",
              example: 45,
            },
            industry: {
              type: "string",
              description: "الصناعة",
              example: "التجارة",
            },
            establishmentDate: {
              type: "string",
              format: "date",
              description: "تاريخ التأسيس",
              example: "2020-01-15",
            },
          },
          required: [
            "name",
            "commercialFileName",
            "classification",
            "industry",
            "establishmentDate",
          ],
        },
        Employee: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "معرف الموظف الفريد",
              example: "emp-1",
            },
            fullName: {
              type: "string",
              description: "الاسم الكامل للموظف",
              example: "أحمد محمد علي",
            },
            position: {
              type: "string",
              description: "الموقع الوظيفي",
              example: "مهندس برمجيات",
            },
            department: {
              type: "string",
              description: "القسم",
              example: "تكنولوجيا المعلومات",
            },
            salary: {
              type: "number",
              description: "الراتب الأساسي",
              example: 3500,
            },
            status: {
              type: "string",
              enum: ["active", "inactive", "archived"],
              description: "حالة الموظف",
              example: "active",
            },
            hireDate: {
              type: "string",
              format: "date",
              description: "تاريخ التعيين",
              example: "2023-01-15",
            },
            companyId: {
              type: "string",
              description: "معرف الشركة",
              example: "company-1",
            },
          },
          required: [
            "fullName",
            "position",
            "department",
            "salary",
            "companyId",
          ],
        },
        Leave: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "معرف الإجازة الفريد",
              example: "leave-1",
            },
            employeeId: {
              type: "string",
              description: "معرف الموظف",
              example: "emp-1",
            },
            employeeName: {
              type: "string",
              description: "اسم الموظف",
              example: "أحمد محمد علي",
            },
            type: {
              type: "string",
              enum: ["annual", "sick", "emergency", "maternity"],
              description: "نوع الإجازة",
              example: "annual",
            },
            startDate: {
              type: "string",
              format: "date",
              description: "تاريخ بداية الإجازة",
              example: "2025-02-10",
            },
            endDate: {
              type: "string",
              format: "date",
              description: "تاريخ نهاية الإجازة",
              example: "2025-02-12",
            },
            days: {
              type: "integer",
              description: "عدد أيام الإجازة",
              example: 3,
            },
            reason: {
              type: "string",
              description: "سبب الإجازة",
              example: "إجازة شخصية",
            },
            status: {
              type: "string",
              enum: ["pending", "approved", "rejected"],
              description: "حالة الإجازة",
              example: "pending",
            },
            appliedDate: {
              type: "string",
              format: "date-time",
              description: "تاريخ تقديم الطلب",
              example: "2025-01-28T10:30:00.000Z",
            },
          },
          required: ["employeeId", "type", "startDate", "endDate", "reason"],
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  description: "رسالة الخطأ",
                },
                code: {
                  type: "string",
                  description: "رمز الخطأ",
                },
                details: {
                  type: "object",
                  description: "تفاصيل إضافية",
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        sessionAuth: [],
        csrfToken: [],
      },
    ],
    tags: [
      {
        name: "Companies",
        description: "إدارة الشركات",
      },
      {
        name: "Employees",
        description: "إدارة الموظفين",
      },
      {
        name: "Leaves",
        description: "إدارة الإجازات",
      },
      {
        name: "Attendance",
        description: "إدارة الحضور",
      },
      {
        name: "Documents",
        description: "إدارة المستندات",
      },
      {
        name: "AI",
        description: "الذكاء الاصطناعي",
      },
      {
        name: "Health",
        description: "صحة النظام",
      },
    ],
  },
  apis: [
    "./server/routes/*.ts",
    "./server/models/*.ts",
    "./server/middleware/*.ts",
  ],
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };
