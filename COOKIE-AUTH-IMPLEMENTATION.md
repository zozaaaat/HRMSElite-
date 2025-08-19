# Cookie-Based Authentication Implementation

## Overview

This document describes the complete refactor of the HRMS Elite authentication system from localStorage-based tokens to secure cookie-based sessions. The implementation follows security best practices and provides a robust authentication mechanism.

## Security Features

### 1. HttpOnly Cookies
- **Access Token**: `__Host-hrms-elite-access` (15 minutes)
- **Refresh Token**: `__Host-hrms-elite-refresh` (7 days)
- **Session Cookie**: `__Host-hrms-elite-session` (24 hours)

### 2. Secure Cookie Configuration
```typescript
const COOKIE_CONFIG = {
  httpOnly: true,        // Prevents XSS attacks
  secure: true,          // HTTPS only
  sameSite: 'lax',       // CSRF protection
  path: '/',             // Available across the site
  domain: undefined      // Let browser set domain for __Host- prefix
};
```

### 3. CORS Security
- Credentials enabled for all requests
- Origin allowlisting (no wildcard origins)
- Secure origin validation

## Server-Side Implementation

### 1. Authentication Middleware (`server/middleware/auth.ts`)

#### Cookie Management Functions
```typescript
// Set authentication cookies
export const setAuthCookies = (res: Response, accessToken: string, refreshToken: string): void => {
  res.cookie('__Host-hrms-elite-access', accessToken, {
    ...COOKIE_CONFIG,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie('__Host-hrms-elite-refresh', refreshToken, {
    ...COOKIE_CONFIG,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// Clear authentication cookies
export const clearAuthCookies = (res: Response): void => {
  res.clearCookie('__Host-hrms-elite-access', COOKIE_CONFIG);
  res.clearCookie('__Host-hrms-elite-refresh', COOKIE_CONFIG);
};

// Get token from cookies or Authorization header
export const getTokenFromRequest = (req: Request): string | null => {
  const accessToken = req.cookies['__Host-hrms-elite-access'];
  if (accessToken) {
    return accessToken;
  }

  // Fallback to Authorization header for backward compatibility
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
};
```

#### Updated Authentication Middleware
```typescript
export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for session-based authentication first (for backward compatibility)
    if (req.session?.user) {
      // ... session handling
      return next();
    }

    // Check for cookie-based authentication
    const token = getTokenFromRequest(req);
    if (token) {
      const decoded = verifyJWTToken(token);
      if (decoded) {
        // ... user validation and setup
        return next();
      }
    }

    // No authentication found
    return res.status(401).json({
      'message': 'Authentication required',
      'error': 'يجب تسجيل الدخول للوصول إلى هذا المورد',
      'code': 'AUTHENTICATION_REQUIRED'
    });
  } catch (error) {
    // ... error handling
  }
};
```

### 2. Auth Routes (`server/routes/auth-routes.ts`)

#### Login Endpoint
```typescript
router.post('/login', async (req: Request, res: Response) => {
  try {
    // ... validation and user lookup

    const accessToken = generateJWTToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Set authentication cookies
    setAuthCookies(res, accessToken, refreshToken);

    // Store user session (for backward compatibility)
    (req.session as any).user = sessionUser;

    res.json({
      'success': true,
      'user': {
        // ... user data (no tokens in response)
      }
    });
  } catch (error) {
    // ... error handling
  }
});
```

#### Refresh Token Endpoint
```typescript
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const refreshToken = getRefreshTokenFromRequest(req);
    
    if (!refreshToken) {
      return res.status(401).json({
        'message': 'Refresh token not found',
        'code': 'REFRESH_TOKEN_MISSING'
      });
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({
        'message': 'Invalid or expired refresh token',
        'code': 'INVALID_REFRESH_TOKEN'
      });
    }

    // Generate new tokens
    const newAccessToken = generateJWTToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    // Set new authentication cookies
    setAuthCookies(res, newAccessToken, newRefreshToken);

    res.json({
      'success': true,
      'message': 'Tokens refreshed successfully'
    });
  } catch (error) {
    // ... error handling
  }
});
```

#### Logout Endpoint
```typescript
router.post('/logout', (req: Request, res: Response) => {
  // Clear authentication cookies
  clearAuthCookies(res);

  // Clear session (for backward compatibility)
  req.session?.destroy(() => {
    res.json({'success': true, 'message': 'تم تسجيل الخروج بنجاح'});
  });
});
```

