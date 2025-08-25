import {Request, Response, NextFunction} from 'express';
import {storage} from '../models/storage';
import {log} from '../utils/logger';
import {env} from '../utils/env';
import * as jwt from 'jsonwebtoken';
import crypto from 'node:crypto';

// Define a local User interface that matches what we're actually using
interface AuthUser {
  id: string;
  sub: string;
  role: string;
  email?: string | undefined;
  firstName?: string | undefined;
  lastName?: string | undefined;
  companyId?: string | undefined;
  permissions: string[];
  isActive: boolean;
  claims: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

// Define session user interface
interface SessionUser {
  id: string;
  role: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  permissions?: string[];
  isActive?: boolean;
  claims?: Record<string, unknown> | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// JWT Configuration - Using validated environment variables
const ACCESS_JWT_SECRET = env.ACCESS_JWT_SECRET;
const REFRESH_JWT_SECRET = env.REFRESH_JWT_SECRET;
const JWT_EXPIRES_IN = env.JWT_EXPIRES_IN;
const JWT_REFRESH_EXPIRES_IN = env.JWT_REFRESH_EXPIRES_IN;

// Cookie configuration
const COOKIE_CONFIG = {
  httpOnly: true,
  secure: true, // Always secure for __Host- prefix
  sameSite: 'strict' as const,
  path: '/',
  domain: undefined // Let browser set domain for __Host- prefix
};

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// Extend express-session interface to include user
declare module 'express-session' {
  interface SessionData {
    user?: SessionUser;
  }
}

/**
 * Generate JWT token for user
 * @param payload - User data to include in token
 * @returns JWT token string
 */
export const generateJWTToken = (payload: Record<string, unknown>): string => {

  return jwt.sign(payload as object, ACCESS_JWT_SECRET as jwt.Secret, {
    'expiresIn': JWT_EXPIRES_IN,
    'issuer': 'hrms-elite',
    'audience': 'hrms-elite-users'
  } as jwt.SignOptions);

};

/**
 * Generate refresh token for user
 * @param payload - User data to include in refresh token
 * @returns Refresh token string
 */
export const generateRefreshToken = (payload: Record<string, unknown>): string => {

  return jwt.sign(payload as object, REFRESH_JWT_SECRET as jwt.Secret, {
    'expiresIn': JWT_REFRESH_EXPIRES_IN,
    'issuer': 'hrms-elite',
    'audience': 'hrms-elite-refresh'
  } as jwt.SignOptions);

};

/**
 * Verify JWT token
 * @param token - JWT token to verify
 * @returns Decoded token payload or null if invalid
 */
export const verifyJWTToken = (token: string): jwt.JwtPayload | null => {

  try {

    const decoded = jwt.verify(token, ACCESS_JWT_SECRET, {
      'issuer': 'hrms-elite',
      'audience': 'hrms-elite-users'
    }) as jwt.JwtPayload;

    return decoded;

  } catch (error) {

    log.error('JWT verification failed:', error as Error, 'AUTH');
    return null;

  }

};

/**
 * Verify refresh token
 * @param token - Refresh token to verify
 * @returns Decoded token payload or null if invalid
 */
export const verifyRefreshToken = (token: string): jwt.JwtPayload | null => {

  try {

    const decoded = jwt.verify(token, REFRESH_JWT_SECRET, {
      'issuer': 'hrms-elite',
      'audience': 'hrms-elite-refresh'
    }) as jwt.JwtPayload;

    return decoded;

  } catch (error) {

    log.error('Refresh token verification failed:', error as Error, 'AUTH');
    return null;

  }

};

/**
 * Hash token using HMAC
 * @param token - Raw token
 * @returns HMAC hash
 */
export const hashToken = (token: string): string => {
  return crypto.createHmac('sha256', REFRESH_JWT_SECRET).update(token).digest('hex');
};

/**
 * Set authentication cookies
 * @param res - Express response object
 * @param accessToken - Short-lived access token
 * @param refreshToken - Long-lived refresh token
 */
export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string,
  rememberMe = false
): void => {
  // Set access token cookie (short-lived)
  res.cookie('__Host-hrms-elite-access', accessToken, {
    ...COOKIE_CONFIG,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  // Set refresh token cookie with optional extended expiry
  const refreshMaxAge = rememberMe
    ? 30 * 24 * 60 * 60 * 1000 // 30 days for remember me
    : 7 * 24 * 60 * 60 * 1000; // 7 days default

  res.cookie('__Host-hrms-elite-refresh', refreshToken, {
    ...COOKIE_CONFIG,
    maxAge: refreshMaxAge,
  });
};

/**
 * Clear authentication cookies
 * @param res - Express response object
 */
export const clearAuthCookies = (res: Response): void => {
  res.clearCookie('__Host-hrms-elite-access', COOKIE_CONFIG);
  res.clearCookie('__Host-hrms-elite-refresh', COOKIE_CONFIG);
};

/**
 * Get token from authentication cookies
 * @param req - Express request object
 * @returns Token string or null
 */
export const getTokenFromRequest = (req: Request): string | null => {
  // First check for access token in cookie
  const accessToken = req.cookies['__Host-hrms-elite-access'];
  if (accessToken) {
    return accessToken;
  }

  // No header fallback: tokens are cookies-only
  const hdr = undefined;
  return null;
};

/**
 * Get refresh token from cookies
 * @param req - Express request object
 * @returns Refresh token string or null
 */
export const getRefreshTokenFromRequest = (req: Request): string | null => {
  return req.cookies['__Host-hrms-elite-refresh'] || null;
};

/**
 * Unified Authentication Middleware
 * Handles cookie-based authentication with fallback to session-based
 */
export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {

  try {

    // Check for session-based authentication first (for backward compatibility)
    if (req.session?.user) {

      const sessionUser = req.session.user;
      req.user = {
        'id': sessionUser.id,
        'sub': sessionUser.id,
        'role': sessionUser.role,
        'email': sessionUser.email,
        'firstName': sessionUser.firstName ?? (sessionUser.name?.split(' ')[0] || 'User'),
        'lastName': sessionUser.lastName ?? (sessionUser.name?.split(' ').slice(1).join(' ') || ''),
        'permissions': sessionUser.permissions || [],
        'isActive': sessionUser.isActive ?? true,
        'claims': sessionUser.claims || null,
        'createdAt': sessionUser.createdAt ? new Date(sessionUser.createdAt) : new Date(),
        'updatedAt': sessionUser.updatedAt ? new Date(sessionUser.updatedAt) : new Date()
      };
      return next();

    }

    // Check for cookie-based authentication
    const token = getTokenFromRequest(req);
    if (token) {

      const decoded = verifyJWTToken(token);

      if (decoded) {

        // Use decoded?.id as string with proper type casting
        const userId = String(decoded?.id ?? '');

        // Get fresh user data from database
        const user = await storage.getUser(userId);
        if (!user?.isActive) {

          return res.status(401).json({
            'message': 'User not found or inactive',
            'error': 'المستخدم غير موجود أو غير نشط',
            'code': 'USER_NOT_FOUND_OR_INACTIVE',
            'timestamp': new Date().toISOString()
          });

        }

        // Get user's companies and permissions
        const _userCompanies = await storage.getUserCompanies(userId);
        const permissions = await storage.getUserPermissions(userId);

        // Parse permissions from JSON string if needed
        let parsedPermissions: string[] = [];
        if (typeof permissions === 'string') {
          try {
            parsedPermissions = JSON.parse(permissions);
          } catch {
            parsedPermissions = [];
          }
        } else if (Array.isArray(permissions)) {
          parsedPermissions = permissions;
        }

        req.user = {
          'id': user.id,
          'sub': user.id,
          'role': user.role,
          'email': user.email,
          'firstName': user.firstName,
          'lastName': user.lastName,
          'permissions': parsedPermissions,
          'isActive': user.isActive,
          'claims': user.claims ? JSON.parse(user.claims) : null,
          'createdAt': user.createdAt,
          'updatedAt': user.updatedAt
        };
        return next();

      } else {

        return res.status(401).json({
          'message': 'Invalid or expired token',
          'error': 'رمز المصادقة غير صالح أو منتهي الصلاحية',
          'code': 'INVALID_TOKEN',
          'timestamp': new Date().toISOString()
        });

      }

    }

    // No authentication found
    return res.status(401).json({
      'message': 'Authentication required',
      'error': 'يجب تسجيل الدخول للوصول إلى هذا المورد',
      'code': 'AUTHENTICATION_REQUIRED',
      'timestamp': new Date().toISOString()
    });

  } catch (error) {

    log.error('Authentication error:', error as Error, 'AUTH');
    return res.status(500).json({
      'message': 'Authentication service error',
      'error': 'خطأ في خدمة المصادقة',
      'code': 'AUTHENTICATION_SERVICE_ERROR',
      'timestamp': new Date().toISOString()
    });

  }

};

/**
 * Role-based authorization middleware
 */
export const requireRole = (allowedRoles: string[]) => {

  return (req: Request, res: Response, next: NextFunction) => {

    if (!req.user) {

      return res.status(401).json({
        'message': 'Authentication required',
        'error': 'يجب تسجيل الدخول للوصول إلى هذا المورد',
        'code': 'AUTHENTICATION_REQUIRED',
        'timestamp': new Date().toISOString()
      });

    }

    const userRole = req.user.role;
    if (!allowedRoles.includes(userRole)) {

      return res.status(403).json({
        'message': 'Access denied. Insufficient permissions.',
        'error': 'ليس لديك الصلاحيات المطلوبة للوصول إلى هذا المورد',
        'code': 'INSUFFICIENT_PERMISSIONS',
        'requiredRoles': allowedRoles,
        'userRole': userRole,
        'timestamp': new Date().toISOString()
      });

    }

    next();

  };

};

/**
 * Permission-based authorization middleware
 */
export const requirePermission = (requiredPermission: string) => {

  return (req: Request, res: Response, next: NextFunction) => {

    if (!req.user) {

      return res.status(401).json({
        'message': 'Authentication required',
        'error': 'يجب تسجيل الدخول للوصول إلى هذا المورد',
        'code': 'AUTHENTICATION_REQUIRED',
        'timestamp': new Date().toISOString()
      });

    }

    const userPermissions = req.user.permissions || [];
    if (!userPermissions.includes(requiredPermission)) {

      return res.status(403).json({
        'message': 'Access denied. Insufficient permissions.',
        'error': 'ليس لديك الصلاحيات المطلوبة للوصول إلى هذا المورد',
        'code': 'INSUFFICIENT_PERMISSIONS',
        'requiredPermission': requiredPermission,
        'userPermissions': userPermissions,
        'timestamp': new Date().toISOString()
      });

    }

    next();

  };

};

/**
 * Company access middleware
 */
export const requireCompanyAccess = (companyIdParam = 'companyId') => {

  return (req: Request, res: Response, next: NextFunction) => {

    if (!req.user) {

      return res.status(401).json({
        'message': 'Authentication required',
        'error': 'يجب تسجيل الدخول للوصول إلى هذا المورد',
        'code': 'AUTHENTICATION_REQUIRED',
        'timestamp': new Date().toISOString()
      });

    }

    const companyId = req.params[companyIdParam] || req.query.companyId as string;
    if (!companyId) {

      return res.status(400).json({
        'message': 'Company ID is required',
        'error': 'معرف الشركة مطلوب',
        'code': 'COMPANY_ID_REQUIRED',
        'timestamp': new Date().toISOString()
      });

    }

    // Super admin can access all companies
    if (req.user.role === 'super_admin') {

      return next();

    }

    // Check if user has access to this company through companyId
    if (req.user.companyId === companyId) {

      return next();

    }

    return res.status(403).json({
      'message': 'Access denied. No access to this company.',
      'error': 'ليس لديك صلاحية الوصول إلى هذه الشركة',
      'code': 'COMPANY_ACCESS_DENIED',
      'companyId': companyId,
      'timestamp': new Date().toISOString()
    });

  };

};

/**
 * Optional authentication middleware
 * Allows requests to proceed even if not authenticated
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {

  try {

    // Try to authenticate, but don't fail if not authenticated
    if (req.session?.user) {

      const sessionUser = req.session.user;
      req.user = {
        'id': sessionUser.id,
        'sub': sessionUser.id,
        'role': sessionUser.role,
        'email': sessionUser.email,
        'firstName': sessionUser.firstName ?? (sessionUser.name?.split(' ')[0] || 'User'),
        'lastName': sessionUser.lastName ?? (sessionUser.name?.split(' ').slice(1).join(' ') || ''),
        'permissions': sessionUser.permissions || [],
        'isActive': sessionUser.isActive ?? true,
        'claims': sessionUser.claims || null,
        'createdAt': sessionUser.createdAt ? new Date(sessionUser.createdAt) : new Date(),
        'updatedAt': sessionUser.updatedAt ? new Date(sessionUser.updatedAt) : new Date()
      };

    } else {
      const token = getTokenFromRequest(req);

      if (token) {
        const decoded = verifyJWTToken(token);

        if (decoded) {
          const userId = String(decoded.id ?? '');

          try {
            const user = await storage.getUser(userId);
            if (user?.isActive) {
              const permissions = await storage.getUserPermissions(userId);
              let parsedPermissions: string[] = [];

              if (typeof permissions === 'string') {
                try {
                  parsedPermissions = JSON.parse(permissions);
                } catch {
                  parsedPermissions = [];
                }
              } else if (Array.isArray(permissions)) {
                parsedPermissions = permissions;
              }

              req.user = {
                'id': user.id,
                'sub': user.id,
                'role': user.role,
                'email': user.email,
                'firstName': user.firstName,
                'lastName': user.lastName,
                'permissions': parsedPermissions,
                'isActive': user.isActive,
                'claims': user.claims ? JSON.parse(user.claims) : null,
                'createdAt': user.createdAt,
                'updatedAt': user.updatedAt
              };
            }
          } catch {
            // Ignore token errors in optional auth
          }
        }
      }
    }

    next();

  } catch {

    // Continue without authentication
    next();

  }

};

/**
 * Get current user from request
 */
export const getCurrentUser = (req: Request) => {

  return req.user;

};

/**
 * Check if user has specific permission
 */
export const hasPermission = (req: Request, permission: string): boolean => {

  if (!req.user) {

    return false;

  }
  return (req.user.permissions || []).includes(permission);

};

/**
 * Check if user has unknown of the specified permissions
 */
export const hasAnyPermission = (req: Request, permissions: string[]): boolean => {

  if (!req.user) {

    return false;

  }
  const userPermissions = req.user.permissions || [];
  return permissions.some(permission => userPermissions.includes(permission));

};

/**
 * Check if user has all specified permissions
 */
export const hasAllPermissions = (req: Request, permissions: string[]): boolean => {

  if (!req.user) {

    return false;

  }
  const userPermissions = req.user.permissions || [];
  return permissions.every(permission => userPermissions.includes(permission));

};
