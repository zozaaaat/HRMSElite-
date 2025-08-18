# واجهات API للخدمات المصغرة - HRMS Elite

## نظرة عامة

هذا الملف يوثق واجهات API لكل خدمة في بنية الخدمات المصغرة، بما في ذلك النقاط النهائية والأنماط والاستجابات.

## 1. Auth Service API

### 1.1 Base URL
```
https://auth.hrmse.com/api/v1
```

### 1.2 Authentication Endpoints

#### تسجيل الدخول
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "companyId": "optional-company-id"
}

Response: 200 OK
{
  "success": true,
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "company_manager",
    "permissions": ["read:employees", "write:employees"],
    "companies": [
      {
        "id": "company-id",
        "name": "Company Name",
        "role": "company_manager"
      }
    ]
  },
  "token": "jwt-token",
  "expiresAt": "2024-01-01T00:00:00Z"
}
```

#### تسجيل الخروج
```http
POST /auth/logout
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### التحقق من الجلسة
```http
GET /auth/session
Authorization: Bearer <token>

Response: 200 OK
{
  "authenticated": true,
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "company": {
    "id": "company-id",
    "name": "Company Name"
  }
}
```

### 1.3 User Management Endpoints

#### إنشاء مستخدم جديد
```http
POST /users
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "employee",
  "companyId": "company-id"
}

Response: 201 Created
{
  "id": "new-user-id",
  "email": "newuser@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "employee",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### تحديث المستخدم
```http
PUT /users/{userId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Updated Name",
  "lastName": "Updated Last"
}

