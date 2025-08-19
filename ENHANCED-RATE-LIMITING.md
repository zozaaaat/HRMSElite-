# Enhanced Rate Limiting Implementation

## Overview

The HRMS Elite application now features enhanced rate limiting that implements both **per-IP** and **per-user** limits simultaneously. This provides better protection against abuse while allowing legitimate users to have higher limits.

## Key Features

### 🔒 Dual Rate Limiting Strategy
- **Per-IP Limits**: Protect against abuse from specific IP addresses
- **Per-User Limits**: Allow authenticated users higher limits than anonymous users
- **Independent Tracking**: Both limits are tracked separately and independently

### 📊 Rate Limit Configuration

| Endpoint Type | IP Limit | User Limit | Window | Purpose |
|---------------|----------|------------|--------|---------|
| **General API** | 100 requests | 200 requests | 15 minutes | General API protection |
| **Login** | 5 attempts | 10 attempts | 15 minutes | Prevent brute force attacks |
| **Document Upload** | 10 uploads | 20 uploads | 5 minutes | Prevent file upload abuse |
| **Search** | 30 searches | 60 searches | 1 minute | Prevent search spam |

## Implementation Details

### 1. Enhanced Rate Limiter Factory

```typescript
export const createEnhancedRateLimiter = (type: keyof typeof SECURITY_CONFIG.rateLimit) => {
  const config = SECURITY_CONFIG.rateLimit[type];
  
  // Create IP-based rate limiter
  const ipLimiter = rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    keyGenerator: (req: Request) => {
      return `ip:${req.ip || req.connection.remoteAddress || 'unknown'}`;
    },
    // ... other configuration
  });

  // Create user-based rate limiter (only for authenticated users)
  const userLimiter = rateLimit({
    windowMs: config.windowMs,
    max: config.userMax,
    keyGenerator: (req: Request) => {
      return req.user?.id ? `user:${req.user.id}` : 'anonymous';
    },
    skip: (req: Request) => {
      // Skip user-based rate limiting for unauthenticated requests
      return !req.user?.id;
    },
    // ... other configuration
  });

  // Return middleware that applies both limiters
  return (req: Request, res: Response, next: NextFunction) => {
    // Apply IP-based rate limiting first
    ipLimiter(req, res, (err) => {
      if (err) return next(err);
      
      // Then apply user-based rate limiting
      userLimiter(req, res, next);
    });
  };
};
```

### 2. Configuration Structure

```typescript
const SECURITY_CONFIG = {
  rateLimit: {
    general: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // IP limit
      userMax: 200, // User limit
      message: {
        error: 'تم تجاوز حد الطلبات',
        message: 'يرجى المحاولة مرة أخرى بعد فترة',
        retryAfter: '15 دقيقة'
      }
    },
    // ... other configurations
  }
};
```

### 3. Environment Variables

```bash
# Rate limiting configuration
RATE_LIMIT_WINDOW_MS=900000          # 15 minutes in milliseconds
RATE_LIMIT_MAX_REQUESTS=100          # IP-based limit
RATE_LIMIT_USER_MAX_REQUESTS=200     # User-based limit
```

## Usage in Server

### Server Configuration

```typescript
// Enhanced rate limiting with per-IP and per-user limits
app.use('/api/', enhancedRateLimiters.general);
app.use('/api/auth/login', enhancedRateLimiters.login);
app.use('/api/documents', enhancedRateLimiters.document);
app.use('/api/search', enhancedRateLimiters.search);
```

### Response Headers

The enhanced rate limiters include standard rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Error Responses

### IP Rate Limit Exceeded

