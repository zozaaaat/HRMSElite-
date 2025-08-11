# Security Implementation - HRMS Elite

## Overview
This document outlines the comprehensive security implementation for the HRMS Elite application, including header protection and CSRF protection.

## 1. Header Protection (Helmet)

### Implementation
The application uses the `helmet` middleware to set various HTTP headers that help protect against common web vulnerabilities.

### Configuration
```typescript
// server/index.ts
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      ...(process.env.NODE_ENV === 'production' && { upgradeInsecureRequests: [] })
    }
  },
  crossOriginEmbedderPolicy: false, // Disabled for development compatibility
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
```

### Headers Set by Helmet
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-XSS-Protection**: Enables browser's XSS filtering
- **Strict-Transport-Security**: Enforces HTTPS (in production)
- **Content-Security-Policy**: Controls resource loading
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Controls browser features

## 2. CSRF Protection

### Implementation
The application implements comprehensive CSRF protection using the `csurf` middleware with enhanced configuration.

### Server-Side Configuration
```typescript
// server/index.ts
import csrf from 'csurf';
import cookieParser from 'cookie-parser';

// Apply cookie parser middleware
app.use(cookieParser());

// Apply CSRF protection with enhanced configuration
app.use(csrf({ 
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Apply CSRF token middleware for frontend integration
app.use(csrfTokenMiddleware);
```

### CSRF Token Endpoint
```typescript
// GET /api/csrf-token
app.get('/api/csrf-token', getCsrfToken);
```

### Error Handling
```typescript
// Enhanced CSRF error handler
export const csrfErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.code === 'EBADCSRFTOKEN') {
    console.error('CSRF Token Error:', {
      url: req.url,
      method: req.method,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
    
    return res.status(403).json({
      error: 'خطأ في التحقق من الأمان',
      message: 'يرجى إعادة تحميل الصفحة والمحاولة مرة أخرى',
      code: 'CSRF_TOKEN_INVALID',
      timestamp: new Date().toISOString()
    });
  }
  next(err);
};
```

## 3. Frontend CSRF Integration

