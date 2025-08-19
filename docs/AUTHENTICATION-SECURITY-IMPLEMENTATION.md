# Authentication Security Implementation

## Overview

The HRMS Elite application implements secure authentication controls that remove header-based authentication bypasses and ensure proper authentication mechanisms are used in all environments.

## Security Changes Implemented

### 1. Header-Based Authentication Bypass Removal

**Before (Insecure):**
```typescript
// ❌ Unrestricted header-based authentication
} else if (req.headers['x-user-role'] && req.headers['x-user-id']) {
  const userRole = req.headers['x-user-role'] as string;
  const userId = req.headers['x-user-id'] as string;
  // ... authentication logic
}
```

**After (Secure):**
```typescript
// ✅ Gated development authentication bypass
} else if (
  env.NODE_ENV === 'development' && 
  env.ALLOW_DEV_AUTH === 'true' && 
  req.headers['x-user-role'] && 
  req.headers['x-user-id']
) {
  const userRole = req.headers['x-user-role'] as string;
  const userId = req.headers['x-user-id'] as string;
  
  // Log development bypass usage for audit
  log.warn('Development authentication bypass used', {
    userId,
    userRole,
    userEmail,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  }, 'AUTH');
  
  // ... authentication logic
}
```

### 2. Environment Variable Configuration

Added `ALLOW_DEV_AUTH` environment variable to control development authentication:

```typescript
// Environment schema
const envSchema = z.object({
  // ... other fields
  
  // Development authentication bypass (only for local development)
  ALLOW_DEV_AUTH: z.string().optional(),
});
```

**Environment Configuration:**

```bash
# Development with dev auth enabled
NODE_ENV=development
ALLOW_DEV_AUTH=true

# Development with dev auth disabled
NODE_ENV=development
ALLOW_DEV_AUTH=false

# Production (dev auth ignored)
NODE_ENV=production
ALLOW_DEV_AUTH=true  # Ignored in production

# Test environment (dev auth disabled)
NODE_ENV=test
ALLOW_DEV_AUTH=true  # Ignored in test
```

### 3. Route-Level Authentication Updates

**Updated Routes:**
- `server/routes/payroll-routes.ts` - Removed custom authentication middleware
- `server/routes/document-routes.ts` - Removed custom authentication middleware

**Before:**
```typescript
// ❌ Custom authentication middleware with header bypass
const isAuthenticated = (req: Request, _res: Response, next: NextFunction) => {
  const userRole = (req.headers['x-user-role'] as string) || 'company_manager';
  const userId = (req.headers['x-user-id'] as string) || '1';
  // ... authentication logic
};
```

**After:**
```typescript
// ✅ Using proper authentication middleware
import { isAuthenticated, requireRole } from '../middleware/auth';

// Routes use proper authentication
app.get('/api/payroll/employee/:employeeId', isAuthenticated, async (req, res) => {
  // ... route logic
});
```

## Security Controls

### 1. Development Authentication Gating

**Requirements:**
- ✅ `NODE_ENV === 'development'`
- ✅ `ALLOW_DEV_AUTH === 'true'`
- ✅ Both `x-user-role` and `x-user-id` headers present

**Security Features:**
- ✅ **Environment Validation**: Only works in development
- ✅ **Explicit Flag**: Requires explicit `ALLOW_DEV_AUTH=true`
- ✅ **Audit Logging**: All bypass usage logged with context
- ✅ **Header Validation**: Requires both required headers

### 2. Production Security

**Production Behavior:**
- ❌ **Header Authentication**: Completely disabled
- ❌ **Development Bypass**: Ignored regardless of `ALLOW_DEV_AUTH`
- ✅ **Proper Authentication**: Only JWT tokens and sessions allowed
- ✅ **Security Logging**: All authentication attempts logged

### 3. Test Environment Security

**Test Environment Behavior:**
- ❌ **Header Authentication**: Disabled for consistent testing
- ❌ **Development Bypass**: Ignored to prevent test pollution
- ✅ **Proper Authentication**: Use test-specific authentication methods

## CI/CD Security Checks

### 1. Security Check Script

**File:** `scripts/security-check.js`

