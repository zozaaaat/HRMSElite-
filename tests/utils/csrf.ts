import request from 'supertest';
import type {Express} from 'express';

/**
 * Retrieve CSRF token and session cookie for testing.
 * @param app Express application instance
 * @returns Object containing token and cookie header
 */
export const getCsrf = async (app: Express) => {
  const response = await request(app).get('/api/csrf-token');
  const csrfToken = response.body?.csrfToken as string;
  const cookie = Array.isArray(response.headers['set-cookie'])
    ? response.headers['set-cookie'].map(c => c.split(';')[0]).join('; ')
    : '';
  return {csrfToken, cookie};
};