```json
{
  "error": "تم تجاوز حد الطلبات",
  "message": "يرجى المحاولة مرة أخرى بعد فترة",
  "retryAfter": "15 دقيقة",
  "code": "RATE_LIMIT_IP_GENERAL",
  "limitType": "IP",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### User Rate Limit Exceeded

```json
{
  "error": "تم تجاوز حد الطلبات",
  "message": "يرجى المحاولة مرة أخرى بعد فترة",
  "retryAfter": "15 دقيقة",
  "code": "RATE_LIMIT_USER_GENERAL",
  "limitType": "USER",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Security Benefits

### 🛡️ Enhanced Protection

1. **IP-based Protection**: Prevents abuse from specific IP addresses
2. **User-based Protection**: Prevents individual users from abusing the system
3. **Independent Limits**: Users can't bypass IP limits by authenticating
4. **Graceful Degradation**: Unauthenticated users still have reasonable limits

### 📈 Scalability

1. **Higher Limits for Authenticated Users**: Legitimate users get better experience
2. **Flexible Configuration**: Easy to adjust limits per endpoint type
3. **Environment-based**: Different limits for development/production

### 🔍 Monitoring and Logging

```typescript
log.warn(`IP rate limit exceeded for ${type}`, {
  ip: req.ip,
  url: req.url,
  method: req.method,
  userAgent: req.get('User-Agent'),
  userId: req.user?.id,
  timestamp: new Date().toISOString()
}, 'SECURITY');
```

## Migration from Legacy Rate Limiting

### Before (Legacy)
```typescript
// Single rate limiter with mixed IP/user logic
export const rateLimiters = {
  general: createRateLimiter('general'),
  // ...
};
```

### After (Enhanced)
```typescript
// Enhanced rate limiters with separate IP and user tracking
export const enhancedRateLimiters = {
  general: createEnhancedRateLimiter('general'),
  // ...
};
```

## Testing

### Test Scenarios

1. **Anonymous User**: Should be limited by IP only
2. **Authenticated User**: Should be limited by both IP and user limits
3. **Rate Limit Exceeded**: Should return appropriate error with limit type
4. **Different Endpoints**: Should have different limits per endpoint type

### Example Test

```typescript
// Test IP-based rate limiting
test('should limit requests by IP', async () => {
  const requests = Array(101).fill(null).map(() => 
    request(app).get('/api/test')
  );
  
  const responses = await Promise.all(requests);
  const rateLimited = responses.filter(r => r.status === 429);
  
  expect(rateLimited.length).toBeGreaterThan(0);
  expect(rateLimited[0].body.limitType).toBe('IP');
});
```

## Configuration Examples

### Development Environment
```typescript
// More lenient limits for development
general: {
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 1000, // Higher IP limit
  userMax: 2000, // Higher user limit
}
```

### Production Environment
```typescript
// Stricter limits for production
general: {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Standard IP limit
  userMax: 200, // Standard user limit
}
```

## Best Practices

### 1. Monitor Rate Limit Violations
- Log all rate limit violations with context
- Track patterns of abuse
- Adjust limits based on legitimate usage patterns

### 2. User Communication
- Provide clear error messages in Arabic
- Include retry-after information
- Explain the difference between IP and user limits

### 3. Configuration Management
- Use environment variables for flexibility
- Document all rate limit configurations
- Test limits in staging environment

### 4. Performance Considerations
- Rate limiting adds minimal overhead
- Redis can be used for distributed rate limiting
- Monitor memory usage of rate limit storage

## Future Enhancements

### Potential Improvements

1. **Dynamic Rate Limiting**: Adjust limits based on user behavior
2. **Whitelist Support**: Exempt certain users/IPs from rate limiting
3. **Rate Limit Analytics**: Dashboard for monitoring rate limit usage
4. **Distributed Rate Limiting**: Redis-based rate limiting for multiple servers
5. **Custom Rate Limit Rules**: Per-user custom rate limit configurations

### Integration Points

1. **User Management**: Integrate with user roles and permissions
2. **Analytics**: Track rate limit usage patterns
3. **Alerting**: Notify administrators of rate limit abuse
4. **API Documentation**: Include rate limits in API documentation

---

## Summary

The enhanced rate limiting implementation provides:

- ✅ **Dual Protection**: Both IP and user-based limits
- ✅ **Better UX**: Higher limits for authenticated users
- ✅ **Flexible Configuration**: Easy to adjust per endpoint
- ✅ **Comprehensive Logging**: Detailed monitoring and alerting
- ✅ **Arabic Support**: User-friendly error messages
- ✅ **Backward Compatibility**: Legacy rate limiters still available

This implementation significantly improves the security posture of the HRMS Elite application while maintaining a good user experience for legitimate users.
