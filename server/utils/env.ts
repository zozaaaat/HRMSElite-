import { z } from 'zod';
import { log } from './logger';

/**
 * Environment variable validation schema
 * Ensures all required secrets are present and meet security requirements
 */
const envSchema = z.object({
  // Required secrets with minimum length validation
  ACCESS_JWT_SECRET: z.string().min(32, 'ACCESS_JWT_SECRET must be at least 32 characters long'),
  REFRESH_JWT_SECRET: z.string().min(32, 'REFRESH_JWT_SECRET must be at least 32 characters long'),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters long'),
  DB_ENCRYPTION_KEY: z.string().min(32, 'DB_ENCRYPTION_KEY must be at least 32 characters long'),
  FILE_SIGNATURE_SECRET: z.string().min(32, 'FILE_SIGNATURE_SECRET must be at least 32 characters long'),
  METRICS_TOKEN: z.string().min(32, 'METRICS_TOKEN must be at least 32 characters long').optional(),
  
  // Optional environment variables with defaults
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001'),

  // File upload configuration
  UPLOAD_MAX_BYTES: z.string().default('5242880'),
  
  // JWT configuration
  JWT_EXPIRES_IN: z.string().default('24h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  // Database configuration
  DATABASE_URL: z.string().optional(),
  DB_ENCRYPTION_KEY_PREVIOUS: z.string().min(32).optional(),
  REDIS_URL: z.string().optional(),
  
  // CORS configuration
  CORS_ORIGINS: z.string().optional(),
  API_KEYS: z.string().optional(),
  INTERNAL_CIDR_ALLOWLIST: z.string().optional(),
  
  // Rate limiting configuration
  RATE_LIMIT_WINDOW_MS: z.string().optional(),
  RATE_LIMIT_MAX_REQUESTS: z.string().optional(),
  
  // CSRF configuration
  CSRF_ENABLED: z.string().optional(),
  
  // Development authentication bypass (only for local development)
  ALLOW_DEV_AUTH: z.string().optional(),
});

/**
 * Validated environment variables
 */
export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Validate and load environment variables
 * @throws Error if required secrets are missing or invalid
 */
export function validateEnv(): EnvConfig {
  try {
    const env = envSchema.parse(process.env);
    
    log.info('Environment variables validated successfully', {
      nodeEnv: env.NODE_ENV,
      port: env.PORT,
      jwtExpiresIn: env.JWT_EXPIRES_IN,
      jwtRefreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
      databaseUrl: env.DATABASE_URL ? 'configured' : 'using default',
      corsOrigins: env.CORS_ORIGINS ? 'configured' : 'not set',
      apiKeys: env.API_KEYS ? 'configured' : 'not set',
      internalCidrs: env.INTERNAL_CIDR_ALLOWLIST ? 'configured' : 'not set',
      uploadMaxBytes: env.UPLOAD_MAX_BYTES,
    }, 'ENV');
    
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => err.path.join('.')).join(', ');
      const errorMessage = `Environment validation failed. Missing or invalid variables: ${missingVars}`;
      
      log.error(errorMessage, error, 'ENV');
      throw new Error(errorMessage);
    }
    
    log.error('Unexpected error during environment validation', error as Error, 'ENV');
    throw error;
  }
}

/**
 * Get validated environment configuration
 * This should be called once at application startup
 */
export const env = validateEnv();

/**
 * Security check for secrets
 * Ensures secrets are not using default/weak values
 */
export function validateSecrets(): void {
  const weakSecrets = [
    'hrms-elite-secret-key-change-in-production',
    'development-secret-key',
    'change-in-production',
    'default-secret',
    '__REPLACE_WITH_STRONG_SECRET__',
    'changeme',
    'your-secret',
    'secret-key',
    'password',
    'admin',
    '123456',
    'test',
    'dev',
  ];
  
  const secrets = [
    { name: 'ACCESS_JWT_SECRET', value: env.ACCESS_JWT_SECRET },
    { name: 'REFRESH_JWT_SECRET', value: env.REFRESH_JWT_SECRET },
    { name: 'SESSION_SECRET', value: env.SESSION_SECRET },
    { name: 'DB_ENCRYPTION_KEY', value: env.DB_ENCRYPTION_KEY },
    { name: 'FILE_SIGNATURE_SECRET', value: env.FILE_SIGNATURE_SECRET },
  ];

  secrets.forEach(({ name, value }) => {
    if (!value || value.length < 32) {
      throw new Error(`${name} is missing or too weak. It must be at least 32 characters long.`);
    }

    if (weakSecrets.some(weak => value.includes(weak) || value === weak)) {
      throw new Error(`${name} contains weak or default values. Please use a strong, unique secret.`);
    }

    const entropy = calculateEntropy(value);
    if (entropy < 3.5) {
      log.warn(`${name} has low entropy. Consider using a more random secret.`, {
        entropy,
        minRecommended: 3.5
      }, 'ENV');
    }
  });

  log.info('Secret validation completed successfully', {
    accessJwtSecretLength: env.ACCESS_JWT_SECRET.length,
    refreshJwtSecretLength: env.REFRESH_JWT_SECRET.length,
    sessionSecretLength: env.SESSION_SECRET.length,
    dbEncryptionKeyLength: env.DB_ENCRYPTION_KEY.length,
    fileSignatureSecretLength: env.FILE_SIGNATURE_SECRET.length
  }, 'ENV');
}

/**
 * Calculate entropy of a string (measure of randomness)
 * @param str - String to calculate entropy for
 * @returns Entropy value (higher = more random)
 */
function calculateEntropy(str: string): number {
  const charCount: Record<string, number> = {};
  
  for (const char of str) {
    charCount[char] = (charCount[char] || 0) + 1;
  }
  
  const length = str.length;
  let entropy = 0;
  
  for (const count of Object.values(charCount)) {
    const probability = count / length;
    entropy -= probability * Math.log2(probability);
  }
  
  return entropy;
}

/**
 * Validate environment on module load
 */
validateSecrets();
