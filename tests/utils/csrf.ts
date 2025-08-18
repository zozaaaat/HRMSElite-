import request from 'supertest';
import type {Application} from 'express';

interface CsrfData {
  token: string;
  cookie: string;
}

let cached: CsrfData | null = null;

/**
 * Retrieve CSRF token and cookie from the server.
 * The result is cached for reuse across multiple requests.
 * @param {Application} app Express application instance
 * @returns {Promise<CsrfData>} CSRF token and cookie pair
 */
export const getCsrf = async (app: Application): Promise<CsrfData> => {
  if (cached) return cached;

  const res = await request(app).get('/api/csrf-token');
  const token = (res.headers['x-csrf-token'] as string) ?? res.body.csrfToken;
  const cookie = res.headers['set-cookie']?.[0]?.split(';')[0] ?? '';
  cached = {token, cookie};
  return cached;
};