**Features:**
- 🔍 **Pattern Detection**: Scans for header-based authentication patterns
- 🚨 **Critical Issues**: Identifies header auth bypasses in production code
- 📊 **Comprehensive Report**: Detailed security analysis
- ⚡ **Fast Scanning**: Efficient file system traversal
- 🎯 **Focused Detection**: Excludes test files and documentation

**Detected Patterns:**
```javascript
const SECURITY_PATTERNS = {
  headerAuthBypass: [
    /req\.headers\['x-user-role'\]/g,
    /req\.headers\['x-user-id'\]/g,
    /req\.headers\['x-user-email'\]/g,
    /x-user-role/g,
    /x-user-id/g,
    /x-user-email/g
  ],
  // ... other patterns
};
```

### 2. GitHub Actions Workflow

**File:** `.github/workflows/security-check.yml`

**Triggers:**
- Push to main/develop/production branches
- Pull requests to main/develop/production branches
- Manual workflow dispatch

**Actions:**
- ✅ **Security Scan**: Runs comprehensive security check
- 🚨 **Fail on Critical Issues**: CI fails if header auth bypasses detected
- 💬 **PR Comments**: Automatic comments on failed PRs
- 📁 **Artifact Upload**: Security reports saved as artifacts

### 3. CI Failure Conditions

**Critical Issues (CI Fails):**
- Header-based authentication bypasses in production code
- Unrestricted development authentication bypasses
- Hardcoded secrets or credentials

**Warnings (CI Passes):**
- Development authentication bypasses properly gated
- Debug code in non-production files
- Insecure CORS patterns in test files

## Testing Implementation

### 1. Authentication Security Tests

**File:** `tests/auth-security.test.ts`

**Test Coverage:**
- ✅ **Development Environment**: Tests with `ALLOW_DEV_AUTH=true`
- ✅ **Development Environment**: Tests with `ALLOW_DEV_AUTH=false`
- ✅ **Production Environment**: Tests header auth rejection
- ✅ **Test Environment**: Tests header auth rejection
- ✅ **Edge Cases**: Partial headers, empty values, malformed data
- ✅ **Security Validation**: XSS attempts, long values
- ✅ **Acceptance Criteria**: Verifies all requirements met

### 2. Test Scenarios

**Development with Dev Auth Enabled:**
```typescript
it('should allow header-based authentication in development', async () => {
  process.env.NODE_ENV = 'development';
  process.env.ALLOW_DEV_AUTH = 'true';
  
  const response = await request(app)
    .get('/api/test')
    .set('x-user-role', 'admin')
    .set('x-user-id', '123')
    .expect(200);
    
  expect(response.body.user.role).toBe('admin');
});
```

**Production Environment:**
```typescript
it('should reject header-based authentication in production', async () => {
  process.env.NODE_ENV = 'production';
  process.env.ALLOW_DEV_AUTH = 'true'; // Should be ignored
  
  const response = await request(app)
    .get('/api/test')
    .set('x-user-role', 'admin')
    .set('x-user-id', '123')
    .expect(401);
    
  expect(response.body.message).toBe('Authentication required');
});
```

## Security Benefits

### 1. Attack Surface Reduction

**Before:**
- ❌ **Unrestricted Bypass**: Any client could authenticate via headers
- ❌ **No Environment Control**: Bypass worked in all environments
- ❌ **No Audit Trail**: No logging of bypass usage
- ❌ **Route-Level Bypasses**: Multiple custom authentication implementations

**After:**
- ✅ **Environment Gating**: Only works in development with explicit flag
- ✅ **Production Security**: Completely disabled in production
- ✅ **Audit Logging**: All bypass usage logged with context
- ✅ **Centralized Authentication**: Single authentication middleware

### 2. Compliance and Audit

**Security Logging:**
```typescript
log.warn('Development authentication bypass used', {
  userId: '123',
  userRole: 'admin',
  userEmail: 'admin@example.com',
  ip: '192.168.1.100',
  userAgent: 'Mozilla/5.0...',
  timestamp: '2024-01-15T10:30:00.000Z'
}, 'AUTH');
```

**Audit Trail:**
- ✅ **Timestamp**: All events timestamped
- ✅ **User Context**: User ID, role, email logged
- ✅ **Request Context**: IP address, user agent logged
- ✅ **Security Category**: Events categorized as 'AUTH'

