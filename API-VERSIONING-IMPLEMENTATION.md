# API Versioning Implementation

## Overview

This document describes the implementation of versioned API endpoints for the HRMS Elite application. The new API version (v1) introduces standardized pagination, error handling, and response formats while maintaining backward compatibility with existing endpoints.

## Key Features

### 1. Versioned Routes (`/api/v1/`)
All new API endpoints are mounted under `/api/v1/` to provide clear versioning and allow for future API evolution.

### 2. Standardized Pagination
- **Query Parameters**: `?page` and `?pageSize`
- **Response Format**: Includes pagination metadata and HATEOAS links
- **Headers**: `X-Pagination-Page` and `X-Pagination-PageSize`

### 3. Standardized Error Responses
All errors follow a consistent format:
```json
{
  "code": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": { /* Additional error context */ },
  "traceId": "unique-trace-id-for-debugging"
}
```

### 4. Standardized Success Responses
All successful responses include:
```json
{
  "success": true,
  "data": { /* Response data */ },
  "message": "Optional success message",
  "timestamp": "2025-01-28T10:30:00.000Z"
}
```

## API Endpoints

### Authentication (`/api/v1/auth/`)
- `GET /user` - Get current user data
- `POST /login` - User login
- `POST /register` - User registration
- `POST /logout` - User logout
- `POST /refresh` - Refresh access token
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password
- `POST /verify-email` - Verify email address

### Documents (`/api/v1/documents/`)
- `GET /` - Get documents with pagination
- `POST /` - Create new document
- `GET /:id` - Get document by ID
- `PUT /:id` - Update document
- `DELETE /:id` - Delete document
- `GET /:id/download` - Download document
- `POST /upload` - Upload file with security validation
- `GET /categories` - Get document categories
- `GET /security/status` - Get security status (admin only)

### Employees (`/api/v1/employees/`)
- `GET /` - Get employees with pagination
- `POST /` - Create new employee
- `GET /:id` - Get employee by ID
- `PUT /:id` - Update employee
- `DELETE /:id` - Delete employee
- `GET /:id/leaves` - Get employee leaves with pagination
- `POST /:id/leaves` - Create employee leave
- `GET /:id/deductions` - Get employee deductions with pagination
- `POST /:id/deductions` - Create employee deduction
- `GET /:id/violations` - Get employee violations with pagination
- `POST /:id/violations` - Create employee violation

### Companies (`/api/v1/companies/`)
- `GET /:companyId/employees` - Get employees by company with pagination

## Pagination Implementation

### Request Format
```
GET /api/v1/documents?page=1&pageSize=20&category=licenses
```

