import {Router, Request, Response} from 'express';
import {storage} from '../models/storage';
import {log} from '../utils/logger';
import {
  isAuthenticated,
  optionalAuth,
  generateJWTToken,
  generateRefreshToken,
  verifyRefreshToken
} from '../middleware/auth';
import {
  hashPassword,
  verifyPassword,
  generateSecureToken,
  validatePasswordStrength,
  isPasswordDifferent
} from '../utils/password';
import {
  sendVerificationEmail,
  sendPasswordResetEmail
} from '../utils/email';
import {
  registerUserSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  type InsertUser
} from '@shared/schema';

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
 * GET /api/auth/user
 * Returns current user with company context
 */
router.get('/user', isAuthenticated, async (req:  Request, res:  Response) => {

  try {

    const userId = req.user!.id;
    const companyId = req.query.companyId as string;

    // Get user data
    const user = await storage.getUser(userId);
    if (!user) {

      return res.status(404).json({'message': 'User not found'});

    }

    // Get user's companies and roles
    const userCompanies = await storage.getUserCompanies(userId);

    // If companyId is specified, filter to that company
    let currentCompany = null;
    if (companyId) {

      currentCompany = userCompanies.find(company => company.id === companyId);
      if (!currentCompany) {

        return res.status(403).json({'message': 'No access to specified company'});

      }

    }

    // Get user permissions for current company
    const permissions = companyId
      ? await storage.getUserPermissions(userId, companyId)
      : await storage.getUserPermissions(userId);

    // Create unified user response
    const response = {
      'id': user.id,
      'email': user.email,
      'firstName': user.firstName,
      'lastName': user.lastName,
      'role': user.role,
      'companies': userCompanies,
      permissions,
      'companyId': currentCompany?.id ?? user.companyId,
      currentCompany,
      'createdAt': user.createdAt,
      'updatedAt': user.updatedAt,
      'lastLoginAt': user.lastLoginAt,
      'isActive': user.isActive,
      'emailVerified': user.emailVerified,
      'profileImageUrl': user.profileImageUrl,
      'sub': user.id, // Use user ID as sub
      'claims': user.claims ?? null
    };

    res.json(response);

  } catch (error) {

    log.error('Error fetching user:', error as Error, 'AUTH');
    res.status(500).json({'message': 'Failed to fetch user'});

  }

});

/**
 * Current User Endpoint - Redirects to unified endpoint
 * GET /api/auth/current-user
 */
router.get('/current-user', isAuthenticated, async (req:  Request, res:  Response) => {

  // Redirect to unified endpoint
  res.redirect('/api/auth/user');

});

/**
 * Register Endpoint
 * POST /api/auth/register
 */
