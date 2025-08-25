import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import { log } from '../utils/logger';

// Standardized error response interface
export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
  traceId?: string;
}

// Standardized pagination interface
export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  links: {
    first: string;
    last: string;
    prev?: string;
    next?: string;
  };
}

// Extract pagination parameters from request
export function extractPaginationParams(req: Request): PaginationParams {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize as string) || 20));
  
  return { page, pageSize };
}

// Generate pagination links
export function generatePaginationLinks(
  req: Request,
  page: number,
  totalPages: number,
  total: number
): PaginationResult<any>['links'] {
  const baseUrl = `${req.protocol}://${req.get('host')}${req.path}`;
  const queryParams = new URLSearchParams(req.query as Record<string, string>);
  
  const links: PaginationResult<any>['links'] = {
    first: `${baseUrl}?${queryParams.toString()}`,
    last: `${baseUrl}?${new URLSearchParams({ ...req.query, page: totalPages.toString() } as Record<string, string>).toString()}`
  };

  if (page > 1) {
    links.prev = `${baseUrl}?${new URLSearchParams({ ...req.query, page: (page - 1).toString() } as Record<string, string>).toString()}`;
  }

  if (page < totalPages) {
    links.next = `${baseUrl}?${new URLSearchParams({ ...req.query, page: (page + 1).toString() } as Record<string, string>).toString()}`;
  }

  return links;
}

// Standardized error response middleware
export function createErrorResponse(
  code: string,
  message: string,
  details?: unknown,
  statusCode: number = 500
): { statusCode: number; body: ApiError } {
  const traceId = randomUUID();
  
  return {
    statusCode,
    body: {
      code,
      message,
      details,
      traceId
    }
  };
}

// Standardized success response
export function createSuccessResponse<T>(
  data: T,
  message?: string
): { success: true; data: T; message?: string; timestamp: string } {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  };
}

// Standardized paginated response
export function createPaginatedResponse<T>(
  req: Request,
  data: T[],
  total: number,
  page: number,
  pageSize: number,
  message?: string
): PaginationResult<T> & { success: true; message?: string; timestamp: string } {
  const totalPages = Math.ceil(total / pageSize);
  const links = generatePaginationLinks(req, page, totalPages, total);

  return {
    success: true,
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    },
    links,
    message,
    timestamp: new Date().toISOString()
  };
}

// Error handling middleware
export function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const traceId = randomUUID();
  
  // Log error with trace ID
  log.error(`[${traceId}] Error`, { error });

  // CSRF errors
  if (error.code === 'EBADCSRFTOKEN') {
    const errorResponse = createErrorResponse(
      'CSRF_TOKEN_INVALID',
      'Invalid CSRF token',
      { reason: 'token_mismatch' },
      403
    );
    return res.status(errorResponse.statusCode).json(errorResponse.body);
  }

  // Rate limit errors
  if (error.status === 429) {
    const errorResponse = createErrorResponse(
      'RATE_LIMIT_EXCEEDED',
      'Rate limit exceeded',
      {
        limit: error.limit,
        remaining: error.remaining,
        resetTime: error.resetTime,
        retryAfter: error.retryAfter
      },
      429
    );
    return res.status(errorResponse.statusCode).json(errorResponse.body);
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    const errorResponse = createErrorResponse(
      'VALIDATION_ERROR',
      'Validation failed',
      error.details || error.message,
      400
    );
    return res.status(errorResponse.statusCode).json(errorResponse.body);
  }

  // Authentication errors
  if (error.name === 'AuthenticationError') {
    const errorResponse = createErrorResponse(
      'AUTHENTICATION_ERROR',
      'Authentication failed',
      { reason: error.reason || 'invalid_credentials' },
      401
    );
    return res.status(errorResponse.statusCode).json(errorResponse.body);
  }

  // Authorization errors
  if (error.name === 'AuthorizationError') {
    const errorResponse = createErrorResponse(
      'AUTHORIZATION_ERROR',
      'Access denied',
      {
        requiredRole: error.requiredRole,
        userRole: error.userRole,
        resource: error.resource,
        action: error.action
      },
      403
    );
    return res.status(errorResponse.statusCode).json(errorResponse.body);
  }

  // Not found errors
  if (error.status === 404 || error.name === 'NotFoundError') {
    const errorResponse = createErrorResponse(
      'NOT_FOUND',
      'Resource not found',
      { resource: error.resource, id: error.id },
      404
    );
    return res.status(errorResponse.statusCode).json(errorResponse.body);
  }

  // Conflict errors
  if (error.status === 409 || error.name === 'ConflictError') {
    const errorResponse = createErrorResponse(
      'CONFLICT',
      'Resource conflict',
      {
        resource: error.resource,
        field: error.field,
        value: error.value,
        existingId: error.existingId
      },
      409
    );
    return res.status(errorResponse.statusCode).json(errorResponse.body);
  }

  // Default error response
  const isDevelopment = process.env.NODE_ENV === 'development';
  const errorResponse = createErrorResponse(
    'INTERNAL_ERROR',
    isDevelopment ? error.message : 'Internal server error',
    isDevelopment ? { stack: error.stack } : undefined,
    error.status || 500
  );

  res.status(errorResponse.statusCode).json(errorResponse.body);
}

// API versioning middleware
export function apiVersioning(version: string = 'v1') {
  return (req: Request, res: Response, next: NextFunction) => {
    // Add version info to request
    (req as any).apiVersion = version;
    
    // Add version to response headers
    res.setHeader('X-API-Version', version);
    
    next();
  };
}

// Pagination middleware
export function paginationMiddleware(req: Request, res: Response, next: NextFunction) {
  const { page, pageSize } = extractPaginationParams(req);
  
  // Add pagination info to request
  (req as any).pagination = { page, pageSize };
  
  // Add pagination headers
  res.setHeader('X-Pagination-Page', page.toString());
  res.setHeader('X-Pagination-PageSize', pageSize.toString());
  
  next();
}