### CSRF Token Manager
```typescript
// client/src/lib/csrf.ts
class CsrfTokenManager {
  private token: string | null = null;
  private tokenExpiry: number | null = null;
  private readonly TOKEN_VALIDITY_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  async getToken(): Promise<string> {
    // Check if we have a valid cached token
    if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    try {
      const response = await fetch('/api/csrf-token', {
        method: 'GET',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get CSRF token: ${response.status}`);
      }

      const data: CsrfResponse = await response.json();
      this.token = data.csrfToken;
      this.tokenExpiry = Date.now() + this.TOKEN_VALIDITY_DURATION;

      return this.token;
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
      throw new Error('فشل في الحصول على رمز الأمان');
    }
  }

  async getHeaders(): Promise<Record<string, string>> {
    const token = await this.getToken();
    return {
      'Content-Type': 'application/json',
      'X-CSRF-Token': token,
    };
  }
}
```

### Enhanced API Request Utility
```typescript
// client/src/lib/apiRequest.ts
export const apiRequest = async <T = any>(
  url: string, 
  options: ApiRequestOptions = {}
): Promise<T> => {
  try {
    const {
      method = 'GET',
      body,
      headers = {},
      useCsrf = true // Default to using CSRF protection
    } = options;

    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (body) {
      requestOptions.body = body;
    }

    // Use CSRF-protected fetch if enabled
    const response = useCsrf 
      ? await fetchWithCsrf(url, requestOptions)
      : await fetch(url, requestOptions);

    if (!response.ok) {
      // Handle CSRF token errors specifically
      if (response.status === 403) {
        try {
          const errorData = await response.json();
          if (errorData.code === 'CSRF_TOKEN_INVALID') {
            handleCsrfError(errorData);
            throw new Error('خطأ في التحقق من الأمان، يرجى إعادة تحميل الصفحة');
          }
        } catch (parseError) {
          // If we can't parse the error, continue with generic error
        }
      }
      
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    // Handle different response types
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text() as T;
    }
  } catch (error) {
    console.error(`API Request failed for ${url}:`, error);
    throw error;
  }
};
```

## 4. Additional Security Measures

### Rate Limiting
```typescript
// Enhanced rate limiting with better configuration
export const createRateLimit = (windowMs: number = 15 * 60 * 1000, max: number = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'تم تجاوز الحد المسموح من الطلبات',
      retryAfter: windowMs / 1000
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: process.env.NODE_ENV === 'development' ? () => false : undefined,
    validate: {
      trustProxy: false,
    },
    handler: (req, res) => {
      res.status(429).json({
        error: 'تم تجاوز الحد المسموح من الطلبات',
        message: 'يرجى المحاولة مرة أخرى لاحقاً',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};
```

### Input Validation
```typescript
// Enhanced input validation middleware
export const validateInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeObject = (obj: unknown): unknown => {
    if (typeof obj === 'string') {
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/data:text\/html/gi, '')
        .replace(/vbscript:/gi, '')
        .replace(/expression\s*\(/gi, '');
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    if (obj && typeof obj === 'object') {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body) as any;
  }
  if (req.query) {
    req.query = sanitizeObject(req.query) as any;
  }
  if (req.params) {
    req.params = sanitizeObject(req.params) as any;
  }

  next();
};
```

### Session Security
```typescript
// Session middleware for authentication
app.use(session({
  secret: process.env.SESSION_SECRET || 'development-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Set to true in production with HTTPS
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
```

## 5. Security Headers

### Additional Security Headers
```typescript
// Security headers middleware - complementary to helmet
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Additional security headers that complement helmet
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=()');
  
  // Additional headers for better security
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  
  next();
};
```

## 6. Usage Examples

### Making API Requests with CSRF Protection
```typescript
// Example: Creating an employee
const createEmployee = async (employeeData: EmployeeData) => {
  try {
    const response = await apiPost('/api/employees', employeeData);
    return response;
  } catch (error) {
    console.error('Failed to create employee:', error);
    throw error;
  }
};

// Example: Getting data without CSRF (for GET requests)
const getEmployees = async () => {
  try {
    const response = await apiRequest('/api/employees', { 
      method: 'GET',
      useCsrf: false // GET requests don't need CSRF
    });
    return response;
  } catch (error) {
    console.error('Failed to get employees:', error);
    throw error;
  }
};
```

### Handling CSRF Errors
```typescript
// Example: Handling CSRF errors in components
const handleSubmit = async (formData: FormData) => {
  try {
    await apiPost('/api/submit', formData);
    // Success handling
  } catch (error) {
    if (error.message.includes('خطأ في التحقق من الأمان')) {
      // Handle CSRF error - maybe refresh the page or show a message
      window.location.reload();
    } else {
      // Handle other errors
      console.error('Submit failed:', error);
    }
  }
};
```

## 7. Testing Security

### Testing CSRF Protection
```typescript
// Example test for CSRF protection
describe('CSRF Protection', () => {
  it('should reject requests without CSRF token', async () => {
    const response = await fetch('/api/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: 'Test Employee' })
    });
    
    expect(response.status).toBe(403);
  });

  it('should accept requests with valid CSRF token', async () => {
    // First get a CSRF token
    const tokenResponse = await fetch('/api/csrf-token');
    const { csrfToken } = await tokenResponse.json();
    
    // Then make a request with the token
    const response = await fetch('/api/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify({ name: 'Test Employee' })
    });
    
    expect(response.status).not.toBe(403);
  });
});
```

## 8. Environment Configuration

### Production Environment
```bash
# .env.production
NODE_ENV=production
SESSION_SECRET=your-very-secure-session-secret
HTTPS_ENABLED=true
```

### Development Environment
```bash
# .env.development
NODE_ENV=development
SESSION_SECRET=development-secret-key
HTTPS_ENABLED=false
```

## 9. Security Checklist

- [x] Helmet middleware configured
- [x] CSRF protection implemented
- [x] Cookie parser middleware
- [x] Rate limiting configured
- [x] Input validation and sanitization
- [x] Session security configured
- [x] Security headers set
- [x] Frontend CSRF integration
- [x] Error handling for security issues
- [x] Logging for security events

## 10. Monitoring and Logging

### Security Event Logging
```typescript
// Log security events
log.security('CSRF token validation failed', req.ip, {
  url: req.url,
  method: req.method,
  userAgent: req.get('User-Agent')
});
```

### Health Check Endpoint
```typescript
// Enhanced health check endpoint
export const healthCheck = (req: Request, res: Response) => {
  const healthData = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    security: {
      helmet: true,
      rateLimit: true,
      csrf: true,
      inputValidation: true
    }
  };
  
  res.json(healthData);
};
```

This comprehensive security implementation provides robust protection against common web vulnerabilities while maintaining good user experience and developer productivity. 