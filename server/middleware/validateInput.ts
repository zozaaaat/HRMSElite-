import {Request, Response, NextFunction} from 'express';
import {ZodSchema} from 'zod';
import {log} from '../utils/logger';
import {deepSanitize} from '../utils/sanitize';

// Enhanced validation middleware with proper TypeScript support
export function validate (schema: ZodSchema) {

  return (req: Request, res: Response, next: NextFunction) => {

    try {

      // Validate request body
      const result = schema.safeParse(req.body);

      if (!result.success) {

        // Enhanced error handling with detailed validation errors
        const errors = result.error.errors.map(error => ({
          'field': error.path.join('.'),
          'message': error.message,
          'code': error.code
        }));

        log.warn('Validation failed', {
          'path': req.path,
          'method': req.method,
          errors,
          'ip': req.ip
        });

        return res.status(400).json({
          'error': 'Validation failed',
          'message': 'بيانات غير صحيحة',
          'details': errors,
          'timestamp': new Date().toISOString()
        });

      }

      // If validation passes, replace req.body with validated data
      req.body = result.data;
      next();

    } catch (error) {

      log.error('Validation middleware error', {
        'error': error instanceof Error ? error.message : 'Unknown error',
        'path': req.path,
        'method': req.method
      });

      return res.status(500).json({
        'error': 'Internal validation error',
        'message': 'خطأ في التحقق من البيانات'
      });

    }

  };

}

// Query parameter validation
export function validateQuery (schema: ZodSchema) {

  return (req: Request, res: Response, next: NextFunction) => {

    try {

      const result = schema.safeParse(req.query);

      if (!result.success) {

        const errors = result.error.errors.map(error => ({
          'field': error.path.join('.'),
          'message': error.message,
          'code': error.code
        }));

        log.warn('Query validation failed', {
          'path': req.path,
          'method': req.method,
          errors
        });

        return res.status(400).json({
          'error': 'Query validation failed',
          'message': 'معاملات البحث غير صحيحة',
          'details': errors
        });

      }

      req.query = result.data;
      next();

    } catch (error) {

      log.error('Query validation middleware error', {
        'error': error instanceof Error ? error.message : 'Unknown error',
        'path': req.path
      });

      return res.status(500).json({
        'error': 'Internal query validation error',
        'message': 'خطأ في التحقق من معاملات البحث'
      });

    }

  };

}

// URL parameters validation
export function validateParams (schema: ZodSchema) {

  return (req: Request, res: Response, next: NextFunction) => {

    try {

      const result = schema.safeParse(req.params);

      if (!result.success) {

        const errors = result.error.errors.map(error => ({
          'field': error.path.join('.'),
          'message': error.message,
          'code': error.code
        }));

        log.warn('Parameters validation failed', {
          'path': req.path,
          'method': req.method,
          errors
        });

        return res.status(400).json({
          'error': 'Parameters validation failed',
          'message': 'معاملات الرابط غير صحيحة',
          'details': errors
        });

      }

      req.params = result.data;
      next();

    } catch (error) {

      log.error('Parameters validation middleware error', {
        'error': error instanceof Error ? error.message : 'Unknown error',
        'path': req.path
      });

      return res.status(500).json({
        'error': 'Internal parameters validation error',
        'message': 'خطأ في التحقق من معاملات الرابط'
      });

    }

  };

}

// Multiple source validation
export function validateMultiple (validations: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) {

  return (req: Request, res: Response, next: NextFunction) => {

    try {

      const allErrors: Array<{
        source: string;
        field: string;
        message: string;
        code?: string;
      }> = [];

      // Validate body if schema provided
      if (validations.body) {
        const bodyResult = validations.body.safeParse(req.body);
        if (!bodyResult.success) {
          bodyResult.error.errors.forEach(error => {
            allErrors.push({
              source: 'body',
              field: error.path.join('.'),
              message: error.message,
              code: error.code
            });
          });
        } else {
          req.body = bodyResult.data;
        }
      }

      // Validate query if schema provided
      if (validations.query) {
        const queryResult = validations.query.safeParse(req.query);
        if (!queryResult.success) {
          queryResult.error.errors.forEach(error => {
            allErrors.push({
              source: 'query',
              field: error.path.join('.'),
              message: error.message,
              code: error.code
            });
          });
        } else {
          req.query = queryResult.data;
        }
      }

      // Validate params if schema provided
      if (validations.params) {
        const paramsResult = validations.params.safeParse(req.params);
        if (!paramsResult.success) {
          paramsResult.error.errors.forEach(error => {
            allErrors.push({
              source: 'params',
              field: error.path.join('.'),
              message: error.message,
              code: error.code
            });
          });
        } else {
          req.params = paramsResult.data;
        }
      }

      // If there are any errors, return them
      if (allErrors.length > 0) {
        log.warn('Multiple validation failed', {
          'path': req.path,
          'method': req.method,
          errors: allErrors
        });

        return res.status(400).json({
          'error': 'Validation failed',
          'message': 'بيانات غير صحيحة',
          'details': allErrors,
          'timestamp': new Date().toISOString()
        });
      }

      next();

    } catch (error) {

      log.error('Multiple validation middleware error', {
        'error': error instanceof Error ? error.message : 'Unknown error',
        'path': req.path,
        'method': req.method
      });

      return res.status(500).json({
        'error': 'Internal validation error',
        'message': 'خطأ في التحقق من البيانات'
      });

    }

  };

}

// Input sanitization middleware
export function sanitizeInput (req: Request, res: Response, next: NextFunction) {
  req.body = deepSanitize(req.body) as typeof req.body;
  req.query = deepSanitize(req.query) as typeof req.query;
  req.params = deepSanitize(req.params) as typeof req.params;
  next();
}

// Export a structured object for easier imports
export const validateInput = {
  body: validate,
  query: validateQuery,
  params: validateParams,
  multiple: validateMultiple,
  sanitize: sanitizeInput
};