router.post('/register', async (req:  Request, res:  Response) => {

  try {

    // Validate input
    const validationResult = registerUserSchema.safeParse(req.body);
    if (!validationResult.success) {

      return res.status(400).json({
        'message': 'Invalid input data',
        'errors': validationResult.error.errors
      });

    }

    const {email, password, firstName, lastName, companyId, role} = validationResult.data;

    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {

      return res.status(409).json({'message': 'User with this email already exists'});

    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {

      return res.status(400).json({'message': passwordValidation.message});

    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate email verification token
    const verificationToken = generateSecureToken();

    // Create user
    const userData: InsertUser = {
      email,
      firstName,
      lastName,
      'password': hashedPassword,
      'role': role ?? "worker",
      companyId,
      'emailVerificationToken': verificationToken,
      'emailVerificationExpires': Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
      'isActive': true,
      'emailVerified': false
    };

    const newUser = await storage.createUser(userData);

    // Send verification email
    await sendVerificationEmail(email, verificationToken, firstName);

    // Generate JWT tokens
    const tokenPayload = {
      'id': newUser.id,
      'email': newUser.email,
      'firstName': newUser.firstName,
      'lastName': newUser.lastName,
      'role': newUser.role,
      'companyId': newUser.companyId
    };

    const accessToken = generateJWTToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    res.status(201).json({
      'success': true,
      'message': 'تم التسجيل بنجاح. يرجى التحقق من بريدك الإلكتروني',
      'user': {
        'id': newUser.id,
        'email': newUser.email,
        'firstName': newUser.firstName,
        'lastName': newUser.lastName,
        'role': newUser.role,
        'emailVerified': newUser.emailVerified
      },
      'tokens': {
        accessToken,
        refreshToken,
        'expiresIn': process.env.JWT_EXPIRES_IN ?? "24h"
      }
    });

  } catch (error) {

    log.error('Registration error:', error as Error, 'AUTH');
    res.status(500).json({'message': 'حدث خطأ في التسجيل'});

  }

});

/**
 * Login Endpoint
 * POST /api/auth/login
 */
router.post('/login', async (req:  Request, res:  Response) => {

  try {

    // Validate input
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {

      return res.status(400).json({
        'message': 'Invalid input data',
        'errors': validationResult.error.errors
      });

    }

    const {email, password, companyId} = validationResult.data;

    // Get user by email
    const user = await storage.getUserByEmail(email);
    if (!user) {

      return res.status(401).json({'message': 'البريد الإلكتروني أو كلمة المرور غير صحيحة'});

    }

    // Check if user is active
    if (!user.isActive) {

      return res.status(401).json({'message': 'الحساب غير مفعل'});

    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password ?? '');
    if (!isPasswordValid) {

      return res.status(401).json({'message': 'البريد الإلكتروني أو كلمة المرور غير صحيحة'});

    }

    // Update last login
    await storage.updateUserLastLogin(user.id);

    // Get user companies
    const userCompanies = await storage.getUserCompanies(user.id);

    // Get user permissions
    const permissions = companyId
      ? await storage.getUserPermissions(user.id, companyId)
      : await storage.getUserPermissions(user.id);

    // Generate JWT tokens
    const tokenPayload = {
      'id': user.id,
      'email': user.email,
      'firstName': user.firstName,
      'lastName': user.lastName,
      'role': user.role,
      'companyId': user.companyId
    };

    const accessToken = generateJWTToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store user session with proper typing
    const sessionUser: SessionUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      companies: userCompanies,
      permissions,
      sub: user.id,
      isActive: user.isActive,
      claims: typeof user.claims === 'string' ? JSON.parse(user.claims) as Record<string, unknown> : user.claims,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      companyId: user.companyId
    };

    (req.session as SessionData).user = sessionUser;

    res.json({
      'success': true,
      'user': {
        'id': user.id,
        'email': user.email,
        'firstName': user.firstName,
        'lastName': user.lastName,
        'role': user.role,
        'companies': userCompanies,
        permissions,
        'companyId': user.companyId,
        'emailVerified': user.emailVerified,
        'sub': user.id
      },
      'tokens': {
        accessToken,
        refreshToken,
        'expiresIn': process.env.JWT_EXPIRES_IN ?? "24h"
      }
    });

  } catch (error) {

    log.error('Login error:', error as Error, 'AUTH');
    res.status(500).json({'message': 'حدث خطأ في تسجيل الدخول'});

  }

});

/**
 * Logout Endpoint
 * POST /api/auth/logout
 */
router.post('/logout', (req:  Request, res:  Response) => {

  req.session?.destroy(() => {

    res.json({'success': true, 'message': 'تم تسجيل الخروج بنجاح'});

  });

});

/**
 * Switch Company Endpoint
 * POST /api/auth/switch-company
 */
router.post('/switch-company', isAuthenticated, async (req:  Request, res:  Response) => {

  try {

    const {companyId} = req.body as {companyId: string};
    const userId = req.user!.id;

    // Verify user has access to this company
    const userCompanies = await storage.getUserCompanies(userId);
    const targetCompany = userCompanies.find(company => company.id === companyId);

    if (!targetCompany) {

      return res.status(403).json({'message': 'No access to specified company'});

    }

    // Get user permissions for new company
    const permissions = await storage.getUserPermissions(userId, companyId);

    // Update session with proper typing
    const currentSession = req.session as SessionData;
    if (currentSession.user) {
      currentSession.user = {
        ...currentSession.user,
        'currentCompanyId': companyId,
        permissions
      };
    }

    res.json({
      'success': true,
      'user': {
        ...currentSession.user,
        'currentCompany': targetCompany,
        permissions
      }
    });

  } catch (error) {

    log.error('Error switching company:', error as Error, 'AUTH');
    res.status(500).json({'message': 'Failed to switch company'});

  }

});

/**
 * User Companies Endpoint
 * GET /api/auth/user/companies
 */
router.get('/user/companies', isAuthenticated, async (req:  Request, res:  Response) => {

  try {

    const userId = req.user!.id;
    const companies = await storage.getUserCompanies(userId);
    res.json(companies);

  } catch (error) {

    log.error('Error fetching user companies:', error as Error, 'AUTH');
    res.status(500).json({'message': 'Failed to fetch user companies'});

  }

});

/**
 * Refresh Token Endpoint
 * POST /api/auth/refresh-token
 */
router.post('/refresh-token', async (req:  Request, res:  Response) => {

  try {

    const {refreshToken} = req.body as {refreshToken: string};

    if (!refreshToken) {

      return res.status(400).json({'message': 'Refresh token is required'});

    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {

      return res.status(401).json({'message': 'Invalid or expired refresh token'});

    }

    // Get fresh user data
    const user = await storage.getUser((decoded as { id: string }).id);
    if (!user?.isActive) {

      return res.status(401).json({'message': 'User not found or inactive'});

    }

    // Generate new tokens
    const tokenPayload = {
      'id': user.id,
      'email': user.email,
      'firstName': user.firstName,
      'lastName': user.lastName,
      'role': user.role,
      'companyId': user.companyId
    };

    const newAccessToken = generateJWTToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    res.json({
      'success': true,
      'tokens': {
        'accessToken': newAccessToken,
        'refreshToken': newRefreshToken,
        'expiresIn': process.env.JWT_EXPIRES_IN ?? "24h"
      }
    });

  } catch (error) {

    log.error('Token refresh error:', error as Error, 'AUTH');
    res.status(500).json({'message': 'Failed to refresh token'});

  }

});

/**
 * User Permissions Endpoint
 * GET /api/auth/user/permissions
 */
router.get('/user/permissions', isAuthenticated, async (req:  Request, res:  Response) => {

  try {

    const userId = req.user!.id;
    const companyId = req.query.companyId as string;

    const permissions = companyId
      ? await storage.getUserPermissions(userId, companyId)
      : await storage.getUserPermissions(userId);

    res.json(permissions);

  } catch (error) {

    log.error('Error fetching user permissions:', error as Error, 'AUTH');
    res.status(500).json({'message': 'Failed to fetch user permissions'});

  }

});

/**
 * User Roles Endpoint
 * GET /api/auth/user/roles
 */
router.get('/user/roles', isAuthenticated, async (req:  Request, res:  Response) => {

  try {

    const userId = req.user!.id;
    const companyId = req.query.companyId as string;

    const roles = companyId
      ? await storage.getUserRoles(userId, companyId)
      : await storage.getUserRoles(userId);

    res.json(roles);

  } catch (error) {

    log.error('Error fetching user roles:', error as Error, 'AUTH');
    res.status(500).json({'message': 'Failed to fetch user roles'});

  }

});

/**
 * Change Password Endpoint
 * POST /api/auth/change-password
 */
router.post('/change-password', isAuthenticated, async (req:  Request, res:  Response) => {

  try {

    // Validate input
    const validationResult = changePasswordSchema.safeParse(req.body);
    if (!validationResult.success) {

      return res.status(400).json({
        'message': 'Invalid input data',
        'errors': validationResult.error.errors
      });

    }

    const {currentPassword, newPassword} = validationResult.data;
    const userId = req.user!.id;

    // Get current user
    const user = await storage.getUser(userId);
    if (!user) {

      return res.status(404).json({'message': 'User not found'});

    }

    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password || '');
    if (!isCurrentPasswordValid) {

      return res.status(401).json({'message': 'كلمة المرور الحالية غير صحيحة'});

    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {

      return res.status(400).json({'message': passwordValidation.message});

    }

    // Check if new password is different from current
    const isDifferent = await isPasswordDifferent(newPassword, user.password ?? '');
    if (!isDifferent) {

      return res.status(400).json({'message': 'كلمة المرور الجديدة يجب أن تكون مختلفة عن الحالية'});

    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    await storage.updateUserPassword(userId, hashedNewPassword);

    log.info(`Password changed successfully for user ${userId}`, undefined, 'AUTH');

    res.json({'success': true, 'message': 'تم تغيير كلمة المرور بنجاح'});

  } catch (error) {

    log.error('Error changing password:', error as Error, 'AUTH');
    res.status(500).json({'message': 'Failed to change password'});

  }

});

/**
 * Update Profile Endpoint
 * PUT /api/auth/update-profile
 */
router.put('/update-profile', isAuthenticated, async (req:  Request, res:  Response) => {

  try {

    const userId = req.user!.id;
    const {firstName, lastName, profileImageUrl} = req.body as {
      firstName?: string;
      lastName?: string;
      profileImageUrl?: string;
    };

    // Validate input
    if (firstName && firstName.length < 2) {

      return res.status(400).json({'message': 'First name must be at least 2 characters'});

    }

    if (lastName && lastName.length < 2) {

      return res.status(400).json({'message': 'Last name must be at least 2 characters'});

    }

    // Update user profile
    const updateData: Record<string, unknown> = {'updatedAt': new Date()};
    if (firstName) {

      updateData.firstName = firstName;

    }
    if (lastName) {

      updateData.lastName = lastName;

    }
    if (profileImageUrl) {

      updateData.profileImageUrl = profileImageUrl;

    }

    const updatedUser = await storage.updateUser(userId, updateData);

    log.info(`Profile updated for user ${userId}`, updateData, 'AUTH');

    res.json({
      'success': true,
      'message': 'تم تحديث الملف الشخصي بنجاح',
      'user': {
        'id': updatedUser.id,
        'email': updatedUser.email,
        'firstName': updatedUser.firstName,
        'lastName': updatedUser.lastName,
        'profileImageUrl': updatedUser.profileImageUrl
      }
    });

  } catch (error) {

    log.error('Error updating profile:', error as Error, 'AUTH');
    res.status(500).json({'message': 'Failed to update profile'});

  }

});

/**
 * Forgot Password Endpoint
 * POST /api/auth/forgot-password
 */
router.post('/forgot-password', async (req:  Request, res:  Response) => {

  try {

    // Validate input
    const validationResult = forgotPasswordSchema.safeParse(req.body);
    if (!validationResult.success) {

      return res.status(400).json({
        'message': 'Invalid input data',
        'errors': validationResult.error.errors
      });

    }

    const {email} = validationResult.data;

    // Get user by email
    const user = await storage.getUserByEmail(email);
    if (!user) {

      // Don't reveal if user exists or not for security
      return res.json({'success': true, 'message': 'تم إرسال رابط إعادة تعيين كلمة المرور'});

    }

    // Check if user is active
    if (!user.isActive) {

      return res.json({'success': true, 'message': 'تم إرسال رابط إعادة تعيين كلمة المرور'});

    }

    // Generate reset token
    const resetToken = generateSecureToken();

    // Set reset token in database
    await storage.setPasswordResetToken(user.id, resetToken);

    // Send reset email
    await sendPasswordResetEmail(email, resetToken, user.firstName ?? "User");

    log.info(`Password reset requested for email ${email}`, undefined, 'AUTH');

    res.json({'success': true, 'message': 'تم إرسال رابط إعادة تعيين كلمة المرور'});

  } catch (error) {

    log.error('Error processing forgot password:', error as Error, 'AUTH');
    res.status(500).json({'message': 'Failed to process forgot password request'});

  }

});

/**
 * Reset Password Endpoint
 * POST /api/auth/reset-password
 */
router.post('/reset-password', async (req:  Request, res:  Response) => {

  try {

    // Validate input
    const validationResult = resetPasswordSchema.safeParse(req.body);
    if (!validationResult.success) {

      return res.status(400).json({
        'message': 'Invalid input data',
        'errors': validationResult.error.errors
      });

    }

    const {token, newPassword} = validationResult.data;

    // Validate password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {

      return res.status(400).json({'message': passwordValidation.message});

    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Reset password with token
    const user = await storage.resetPasswordWithToken(token, hashedPassword);
    if (!user) {

      return res.status(400).json({'message': 'Token غير صالح أو منتهي الصلاحية'});

    }

    log.info(`Password reset successful for user ${user.id}`, undefined, 'AUTH');

    res.json({'success': true, 'message': 'تم إعادة تعيين كلمة المرور بنجاح'});

  } catch (error) {

    log.error('Error resetting password:', error as Error, 'AUTH');
    res.status(500).json({'message': 'Failed to reset password'});

  }

});

/**
 * Verify Email Endpoint
 * POST /api/auth/verify-email
 */
router.post('/verify-email', async (req:  Request, res:  Response) => {

  try {

    // Validate input
    const validationResult = verifyEmailSchema.safeParse(req.body);
    if (!validationResult.success) {

      return res.status(400).json({
        'message': 'Invalid input data',
        'errors': validationResult.error.errors
      });

    }

    const {token} = validationResult.data;

    // Verify email with token
    const user = await storage.verifyEmailWithToken(token);
    if (!user) {

      return res.status(400).json({'message': 'Token غير صالح أو منتهي الصلاحية'});

    }

    log.info(`Email verified for user ${user.id}`, undefined, 'AUTH');

    res.json({'success': true, 'message': 'تم التحقق من البريد الإلكتروني بنجاح'});

  } catch (error) {

    log.error('Error verifying email:', error as Error, 'AUTH');
    res.status(500).json({'message': 'Failed to verify email'});

  }

});

/**
 * Resend Verification Email Endpoint
 * POST /api/auth/resend-verification
 */
router.post('/resend-verification', async (req:  Request, res:  Response) => {

  try {

    const {email} = req.body as {email: string};

    if (!email) {

      return res.status(400).json({'message': 'Email is required'});

    }

    // Get user by email
    const user = await storage.getUserByEmail(email);
    if (!user) {

      return res.status(404).json({'message': 'User not found'});

    }

    // Check if email is already verified
    if (user.emailVerified) {

      return res.status(400).json({'message': 'Email is already verified'});

    }

    // Generate new verification token
    const verificationToken = generateSecureToken();

    // Set verification token
    await storage.setEmailVerificationToken(user.id, verificationToken);

    // Send verification email
    await sendVerificationEmail(email, verificationToken, user.firstName ?? "User");

    log.info(`Verification email resent to ${email}`, undefined, 'AUTH');

    res.json({'success': true, 'message': 'تم إعادة إرسال رابط التحقق'});

  } catch (error) {

    log.error('Error resending verification email:', error as Error, 'AUTH');
    res.status(500).json({'message': 'Failed to resend verification email'});

  }

});

/**
 * Session Endpoint
 * GET /api/auth/session
 */
router.get('/session', optionalAuth, (req:  Request, res:  Response) => {

  if (req.user) {

    res.json({
      'isAuthenticated': true,
      'user': req.user
    });

  } else {

    res.json({
      'isAuthenticated': false,
      'user': null
    });

  }

});

export default router;
