import { Router, Request, Response } from 'express';
import { storage } from '../../models/storage';
import { log } from '../../utils/logger';
import {
  isAuthenticated,
  optionalAuth,
  generateJWTToken,
  generateRefreshToken,
  verifyRefreshToken,
  setAuthCookies,
  clearAuthCookies,
  getRefreshTokenFromRequest,
  hashToken
} from '../../middleware/auth';
import {
  hashPassword,
  verifyPassword,
  generateSecureToken,
  validatePasswordStrength,
  isPasswordDifferent
} from '../../utils/password';
import {
  sendVerificationEmail,
  sendPasswordResetEmail
} from '../../utils/email';
import {
  registerUserSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  type InsertUser
} from '@shared/schema';
import {
  createErrorResponse,
  createSuccessResponse
} from '../../middleware/api-versioning';
import { generateETag, setETagHeader } from '../../utils/etag';
import { metricsUtils } from '../../middleware/metrics';
import crypto from 'node:crypto';

// Define session interface
interface SessionUser {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  role: string;
  companyId?: string | null;
  permissions: string[];
  isActive: boolean;
  sub: string;
  claims: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
  companies: Array<{
    id: string;
    name: string;
    logoUrl?: string | null;
  }>;
  currentCompanyId?: string;
}

interface SessionData {
  user?: SessionUser;
}

const router = Router();

/**
 * Unified User Endpoint - Primary endpoint for all user operations
 * GET /api/v1/auth/user
 * Returns current user with company context
 */
router.get('/user', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const companyId = req.query.companyId as string;

    // Get user data
    const user = await storage.getUser(userId);
    if (!user) {
      const errorResponse = createErrorResponse(
        'NOT_FOUND',
        'User not found',
        { resource: 'user', id: userId },
        404
      );
      return res.status(errorResponse.statusCode).json(errorResponse.body);
    }

    // Get user's companies and roles
    const userCompanies = await storage.getUserCompanies(userId);

    // If companyId is specified, filter to that company
    let currentCompany = null;
    if (companyId) {
      currentCompany = userCompanies.find(company => company.id === companyId);
      if (!currentCompany) {
        const errorResponse = createErrorResponse(
          'AUTHORIZATION_ERROR',
          'No access to specified company',
          { 
            requiredCompany: companyId,
            userCompanies: userCompanies.map(c => c.id)
          },
          403
        );
        return res.status(errorResponse.statusCode).json(errorResponse.body);
      }
    }

    // Get user permissions for current company
    const permissions = await storage.getUserPermissions(userId, currentCompany?.id);

    const userData: SessionUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      role: user.role,
      companyId: currentCompany?.id || user.companyId,
      permissions,
      isActive: user.isActive,
      sub: user.id,
      claims: null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      companies: userCompanies,
      currentCompanyId: currentCompany?.id
    };

    const etag = generateETag(userData as any);
    setETagHeader(res, etag);
    const response = createSuccessResponse(userData, 'User data retrieved successfully');
    res.json(response);

  } catch (error) {
    log.error('Error fetching user data:', error as Error);
    const errorResponse = createErrorResponse(
      'INTERNAL_ERROR',
      'Failed to fetch user data',
      { message: 'An error occurred while retrieving user data' },
      500
    );
    res.status(errorResponse.statusCode).json(errorResponse.body);
  }
});