Response: 200 OK
{
  "id": "user-id",
  "email": "user@example.com",
  "firstName": "Updated Name",
  "lastName": "Updated Last",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### الحصول على صلاحيات المستخدم
```http
GET /users/{userId}/permissions?companyId={companyId}
Authorization: Bearer <token>

Response: 200 OK
{
  "permissions": [
    "read:employees",
    "write:employees",
    "read:companies",
    "admin:users"
  ]
}
```

## 2. Company Service API

### 2.1 Base URL
```
https://company.hrmse.com/api/v1
```

### 2.2 Company Management Endpoints

#### إنشاء شركة جديدة
```http
POST /companies
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Company Ltd",
  "commercialFileNumber": "CF123456",
  "establishmentDate": "2020-01-01",
  "industryType": "technology",
  "location": "Kuwait",
  "address": "Kuwait City",
  "phone": "+96512345678",
  "email": "info@newcompany.com"
}

Response: 201 Created
{
  "id": "company-id",
  "name": "New Company Ltd",
  "commercialFileNumber": "CF123456",
  "industryType": "technology",
  "location": "Kuwait",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### البحث في الشركات
```http
GET /companies?search=tech&industryType=technology&location=Kuwait&limit=10&offset=0
Authorization: Bearer <token>

Response: 200 OK
{
  "companies": [
    {
      "id": "company-id",
      "name": "Tech Company",
      "industryType": "technology",
      "location": "Kuwait",
      "totalEmployees": 50,
      "totalLicenses": 5
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

#### الحصول على إحصائيات الشركة
```http
GET /companies/{companyId}/stats
Authorization: Bearer <token>

Response: 200 OK
{
  "employeeCount": 50,
  "licenseCount": 5,
  "userCount": 10,
  "totalSalary": 50000.00,
  "averageSalary": 1000.00,
  "lastUpdated": "2024-01-01T00:00:00Z"
}
```

### 2.3 License Management Endpoints

#### إنشاء ترخيص جديد
```http
POST /companies/{companyId}/licenses
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Commercial License",
  "type": "commercial",
  "number": "LIC123456",
  "issueDate": "2024-01-01",
  "expiryDate": "2025-01-01",
  "issuingAuthority": "Ministry of Commerce",
  "location": "Kuwait"
}

Response: 201 Created
{
  "id": "license-id",
  "name": "Commercial License",
  "type": "commercial",
  "number": "LIC123456",
  "status": "active",
  "expiryDate": "2025-01-01",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### الحصول على التراخيص المنتهية الصلاحية
```http
GET /licenses/expiring?daysThreshold=30
Authorization: Bearer <token>

Response: 200 OK
{
  "licenses": [
    {
      "id": "license-id",
      "name": "Commercial License",
      "companyId": "company-id",
      "companyName": "Company Name",
      "expiryDate": "2024-02-01",
      "daysUntilExpiry": 15
    }
  ]
}
```

## 3. Employee Service API

### 3.1 Base URL
```
https://employee.hrmse.com/api/v1
```

### 3.2 Employee Management Endpoints

#### إنشاء موظف جديد
```http
POST /companies/{companyId}/employees
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Ahmed",
  "lastName": "Ali",
  "arabicName": "أحمد علي",
  "passportNumber": "P123456",
  "civilId": "123456789",
  "nationality": "Kuwaiti",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "employeeType": "citizen",
  "position": "Software Engineer",
  "department": "IT",
  "hireDate": "2024-01-01",
  "salary": 2000.00,
  "phone": "+96512345678",
  "email": "ahmed@company.com"
}

Response: 201 Created
{
  "id": "employee-id",
  "firstName": "Ahmed",
  "lastName": "Ali",
  "arabicName": "أحمد علي",
  "position": "Software Engineer",
  "department": "IT",
  "status": "active",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### البحث في الموظفين
```http
GET /companies/{companyId}/employees?search=ahmed&department=IT&status=active&limit=10&offset=0
Authorization: Bearer <token>

Response: 200 OK
{
  "employees": [
    {
      "id": "employee-id",
      "firstName": "Ahmed",
      "lastName": "Ali",
      "position": "Software Engineer",
      "department": "IT",
      "status": "active",
      "hireDate": "2024-01-01"
    }
  ],
  "pagination": {
    "total": 50,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

### 3.3 Leave Management Endpoints

#### إنشاء طلب إجازة
```http
POST /employees/{employeeId}/leaves
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "annual",
  "startDate": "2024-02-01",
  "endDate": "2024-02-05",
  "days": 5,
  "reason": "Annual vacation"
}

Response: 201 Created
{
  "id": "leave-id",
  "type": "annual",
  "status": "pending",
  "startDate": "2024-02-01",
  "endDate": "2024-02-05",
  "days": 5,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### الموافقة على طلب إجازة
```http
PUT /leaves/{leaveId}/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "approvedBy": "approver-id",
  "notes": "Approved"
}

Response: 200 OK
{
  "id": "leave-id",
  "status": "approved",
  "approvedBy": "approver-id",
  "approvedAt": "2024-01-01T00:00:00Z"
}
```

### 3.4 Deduction Management Endpoints

#### إنشاء خصم
```http
POST /employees/{employeeId}/deductions
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "late",
  "amount": 50.00,
  "reason": "Late arrival",
  "date": "2024-01-01"
}

Response: 201 Created
{
  "id": "deduction-id",
  "type": "late",
  "amount": 50.00,
  "reason": "Late arrival",
  "status": "active",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

## 4. Document Service API

### 4.1 Base URL
```
https://document.hrmse.com/api/v1
```

### 4.2 File Management Endpoints

#### رفع ملف
```http
POST /documents/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- file: [binary file]
- metadata: {
    "name": "Employee Contract",
    "documentType": "contract",
    "companyId": "company-id",
    "tags": ["contract", "employee"],
    "isPublic": false
  }

Response: 201 Created
{
  "id": "document-id",
  "name": "Employee Contract",
  "originalName": "contract.pdf",
  "fileSize": 1024000,
  "mimeType": "application/pdf",
  "documentType": "contract",
  "uploadedBy": "user-id",
  "downloadUrl": "https://document.hrmse.com/download/document-id",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### تحميل ملف
```http
GET /documents/{documentId}/download
Authorization: Bearer <token>

Response: 200 OK
Content-Type: application/octet-stream
Content-Disposition: attachment; filename="contract.pdf"

[binary file content]
```

#### البحث في المستندات
```http
GET /documents?search=contract&documentType=contract&companyId=company-id&limit=10&offset=0
Authorization: Bearer <token>

Response: 200 OK
{
  "documents": [
    {
      "id": "document-id",
      "name": "Employee Contract",
      "documentType": "contract",
      "fileSize": 1024000,
      "uploadedBy": "user-id",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

### 4.3 Folder Management Endpoints

#### إنشاء مجلد
```http
POST /folders
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Employee Documents",
  "parentFolderId": "parent-folder-id",
  "companyId": "company-id",
  "isPublic": false
}

Response: 201 Created
{
  "id": "folder-id",
  "name": "Employee Documents",
  "parentFolderId": "parent-folder-id",
  "createdBy": "user-id",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

## 5. Notification Service API

### 5.1 Base URL
```
https://notification.hrmse.com/api/v1
```

### 5.2 Notification Management Endpoints

#### إنشاء إشعار
```http
POST /notifications
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "New Employee Added",
  "message": "Ahmed Ali has been added to your company",
  "type": "info",
  "priority": "normal",
  "recipientId": "user-id",
  "channelId": "email",
  "data": {
    "employeeId": "employee-id",
    "companyId": "company-id"
  }
}

Response: 201 Created
{
  "id": "notification-id",
  "title": "New Employee Added",
  "message": "Ahmed Ali has been added to your company",
  "status": "pending",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### إرسال إشعار
```http
POST /notifications/{notificationId}/send
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "notification-id",
  "status": "sent",
  "sentAt": "2024-01-01T00:00:00Z"
}
```

#### الحصول على إشعارات المستخدم
```http
GET /users/{userId}/notifications?unreadOnly=true&limit=10&offset=0
Authorization: Bearer <token>

Response: 200 OK
{
  "notifications": [
    {
      "id": "notification-id",
      "title": "New Employee Added",
      "message": "Ahmed Ali has been added to your company",
      "type": "info",
      "isRead": false,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

#### تحديد الإشعار كمقروء
```http
PUT /notifications/{notificationId}/read
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "notification-id",
  "isRead": true,
  "readAt": "2024-01-01T00:00:00Z"
}
```

### 5.3 Channel Management Endpoints

#### إنشاء قناة
```http
POST /channels
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Company Updates",
  "description": "Updates about company activities",
  "type": "email"
}

Response: 201 Created
{
  "id": "channel-id",
  "name": "Company Updates",
  "type": "email",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### البث إلى قناة
```http
POST /channels/{channelId}/broadcast
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Company Update",
  "message": "Important company announcement",
  "data": {
    "announcementId": "announcement-id"
  }
}

Response: 200 OK
{
  "channelId": "channel-id",
  "recipientsCount": 50,
  "sentAt": "2024-01-01T00:00:00Z"
}
```

## 6. Analytics Service API

### 6.1 Base URL
```
https://analytics.hrmse.com/api/v1
```

### 6.2 Event Tracking Endpoints

#### تتبع حدث
```http
POST /events/track
Authorization: Bearer <token>
Content-Type: application/json

{
  "eventType": "user.login",
  "userId": "user-id",
  "companyId": "company-id",
  "sessionId": "session-id",
  "pageUrl": "/dashboard",
  "actionName": "login",
  "actionData": {
    "method": "email",
    "device": "desktop"
  }
}

Response: 200 OK
{
  "eventId": "event-id",
  "tracked": true,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### تتبع عرض صفحة
```http
POST /events/pageview
Authorization: Bearer <token>
Content-Type: application/json

{
  "pageUrl": "/employees",
  "userId": "user-id",
  "companyId": "company-id",
  "sessionId": "session-id",
  "timeSpent": 120
}

Response: 200 OK
{
  "pageViewId": "pageview-id",
  "tracked": true,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 6.3 Analytics Endpoints

#### إحصائيات المستخدم
```http
GET /analytics/users/{userId}?period=last30days
Authorization: Bearer <token>

Response: 200 OK
{
  "userId": "user-id",
  "period": "last30days",
  "metrics": {
    "totalSessions": 25,
    "totalPageViews": 150,
    "averageSessionDuration": 1800,
    "mostVisitedPages": [
      {
        "page": "/dashboard",
        "views": 50
      }
    ]
  }
}
```

#### إحصائيات الشركة
```http
GET /analytics/companies/{companyId}?period=last30days
Authorization: Bearer <token>

Response: 200 OK
{
  "companyId": "company-id",
  "period": "last30days",
  "metrics": {
    "totalUsers": 25,
    "totalEmployees": 100,
    "totalLicenses": 10,
    "activeUsers": 20,
    "userEngagement": {
      "averageSessionsPerUser": 15,
      "averageSessionDuration": 1800
    }
  }
}
```

### 6.4 Report Generation Endpoints

#### إنشاء تقرير
```http
POST /reports
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Employee Activity Report",
  "description": "Monthly employee activity report",
  "reportType": "employee_activity",
  "config": {
    "companyId": "company-id",
    "period": "last30days",
    "includeDetails": true
  }
}

Response: 201 Created
{
  "id": "report-id",
  "name": "Employee Activity Report",
  "status": "pending",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### الحصول على تقرير
```http
GET /reports/{reportId}
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "report-id",
  "name": "Employee Activity Report",
  "status": "completed",
  "resultUrl": "https://analytics.hrmse.com/reports/report-id/download",
  "completedAt": "2024-01-01T00:00:00Z"
}
```

## 7. Error Handling

### 7.1 Standard Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ],
    "timestamp": "2024-01-01T00:00:00Z",
    "requestId": "req-123456"
  }
}
```

### 7.2 Common Error Codes
- `VALIDATION_ERROR`: بيانات الإدخال غير صحيحة
- `AUTHENTICATION_ERROR`: خطأ في المصادقة
- `AUTHORIZATION_ERROR`: خطأ في الصلاحيات
- `NOT_FOUND`: المورد غير موجود
- `CONFLICT`: تضارب في البيانات
- `RATE_LIMIT_EXCEEDED`: تجاوز حد الطلبات
- `INTERNAL_SERVER_ERROR`: خطأ داخلي في الخادم

## 8. Authentication & Authorization

### 8.1 JWT Token Format
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user-id",
    "email": "user@example.com",
    "companyId": "company-id",
    "permissions": ["read:employees", "write:employees"],
    "iat": 1640995200,
    "exp": 1641081600
  }
}
```

### 8.2 Required Headers
```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
X-Company-ID: <company-id> (optional)
```

## 9. Rate Limiting

### 9.1 Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

### 9.2 Rate Limit Response
```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json

{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded",
    "retryAfter": 60
  }
}
```

## 10. Pagination

### 10.1 Pagination Parameters
- `limit`: عدد العناصر في الصفحة (الافتراضي: 20)
- `offset`: عدد العناصر المراد تخطيها (الافتراضي: 0)
- `page`: رقم الصفحة (بديل لـ offset)

### 10.2 Pagination Response
```json
{
  "data": [...],
  "pagination": {
    "total": 100,
    "limit": 20,
    "offset": 0,
    "page": 1,
    "totalPages": 5,
    "hasMore": true,
    "hasPrevious": false
  }
}
```

## 11. WebSocket Events

### 11.1 Real-time Notifications
```javascript
// الاتصال بـ WebSocket
const ws = new WebSocket('wss://notification.hrmse.com/ws');

// استقبال الإشعارات
ws.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  console.log('New notification:', notification);
};

// مثال على رسالة WebSocket
{
  "type": "notification",
  "data": {
    "id": "notification-id",
    "title": "New Employee Added",
    "message": "Ahmed Ali has been added to your company",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### 11.2 Real-time Analytics
```javascript
// استقبال تحديثات التحليلات
ws.onmessage = (event) => {
  const analytics = JSON.parse(event.data);
  if (analytics.type === 'analytics_update') {
    updateDashboard(analytics.data);
  }
};
```

هذا التوثيق يوفر دليلاً شاملاً لواجهات API لكل خدمة في بنية الخدمات المصغرة، مما يسهل على المطورين فهم كيفية التفاعل مع كل خدمة.