### 3. Server Configuration (`server/index.ts`)

#### Cookie Parser Middleware
```typescript
import cookieParser from 'cookie-parser';

// Cookie parsing middleware
app.use(cookieParser());
```

#### Session Configuration
```typescript
app.use(session({
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'lax' as const,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/',
    domain: undefined
  },
  name: '__Host-hrms-elite-session'
}));
```

## Client-Side Implementation

### 1. Updated User Store (`client/src/stores/useUserStore.ts`)

#### Removed localStorage Persistence
```typescript
// Before: Used persist middleware with localStorage
export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // ... store implementation
    }),
    {
      name: 'user-store', // localStorage key
      // ... persistence config
    }
  )
);

// After: No persistence, relies on cookies
export const useUserStore = create<UserStore>()(
  (set, get) => ({
    // ... store implementation
  })
);
```

#### Updated State Management
```typescript
interface CurrentUserState {
  id: string | null;
  role: UserRole | null;
  companyId: string | null;
  token: string | null;        // No longer used for authentication
  isAuthenticated: boolean;
  user: AppUser | null;
  permissions: string[];
  loading: boolean;
  error: string | null;
  currentCompany: any | null;
}
```

### 2. API Request Configuration (`client/src/lib/apiRequest.ts`)

#### Credentials Inclusion
```typescript
const requestOptions: RequestInitLike = {
  method,
  headers: computedHeaders,
  credentials: 'include' // Always include cookies for authentication
};
```

### 3. CSRF Protection (`client/src/lib/csrf.ts`)

#### Enhanced Fetch Function
```typescript
export async function fetchWithCsrf(
  url: string,
  options: Parameters<typeof fetch>[1] = {}
): Promise<Response> {
  const csrfHeaders = await csrfManager.getHeaders();

  const enhancedOptions: Parameters<typeof fetch>[1] = {
    ...options,
    'credentials': 'include', // Always include cookies
    'headers': {
      ...csrfHeaders,
      ...((options as Record<string, unknown>)?.headers as Record<string, string> | undefined)
    }
  };

  return fetch(url, enhancedOptions);
}
```

### 4. Service Worker (`public/sw.js`)

#### Auth Endpoint Exclusion
```typescript
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip caching for auth endpoints
  if (url.pathname.startsWith('/api/auth/') || url.pathname.startsWith('/auth/')) {
    // For auth endpoints, always fetch from network and don't cache
    event.respondWith(fetch(request));
    return;
  }

  // For other requests, use cache-first strategy
  event.respondWith(
    caches.match(request)
      .then((response) => {
        return response || fetch(request);
      })
  );
});
```

### 5. Auth Service (`client/src/services/core/AuthService.ts`)

#### Added Refresh Token Method
```typescript
/**
 * Refresh authentication tokens
 */
async refreshTokens(): Promise<{ success: boolean; message?: string }> {
  try {
    return await this.post<{ success: boolean; message?: string }>('/refresh');
  } catch (error) {
    this.handleError(error);
  }
}
```

### 6. Auth Hooks (`client/src/hooks/auth/`)

#### Updated Core Hook
```typescript
// Removed token handling from login
const login = useCallback(async (credentials) => {
  try {
    const response = await AuthService.login(credentials);

    if (response.success && response.user) {
      const unifiedUser = AuthUtils.createUnifiedUser(response.user);
      const appUser = convertUserToAppUser(unifiedUser);
      setUser(appUser);

      // No token storage - cookies handle authentication
      return { 'success': true, 'user': unifiedUser };
    }
  } catch (error) {
    // ... error handling
  }
}, [setUser, setLoading, setError]);
```

## CORS Configuration

### 1. Secure Origin Validation (`server/middleware/security.ts`)

