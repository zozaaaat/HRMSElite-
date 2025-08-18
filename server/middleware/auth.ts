import {Request, Response, NextFunction} from 'express';
import {storage} from '../models/storage';
import {log} from '../utils/logger';
import * as jwt from 'jsonwebtoken';

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

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET ?? "hrms-elite-secret-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "24h";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN ?? "7d";

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

  return jwt.sign(payload as object, JWT_SECRET as jwt.Secret, {
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

  return jwt.sign(payload as object, JWT_SECRET as jwt.Secret, {
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

    const decoded = jwt.verify(token, JWT_SECRET, {
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

    const decoded = jwt.verify(token, JWT_SECRET, {
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
 * Unified Authentication Middleware
 * Handles both session-based and JWT-based authentication
 */
export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {

  try {

    // Check for session-based authentication first
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

    // Check for JWT token authentication
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {

      const token = authHeader.substring(7);
      const decoded = verifyJWTToken(token);

      if (decoded) {

        // Use decoded?.id as string with proper type casting
        const userId = String(decoded?.id ?? '');

        // Get fresh user data from database
        const user = await storage.getUser(userId);
        if (!user?.isActive) {

          return res.status(401).json({'message': 'User not found or inactive'});

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

        return res.status(401).json({'message': 'Invalid or expired token'});

      }

    }

    // Check for header-based authentication (for development/testing)
    const userRole = req.headers['x-user-role'] as string;
    const userId = req.headers['x-user-id'] as string;
    const userEmail = req.headers['x-user-email'] as string;

    if (userRole && userId) {

      req.user = {
        'id': userId,
        'sub': userId,
        'role': userRole,
        'email': userEmail ?? "user@company.com",
        'firstName': 'محمد',
        'lastName': 'أحمد',
        'permissions': [],
        'isActive': true,
        'claims': null,
        'createdAt': new Date(),
        'updatedAt': new Date()
      };
      return next();

    }

    // No authentication found
    return res.status(401).json({'message': 'Authentication required'});

  } catch (error) {

    log.error('Authentication error:', error as Error, 'AUTH');
    return res.status(500).json({'message': 'Authentication service error'});

  }

};

/**
 * Role-based authorization middleware
 */
export const requireRole = (allowedRoles: string[]) => {

  return (req: Request, res: Response, next: NextFunction) => {

    if (!req.user) {

      return res.status(401).json({'message': 'Authentication required'});

    }

    const userRole = req.user.role;
    if (!allowedRoles.includes(userRole)) {

      return res.status(403).json({
        'message': 'Access denied. Insufficient permissions.',
        'requiredRoles': allowedRoles,
        userRole
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

      return res.status(401).json({'message': 'Authentication required'});

    }

    const userPermissions = req.user.permissions || [];
    if (!userPermissions.includes(requiredPermission)) {

      return res.status(403).json({
        'message': 'Access denied. Insufficient permissions.',
        requiredPermission,
        userPermissions
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

      return res.status(401).json({'message': 'Authentication required'});

    }

    const companyId = req.params[companyIdParam] || req.query.companyId as string;
    if (!companyId) {

      return res.status(400).json({'message': 'Company ID is required'});

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
      companyId
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

    } else if (req.headers['x-user-role'] && req.headers['x-user-id']) {

      const userRole = req.headers['x-user-role'] as string;
      const userId = req.headers['x-user-id'] as string;
      const userEmail = req.headers['x-user-email'] as string;

      req.user = {
        'id': userId,
        'sub': userId,
        'role': userRole,
        'email': userEmail ?? "user@company.com",
        'firstName': 'محمد',
        'lastName': 'أحمد',
        'permissions': [],
        'isActive': true,
        'claims': null,
        'createdAt': new Date(),
        'updatedAt': new Date()
      };

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