/**
 * Login endpoint
 * POST /api/v1/auth/login
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password, rememberMe } = req.body;

    // Validate input
    const validationResult = loginSchema.safeParse({ email, password });
    if (!validationResult.success) {
      const errorResponse = createErrorResponse(
        'VALIDATION_ERROR',
        'Invalid login data',
        {
          details: validationResult.error.issues,
          message: 'Login data validation failed'
        },
        400
      );
      return res.status(errorResponse.statusCode).json(errorResponse.body);
    }

    // Get user by email
    const user = await storage.getUserByEmail(email);
    if (!user) {
      const errorResponse = createErrorResponse(
        'AUTHENTICATION_ERROR',
        'Invalid credentials',
        { reason: 'invalid_credentials' },
        401
      );
      metricsUtils.incrementLoginFailure('invalid_credentials');
      return res.status(errorResponse.statusCode).json(errorResponse.body);
    }

    // Check if user is active
    if (!user.isActive) {
      const errorResponse = createErrorResponse(
        'AUTHENTICATION_ERROR',
        'Account is deactivated',
        { reason: 'account_deactivated' },
        401
      );
      metricsUtils.incrementLoginFailure('account_deactivated');
      return res.status(errorResponse.statusCode).json(errorResponse.body);
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      const errorResponse = createErrorResponse(
        'AUTHENTICATION_ERROR',
        'Invalid credentials',
        { reason: 'invalid_credentials' },
        401
      );
      metricsUtils.incrementLoginFailure('invalid_credentials');
      return res.status(errorResponse.statusCode).json(errorResponse.body);
    }

    // Generate tokens
    const token = generateJWTToken(user);
    const refreshToken = generateRefreshToken(user);

    // Set cookies
    setAuthCookies(res, token, refreshToken, rememberMe);

    // Get user companies
    const userCompanies = await storage.getUserCompanies(user.id);
    const permissions = await storage.getUserPermissions(user.id, user.companyId);

    const userData: SessionUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      role: user.role,
      companyId: user.companyId,
      permissions,
      isActive: user.isActive,
      sub: user.id,
      claims: null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      companies: userCompanies,
      currentCompanyId: user.companyId
    };

    const loginResponse = {
      user: userData
    };

    const response = createSuccessResponse(loginResponse, 'Login successful');
    metricsUtils.incrementAuthSuccess(req.method, user.role);
    res.json(response);

  } catch (error) {
    log.error('Login error:', error as Error);
    const errorResponse = createErrorResponse(
      'INTERNAL_ERROR',
      'Login failed',
      { message: 'An error occurred during login' },
      500
    );
    res.status(errorResponse.statusCode).json(errorResponse.body);
  }
});

/**
 * Register endpoint
 * POST /api/v1/auth/register
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, confirmPassword, firstName, lastName, companyName, role } = req.body;

    // Validate input
    const validationResult = registerUserSchema.safeParse({
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      companyName,
      role
    });

    if (!validationResult.success) {
      const errorResponse = createErrorResponse(
        'VALIDATION_ERROR',
        'Invalid registration data',
        {
          details: validationResult.error.issues,
          message: 'Registration data validation failed'
        },
        400
      );
      return res.status(errorResponse.statusCode).json(errorResponse.body);
    }

    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      const errorResponse = createErrorResponse(
        'CONFLICT',
        'User already exists',
        {
          resource: 'user',
          field: 'email',
          value: email
        },
        409
      );
      return res.status(errorResponse.statusCode).json(errorResponse.body);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user data
    const userData: InsertUser = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: role || 'user',
      isActive: true,
      emailVerified: false,
      verificationToken: generateSecureToken(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Create user
    const user = await storage.createUser(userData);

    // Create company if specified
    let company = null;
    if (companyName) {
      company = await storage.createCompany({
        name: companyName,
        ownerId: user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Associate user with company
      await storage.associateUserWithCompany(user.id, company.id, 'owner');
    }

    // Generate tokens
    const token = generateJWTToken(user);
    const refreshToken = generateRefreshToken(user);

    // Set cookies
    setAuthCookies(res, token, refreshToken, false);

    // Send verification email
    if (user.emailVerified === false) {
      await sendVerificationEmail(user.email, user.verificationToken);
    }

    const userDataResponse: SessionUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      role: user.role,
      companyId: company?.id || null,
      permissions: ['user'],
      isActive: user.isActive,
      sub: user.id,
      claims: null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      companies: company ? [{
        id: company.id,
        name: company.name,
        logoUrl: company.logoUrl
      }] : [],
      currentCompanyId: company?.id
    };

    const registerResponse = {
      user: userDataResponse
    };

    const response = createSuccessResponse(registerResponse, 'Registration successful');
    res.status(200).json(response);

  } catch (error) {
    log.error('Registration error:', error as Error);
    const errorResponse = createErrorResponse(
      'INTERNAL_ERROR',
      'Registration failed',
      { message: 'An error occurred during registration' },
      500
    );
    res.status(errorResponse.statusCode).json(errorResponse.body);
  }
});

/**
 * Logout endpoint
 * POST /api/v1/auth/logout
 */