### 3. Development Workflow Security

**Safe Development:**
- ✅ **Explicit Control**: Must explicitly enable dev auth
- ✅ **Environment Isolation**: Different behavior per environment
- ✅ **Audit Trail**: All development bypass usage tracked
- ✅ **CI Protection**: Automated detection of bypasses

## Environment Configuration Examples

### Development Environment
```bash
# .env.development
NODE_ENV=development
ALLOW_DEV_AUTH=true
JWT_SECRET=your-jwt-secret-here
SESSION_SECRET=your-session-secret-here
```

### Production Environment
```bash
# .env.production
NODE_ENV=production
# ALLOW_DEV_AUTH not set (ignored in production)
JWT_SECRET=your-production-jwt-secret
SESSION_SECRET=your-production-session-secret
```

### Test Environment
```bash
# .env.test
NODE_ENV=test
# ALLOW_DEV_AUTH not set (ignored in test)
JWT_SECRET=test-jwt-secret
SESSION_SECRET=test-session-secret
```

## Monitoring and Alerting

### 1. Security Monitoring

**Development Bypass Usage:**
```bash
# Monitor development authentication bypass usage
grep "Development authentication bypass used" /var/log/application.log

# Count bypass usage by user
grep "Development authentication bypass used" /var/log/application.log | jq '.userId' | sort | uniq -c
```

### 2. Security Alerts

**Alert Conditions:**
- High volume of development bypass usage
- Bypass usage outside development hours
- Bypass usage from unexpected IP addresses
- Multiple failed authentication attempts

### 3. Compliance Reporting

**Security Reports:**
- Development bypass usage reports
- Authentication failure analysis
- Security incident tracking
- Compliance audit trails

## Troubleshooting

### 1. Common Issues

**Development Authentication Not Working:**
```bash
# Check environment variables
echo $NODE_ENV
echo $ALLOW_DEV_AUTH

# Should be:
# NODE_ENV=development
# ALLOW_DEV_AUTH=true
```

**CI Security Check Failing:**
```bash
# Run security check locally
node scripts/security-check.js

# Look for header auth bypass patterns
grep -r "x-user-role" server/
grep -r "x-user-id" server/
```

### 2. Debug Mode

**Enable Debug Logging:**
```typescript
// Add to environment
DEBUG_AUTH=true

// Enhanced logging
if (process.env.DEBUG_AUTH) {
  log.info('Authentication attempt', {
    method: req.method,
    path: req.path,
    headers: req.headers,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  }, 'AUTH_DEBUG');
}
```

## Migration Guide

### 1. For Existing Routes

**Before Migration:**
```typescript
// Remove custom authentication middleware
const isAuthenticated = (req: Request, _res: Response, next: NextFunction) => {
  const userRole = (req.headers['x-user-role'] as string) || 'company_manager';
  const userId = (req.headers['x-user-id'] as string) || '1';
  // ... custom logic
};
```

**After Migration:**
```typescript
// Use proper authentication middleware
import { isAuthenticated, requireRole } from '../middleware/auth';

// Update route definitions
app.get('/api/route', isAuthenticated, requireRole(['admin']), (req, res) => {
  // ... route logic
});
```

### 2. For Tests

**Update Test Authentication:**
```typescript
// Before: Using headers directly
.set('x-user-role', 'admin')
.set('x-user-id', '123')

// After: Use proper test authentication
// Option 1: Mock authentication middleware
// Option 2: Use test-specific authentication tokens
// Option 3: Use session-based authentication for tests
```

## Conclusion

The authentication security implementation successfully meets all specified requirements:

✅ **Header Bypass Removal**: All unrestricted header-based authentication bypasses removed  
✅ **Development Gating**: Development authentication properly gated behind environment flags  
✅ **Production Security**: No route can authenticate via custom headers in production  
✅ **CI Protection**: Automated security checks fail if bypass code appears in production artifacts  
✅ **Audit Trail**: Comprehensive logging of all authentication attempts  
✅ **Testing Coverage**: Complete test suite verifying security controls  

The implementation provides robust security while maintaining development productivity through properly controlled development authentication bypasses.
