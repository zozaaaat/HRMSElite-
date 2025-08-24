/**
 * @fileoverview CORS allow-list enforcement tests
 */

import './test-env.js';
import express from 'express';
import request from 'supertest';
import { strictCors } from '../server/middleware/cors';

describe('Strict CORS middleware', () => {
  let app: express.Application;

  beforeEach(() => {
    process.env.CORS_ORIGINS = 'https://allowed.example';
    delete process.env.INTERNAL_CIDR_ALLOWLIST;

    app = express();
    app.use(strictCors);
    app.get('/test', (_req, res) => res.json({ ok: true }));
  });

  it('rejects requests with disallowed Origin', async () => {
    const res = await request(app)
      .get('/test')
      .set('Origin', 'https://evil.example');

    expect(res.status).toBe(403);
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('rejects originless requests from non-internal sources', async () => {
    const res = await request(app).get('/test');
    expect(res.status).toBe(403);
  });
});