router.post('/logout', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const refreshToken = getRefreshTokenFromRequest(req);
    
    if (refreshToken) {
      // Invalidate refresh token
      await storage.invalidateRefreshToken(refreshToken);
    }

    // Clear cookies
    clearAuthCookies(res);

    const response = createSuccessResponse(
      { message: 'Logout successful' },
      'Logout successful'
    );
    res.json(response);

  } catch (error) {
    log.error('Logout error:', error as Error);
    const errorResponse = createErrorResponse(
      'INTERNAL_ERROR',
      'Logout failed',
      { message: 'An error occurred during logout' },
      500
    );
    res.status(errorResponse.statusCode).json(errorResponse.body);
  }
});

/**
 * Refresh token endpoint
 * POST /api/v1/auth/refresh
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const refreshToken = getRefreshTokenFromRequest(req);
    
    if (!refreshToken) {
      const errorResponse = createErrorResponse(
        'AUTHENTICATION_ERROR',
        'Refresh token required',
        { reason: 'missing_refresh_token' },
        401
      );
      return res.status(errorResponse.statusCode).json(errorResponse.body);
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      const errorResponse = createErrorResponse(
        'AUTHENTICATION_ERROR',
        'Invalid refresh token',
        { reason: 'invalid_refresh_token' },
        401
      );
      return res.status(errorResponse.statusCode).json(errorResponse.body);
    }

    // Check if token is blacklisted
    const isBlacklisted = await storage.isRefreshTokenBlacklisted(refreshToken);
    if (isBlacklisted) {
      const errorResponse = createErrorResponse(
        'AUTHENTICATION_ERROR',
        'Token has been revoked',
        { reason: 'token_revoked' },
        401
      );
      return res.status(errorResponse.statusCode).json(errorResponse.body);
    }

    // Get user
    const user = await storage.getUser(payload.userId);
    if (!user || !user.isActive) {
      const errorResponse = createErrorResponse(
        'AUTHENTICATION_ERROR',
        'User not found or inactive',
        { reason: 'user_inactive' },
        401
      );
      return res.status(errorResponse.statusCode).json(errorResponse.body);
    }

    // Invalidate old refresh token and get record
    const oldRecord = await storage.invalidateRefreshToken(refreshToken);

    // Generate new tokens
    const newToken = generateJWTToken(user);
    const newRefreshToken = generateRefreshToken(user);
    const newPayload = verifyRefreshToken(newRefreshToken);

    // Store new refresh token
    await storage.createRefreshToken({
      userId: user.id,
      tokenHash: hashToken(newRefreshToken),
      familyId: oldRecord?.familyId ?? crypto.randomUUID(),
      expiresAt: new Date((newPayload?.exp ?? 0) * 1000),
      userAgent: req.get('User-Agent') ?? '',
      ip: req.ip
    });

    // Set new cookies
    setAuthCookies(res, newToken, newRefreshToken, false);

    const refreshResponse = {
      message: 'Token refreshed successfully'
    };

    const response = createSuccessResponse(refreshResponse, 'Token refreshed successfully');
    res.json(response);

  } catch (error) {
    log.error('Token refresh error:', error as Error);
    const errorResponse = createErrorResponse(
      'INTERNAL_ERROR',
      'Token refresh failed',
      { message: 'An error occurred during token refresh' },
      500
    );
    res.status(errorResponse.statusCode).json(errorResponse.body);
  }
});

/**
 * Forgot password endpoint
 * POST /api/v1/auth/forgot-password
 */
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Validate input
    const validationResult = forgotPasswordSchema.safeParse({ email });
    if (!validationResult.success) {
      const errorResponse = createErrorResponse(
        'VALIDATION_ERROR',
        'Invalid email',
        {
          details: validationResult.error.issues,
          message: 'Email validation failed'
        },
        400
      );
      return res.status(errorResponse.statusCode).json(errorResponse.body);
    }

    // Get user by email
    const user = await storage.getUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not
      const response = createSuccessResponse(
        { message: 'If the email exists, a reset link has been sent' },
        'Password reset email sent'
      );
      return res.json(response);
    }

    // Generate reset token
    const resetToken = generateSecureToken();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Update user with reset token
    await storage.updateUser(user.id, {
      resetToken,
      resetTokenExpiry,
      updatedAt: new Date()
    });

    // Send reset email
    await sendPasswordResetEmail(email, resetToken);

    const response = createSuccessResponse(
      { message: 'If the email exists, a reset link has been sent' },
      'Password reset email sent'
    );
    res.json(response);

  } catch (error) {
    log.error('Forgot password error:', error as Error);
    const errorResponse = createErrorResponse(
      'INTERNAL_ERROR',
      'Password reset failed',
      { message: 'An error occurred during password reset' },
      500
    );
    res.status(errorResponse.statusCode).json(errorResponse.body);
  }
});