#### Origin Allowlisting
```typescript
function parseCorsOrigins(): string[] {
  const corsOrigins = process.env.CORS_ORIGINS || process.env.ALLOWED_ORIGINS;
  
  if (!corsOrigins) {
    log.warn('CORS_ORIGINS not set, using default localhost origin', {}, 'SECURITY');
    return ['http://localhost:3000'];
  }

  const origins = corsOrigins.split(',').map(origin => origin.trim()).filter(origin => origin.length > 0);
  
  // Validate origins format
  const validOrigins = origins.filter(origin => {
    try {
      const url = new URL(origin);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      log.warn('Invalid CORS origin format', { origin }, 'SECURITY');
      return false;
    }
  });

  return validOrigins;
}

function validateCorsOrigin(origin: string, callback: (error: Error | null, allow?: boolean) => void): void {
  const allowedOrigins = parseCorsOrigins();
  
  // Allow requests with no origin (like mobile apps or Postman)
  if (!origin) {
    return callback(null, true);
  }

  // Check if origin is in allowlist
  if (allowedOrigins.includes(origin)) {
    return callback(null, true);
  }

  // Log unauthorized origin attempts
  log.warn('CORS origin rejected', {
    origin,
    allowedOrigins,
    timestamp: new Date().toISOString()
  }, 'SECURITY');

  return callback(new Error('CORS origin not allowed'), false);
}
```

#### CORS Configuration
```typescript
export const corsConfig = {
  origin: validateCorsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With'],
  exposedHeaders: ['X-CSRF-Token'],
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200
};
```

## Testing

### 1. Comprehensive Test Suite (`tests/cookie-auth.test.ts`)

The test suite covers:
- Server-side cookie configuration
- Client-side store updates
- API request configuration
- Service worker configuration
- CORS configuration
- Error handling

### 2. Test Scenarios
- Secure httpOnly cookies on login
- Refresh token requests
- Cookie clearing on logout
- No localStorage usage
- Credentials inclusion in all requests
- Auth endpoint exclusion from caching

## Environment Variables

### Required Configuration
```bash
# JWT Configuration
JWT_SECRET=your-secure-jwt-secret-at-least-32-characters
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Session Configuration
SESSION_SECRET=your-secure-session-secret-at-least-32-characters

# CORS Configuration
CORS_ORIGINS=https://app.example.com,https://admin.example.com

# Database Configuration
DATABASE_URL=your-database-connection-string
```

## Security Benefits

### 1. XSS Protection
- HttpOnly cookies prevent JavaScript access
- No tokens stored in localStorage
- Secure cookie flags prevent tampering

### 2. CSRF Protection
- SameSite=Lax prevents cross-site requests
- CSRF tokens for state-changing operations
- Origin validation in CORS

### 3. Token Security
- Short-lived access tokens (15 minutes)
- Refresh token rotation
- Secure token storage in httpOnly cookies

### 4. Session Security
- Secure session configuration
- Automatic session timeout
- Session invalidation on logout

## Migration Guide

### 1. For Existing Users
- Existing sessions will continue to work (backward compatibility)
- New logins will use cookie-based authentication
- Gradual migration without breaking changes

### 2. For Developers
- Remove any localStorage token handling
- Update API calls to include credentials
- Use the new refresh token endpoint
- Update error handling for 401 responses

### 3. For Administrators
- Update environment variables
- Configure CORS origins
- Monitor authentication logs
- Update security policies

## Monitoring and Logging

### 1. Authentication Events
```typescript
// Successful authentication
log.info('User authenticated successfully', {
  userId: user.id,
  role: user.role,
  method: 'cookie',
  timestamp: new Date().toISOString()
}, 'AUTH');

// Failed authentication
log.warn('Authentication failed', {
  ip: req.ip,
  userAgent: req.get('User-Agent'),
  reason: 'invalid_token',
  timestamp: new Date().toISOString()
}, 'AUTH');
```

### 2. Security Monitoring
- CORS origin rejections
- Invalid token attempts
- Session hijacking attempts
- Unauthorized access patterns

## Compliance

### 1. OWASP ASVS Controls
- **3.1.1**: Origin header validation
- **3.1.2**: Referer header validation
- **3.4.1**: Secure cookie flags
- **3.4.2**: HttpOnly cookie usage

### 2. Security Standards
- **NIST SP 800-53**: AC-3, AC-4, SC-8
- **ISO 27001**: A.9.1.1, A.9.1.2, A.12.2.1
- **PCI DSS**: Requirement 6.5, 7.1

## Conclusion

The cookie-based authentication implementation provides:
- ✅ Enhanced security through httpOnly cookies
- ✅ XSS and CSRF protection
- ✅ Secure token management
- ✅ Backward compatibility
- ✅ Comprehensive testing
- ✅ Security monitoring
- ✅ Compliance with industry standards

This implementation follows security best practices and provides a robust foundation for the HRMS Elite authentication system.