### Response Format
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Document Name",
      "category": "licenses"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  },
  "links": {
    "first": "/api/v1/documents?page=1&pageSize=20&category=licenses",
    "last": "/api/v1/documents?page=5&pageSize=20&category=licenses",
    "next": "/api/v1/documents?page=2&pageSize=20&category=licenses"
  },
  "message": "Documents retrieved successfully",
  "timestamp": "2025-01-28T10:30:00.000Z"
}
```

## Error Handling

### Error Types
- `VALIDATION_ERROR` (400) - Input validation failed
- `AUTHENTICATION_ERROR` (401) - Authentication required
- `AUTHORIZATION_ERROR` (403) - Insufficient permissions
- `NOT_FOUND` (404) - Resource not found
- `CONFLICT` (409) - Resource conflict
- `RATE_LIMIT_EXCEEDED` (429) - Rate limit exceeded
- `INTERNAL_ERROR` (500) - Server error

### Error Response Example
```json
{
  "code": "VALIDATION_ERROR",
  "message": "Invalid document data",
  "details": {
    "field": "name",
    "message": "Document name is required"
  },
  "traceId": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Middleware

### API Versioning Middleware
- Adds `X-API-Version` header to responses
- Provides version context to request handlers

### Pagination Middleware
- Extracts and validates pagination parameters
- Sets pagination headers
- Provides pagination context to request handlers

### Error Handling Middleware
- Standardizes error responses
- Generates unique trace IDs
- Logs errors with context

## Migration Guide

### From Legacy to V1 API

#### 1. Update Base URL
```javascript
// Old
const baseUrl = '/api/documents';

// New
const baseUrl = '/api/v1/documents';
```

#### 2. Update Pagination
```javascript
// Old
const response = await fetch('/api/documents?limit=20&offset=0');

// New
const response = await fetch('/api/v1/documents?page=1&pageSize=20');
```

#### 3. Update Response Handling
```javascript
// Old
const documents = await response.json();

// New
const { data, pagination, links } = await response.json();
```

#### 4. Update Error Handling
```javascript
// Old
if (!response.ok) {
  const error = await response.json();
  console.error(error.message);
}

// New
if (!response.ok) {
  const error = await response.json();
  console.error(`${error.code}: ${error.message}`);
  console.error('Trace ID:', error.traceId);
}
```

## OpenAPI/Swagger Documentation

The OpenAPI specification has been updated to include:
- Versioned server URLs
- Standardized error response schemas
- Pagination response schemas
- Updated endpoint documentation

Access the Swagger UI at: `/api-docs`

## Security Features

### Document Upload Security
- File type validation (MIME type and signature)
- Antivirus scanning
- File size limits
- Secure storage with signed URLs
- Metadata stripping

### Authentication Security
- JWT tokens with refresh mechanism
- CSRF protection
- Rate limiting
- Secure cookie handling

## Testing

### Pagination Testing
```bash
# Test pagination
curl "http://localhost:3000/api/v1/documents?page=1&pageSize=10"

# Test pagination with filters
curl "http://localhost:3000/api/v1/documents?page=1&pageSize=20&category=licenses"
```

### Error Handling Testing
```bash
# Test validation error
curl -X POST "http://localhost:3000/api/v1/documents" \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}'

# Test authentication error
curl "http://localhost:3000/api/v1/documents"
```

## Backward Compatibility

The legacy API endpoints (`/api/*`) remain functional to ensure backward compatibility. However, new features and improvements are only available in the v1 API.

## Future Considerations

1. **API Versioning Strategy**: Consider semantic versioning for future API versions
2. **Deprecation Policy**: Establish clear deprecation timelines for legacy endpoints
3. **Feature Flags**: Implement feature flags for gradual rollout of new API features
4. **Monitoring**: Add comprehensive monitoring for API usage and performance
5. **Documentation**: Maintain up-to-date API documentation with examples

## Implementation Files

### Core Files
- `server/middleware/api-versioning.ts` - Versioning and pagination middleware
- `server/routes/v1/` - Versioned route implementations
- `server/swagger-setup.ts` - Updated OpenAPI configuration

### Route Files
- `server/routes/v1/auth-routes.ts` - Authentication endpoints
- `server/routes/v1/document-routes.ts` - Document management endpoints
- `server/routes/v1/employee-routes.ts` - Employee management endpoints

### Server Configuration
- `server/index.ts` - Updated to mount versioned routes

## Acceptance Criteria

✅ **All endpoints available under `/api/v1/`**
- Authentication endpoints: `/api/v1/auth/*`
- Document endpoints: `/api/v1/documents/*`
- Employee endpoints: `/api/v1/employees/*`
- Company endpoints: `/api/v1/companies/*`

✅ **Standardized pagination with Link/total headers**
- Query parameters: `?page` and `?pageSize`
- Response includes pagination metadata and HATEOAS links
- Headers: `X-Pagination-Page` and `X-Pagination-PageSize`

✅ **Standardized error shape: `{ code, message, details?, traceId }`**
- Consistent error response format across all endpoints
- Unique trace IDs for debugging
- Detailed error context when appropriate

✅ **OpenAPI (Swagger) updated to match**
- Updated server URLs to include v1 endpoints
- Added standardized error and pagination schemas
- Updated endpoint documentation with examples
- Swagger UI accessible at `/api-docs`

## Conclusion

The versioned API implementation provides a solid foundation for future API development while maintaining backward compatibility. The standardized pagination, error handling, and response formats improve developer experience and API consistency.