/**
 * Reset password endpoint
 * POST /api/v1/auth/reset-password
 */
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, password, confirmPassword } = req.body;

    // Validate input
    const validationResult = resetPasswordSchema.safeParse({
      token,
      password,
      confirmPassword
    });

    if (!validationResult.success) {
      const errorResponse = createErrorResponse(
        'VALIDATION_ERROR',
        'Invalid reset data',
        {
          details: validationResult.error.issues,
          message: 'Reset data validation failed'
        },
        400
      );
      return res.status(errorResponse.statusCode).json(errorResponse.body);
    }

    // Get user by reset token
    const user = await storage.getUserByResetToken(token);
    if (!user) {
      const errorResponse = createErrorResponse(
        'VALIDATION_ERROR',
        'Invalid reset token',
        { message: 'Reset token is invalid or expired' },
        400
      );
      return res.status(errorResponse.statusCode).json(errorResponse.body);
    }

    // Check if token is expired
    if (user.resetTokenExpiry && user.resetTokenExpiry < new Date()) {
      const errorResponse = createErrorResponse(
        'VALIDATION_ERROR',
        'Reset token expired',
        { message: 'Reset token has expired' },
        400
      );
      return res.status(errorResponse.statusCode).json(errorResponse.body);
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update user
    await storage.updateUser(user.id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
      updatedAt: new Date()
    });

    const response = createSuccessResponse(
      { message: 'Password reset successful' },
      'Password reset successful'
    );
    res.json(response);

  } catch (error) {
    log.error('Reset password error:', error as Error);
    const errorResponse = createErrorResponse(
      'INTERNAL_ERROR',
      'Password reset failed',
      { message: 'An error occurred during password reset' },
      500
    );
    res.status(errorResponse.statusCode).json(errorResponse.body);
  }
});

/**
 * Verify email endpoint
 * POST /api/v1/auth/verify-email
 */
router.post('/verify-email', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    // Validate input
    const validationResult = verifyEmailSchema.safeParse({ token });
    if (!validationResult.success) {
      const errorResponse = createErrorResponse(
        'VALIDATION_ERROR',
        'Invalid verification token',
        {
          details: validationResult.error.issues,
          message: 'Verification token validation failed'
        },
        400
      );
      return res.status(errorResponse.statusCode).json(errorResponse.body);
    }

    // Get user by verification token
    const user = await storage.getUserByVerificationToken(token);
    if (!user) {
      const errorResponse = createErrorResponse(
        'VALIDATION_ERROR',
        'Invalid verification token',
        { message: 'Verification token is invalid' },
        400
      );
      return res.status(errorResponse.statusCode).json(errorResponse.body);
    }

    // Update user
    await storage.updateUser(user.id, {
      emailVerified: true,
      verificationToken: null,
      updatedAt: new Date()
    });

    const response = createSuccessResponse(
      { message: 'Email verified successfully' },
      'Email verified successfully'
    );
    res.json(response);

  } catch (error) {
    log.error('Email verification error:', error as Error);
    const errorResponse = createErrorResponse(
      'INTERNAL_ERROR',
      'Email verification failed',
      { message: 'An error occurred during email verification' },
      500
    );
    res.status(errorResponse.statusCode).json(errorResponse.body);
  }
});

export default router;
