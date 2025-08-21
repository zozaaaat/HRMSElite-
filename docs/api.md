# HRMS Elite API v1 Documentation

This document provides the OpenAPI 3.1 specification for the `/api/v1` endpoints and a summary of the roles and permissions matrix used in the system.

## OpenAPI 3.1 Specification

```yaml
openapi: 3.1.0
info:
  title: HRMS Elite API v1
  version: "1.0.0"
servers:
  - url: /api/v1
components:
  securitySchemes:
    sessionAuth:
      type: apiKey
      in: cookie
      name: connect.sid
    csrfToken:
      type: apiKey
      in: header
      name: X-CSRF-Token
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
        email:
          type: string
          format: email
      required: [id, email]
    Employee:
      type: object
      properties:
        id: { type: string }
        fullName: { type: string }
        companyId: { type: string }
      required: [fullName, companyId]
    Document:
      type: object
      properties:
        id: { type: string }
        title: { type: string }
      required: [title]
paths:
  /auth/user:
    get:
      summary: Get current user
      security:
        - sessionAuth: []
      responses:
        '200':
          description: User data
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
  /auth/login:
    post:
      summary: User login
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password]
              properties:
                email: { type: string, format: email }
                password: { type: string }
                rememberMe: { type: boolean }
      responses:
        '200': { description: Login successful }
  /auth/register:
    post:
      summary: Register a new user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/User'
      responses:
        '201': { description: User registered }
  /auth/logout:
    post:
      summary: Logout current user
      security:
        - sessionAuth: []
        - csrfToken: []
      responses:
        '200': { description: Logout successful }
  /auth/refresh:
    post:
      summary: Refresh authentication token
      responses:
        '200': { description: Token refreshed }
  /auth/forgot-password:
    post:
      summary: Start password reset flow
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email: { type: string, format: email }
              required: [email]
      responses:
        '200': { description: Reset email sent }
  /auth/reset-password:
    post:
      summary: Reset password
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                token: { type: string }
                newPassword: { type: string }
              required: [token, newPassword]
      responses:
        '200': { description: Password updated }
  /auth/verify-email:
    post:
      summary: Verify email address
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                token: { type: string }
              required: [token]
      responses:
        '200': { description: Email verified }
  /employees:
    get:
      summary: List all employees
      security:
        - sessionAuth: []
      responses:
        '200':
          description: List of employees
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Employee'
    post:
      summary: Create new employee
      security:
        - sessionAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Employee'
      responses:
        '201': { description: Employee created }
  /companies/{companyId}/employees:
    get:
      summary: List company employees
      security:
        - sessionAuth: []
      parameters:
        - in: path
          name: companyId
          required: true
          schema: { type: string }
      responses:
        '200': { description: List of employees }
  /employees/{id}:
    get:
      summary: Get employee by ID
      security:
        - sessionAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema: { type: string }
      responses:
        '200':
          description: Employee record
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Employee'
    put:
      summary: Update employee
      security:
        - sessionAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema: { type: string }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Employee'
      responses:
        '200': { description: Employee updated }
    delete:
      summary: Delete employee
      security:
        - sessionAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema: { type: string }
      responses:
        '204': { description: Employee removed }
  /employees/{id}/leaves:
    get:
      summary: List employee leave requests
      security:
        - sessionAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema: { type: string }
      responses:
        '200': { description: Leave list }
    post:
      summary: Create leave request
      security:
        - sessionAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema: { type: string }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                type: { type: string }
                startDate: { type: string, format: date }
                endDate: { type: string, format: date }
              required: [type, startDate, endDate]
      responses:
        '201': { description: Leave created }
  /employees/{id}/deductions:
    get:
      summary: List employee deductions
      security:
        - sessionAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema: { type: string }
      responses:
        '200': { description: Deduction list }
    post:
      summary: Add deduction
      security:
        - sessionAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema: { type: string }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                amount: { type: number }
                reason: { type: string }
              required: [amount, reason]
      responses:
        '201': { description: Deduction added }
  /employees/{id}/violations:
    get:
      summary: List employee violations
      security:
        - sessionAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema: { type: string }
      responses:
        '200': { description: Violation list }
    post:
      summary: Add violation
      security:
        - sessionAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema: { type: string }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                description: { type: string }
                date: { type: string, format: date }
              required: [description, date]
      responses:
        '201': { description: Violation added }
  /documents:
    get:
      summary: List documents
      security:
        - sessionAuth: []
      responses:
        '200':
          description: Document list
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Document'
    post:
      summary: Create document record
      security:
        - sessionAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Document'
      responses:
        '201': { description: Document created }
  /documents/{id}:
    get:
      summary: Get document by ID
      security:
        - sessionAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema: { type: string }
      responses:
        '200':
          description: Document data
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Document'
    put:
      summary: Update document
      security:
        - sessionAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema: { type: string }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Document'
      responses:
        '200': { description: Document updated }
    delete:
      summary: Delete document
      security:
        - sessionAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema: { type: string }
      responses:
        '204': { description: Document removed }
  /documents/{id}/download:
    get:
      summary: Download document file
      security:
        - sessionAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema: { type: string }
      responses:
        '200': { description: File download }
  /documents/upload:
    post:
      summary: Upload a file
      security:
        - sessionAuth: []
        - csrfToken: []
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                file:
                  type: string
                  format: binary
      responses:
        '201': { description: File uploaded }
  /documents/categories:
    get:
      summary: List document categories
      security:
        - sessionAuth: []
      responses:
        '200': { description: Category list }
  /security/status:
    get:
      summary: Get document service security status
      security:
        - sessionAuth: []
      responses:
        '200': { description: Service status }
```

## Roles and Permissions Matrix

| Permission | Super Admin | Company Manager | Employee | Supervisor | Worker |
| --- | --- | --- | --- | --- | --- |
| `companies:create` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `employees:view` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `employees:create` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `reports:view` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `attendance:view` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `leave_requests:approve` | ✅ | ✅ | ❌ | ✅ | ❌ |
| `payroll:process` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `documents:upload` | ✅ | ✅ | ✅ | ✅ | ❌ |

Roles and permissions are derived from the application's RBAC system. Refer to `ROLES-AND-PERMISSIONS.md` for a full list of permissions and usage examples.
