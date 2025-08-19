# Environment Setup Guide

## Required Environment Variables

The HRMS Elite application requires the following environment variables to be set securely. Create a `.env` file in the root directory with the following variables:

### Critical Security Variables (Required)

```bash
# JWT Secret - Must be at least 32 characters long
JWT_SECRET=your-super-secure-jwt-secret-at-least-32-characters-long-here

# Session Secret - Must be at least 32 characters long  
SESSION_SECRET=your-super-secure-session-secret-at-least-32-characters-long-here
```

### Application Configuration

```bash
# Environment
NODE_ENV=development
PORT=3001

# JWT Configuration
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Database Configuration
DATABASE_URL=dev.db

# CORS Configuration (comma-separated origins)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Rate Limiting Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CSRF Configuration
CSRF_ENABLED=true
```

## Generating Secure Secrets

### Option 1: Using Node.js (Recommended)
```bash
# Generate JWT Secret
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('base64url'))"

# Generate Session Secret  
node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(64).toString('base64url'))"
```

### Option 2: Using OpenSSL
```bash
# Generate JWT Secret
openssl rand -base64 64

# Generate Session Secret
openssl rand -base64 64
```

### Option 3: Using Online Generators
- Use a secure random string generator
- Ensure the generated string is at least 32 characters long
- Use a mix of uppercase, lowercase, numbers, and special characters

## Security Requirements

1. **Minimum Length**: All secrets must be at least 32 characters long
2. **Uniqueness**: Each secret should be unique and not reused across environments
3. **Randomness**: Use cryptographically secure random generators
4. **No Defaults**: Never use default or example values in production
5. **Environment Separation**: Use different secrets for development, staging, and production

## Validation

The application will validate environment variables on startup and will fail to start if:

- Required secrets are missing
- Secrets are shorter than 32 characters
- Secrets contain weak/default values
- Secrets have low entropy (randomness)

## Production Deployment

For production deployment:

1. **Use Environment Variables**: Set secrets as environment variables, not in files
2. **Secret Management**: Use a secrets management service (AWS Secrets Manager, Azure Key Vault, etc.)
3. **Rotation**: Implement regular secret rotation
4. **Access Control**: Limit access to production secrets
5. **Monitoring**: Monitor for secret exposure or compromise

## Example .env File

```bash
# Copy this template and replace with your actual values
JWT_SECRET=your-actual-jwt-secret-here-minimum-32-characters
SESSION_SECRET=your-actual-session-secret-here-minimum-32-characters
NODE_ENV=development
PORT=3001
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
DATABASE_URL=dev.db
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CSRF_ENABLED=true
```

## Troubleshooting

### Common Errors

1. **"JWT_SECRET must be at least 32 characters long"**
   - Generate a longer secret using the methods above

2. **"SESSION_SECRET contains weak or default values"**
   - Replace with a truly random secret

3. **"Environment validation failed"**
   - Check that all required variables are set
   - Ensure no typos in variable names

### Validation Warnings

The application may warn about:
- Low entropy secrets (consider regenerating)
- Missing optional variables (will use defaults)
- Development vs production configuration mismatches
