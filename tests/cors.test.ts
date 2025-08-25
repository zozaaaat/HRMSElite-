/**
 * @fileoverview CORS allow-list enforcement tests
 */

import './test-env.js';
import express from 'express';
import request from 'supertest';
import cors from 'cors';
import { strictCors } from '../server/middleware/cors';

describe('Strict CORS middleware', () => {
  let app: express.Application;

  beforeEach(() => {
    process.env.CORS_ORIGINS = 'https://allowed.example';
    delete process.env.INTERNAL_CIDR_ALLOWLIST;

    app = express();
    app.use(cors(strictCors));
    app.get('/test', (_req, res) => res.json({ ok: true }));
  });

  it('rejects requests with disallowed Origin', async () => {
    const res = await request(app)
      .get('/test')
      .set('Origin', 'https://evil.example');

    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('handles originless requests without enabling CORS', async () => {
    const res = await request(app).get('/test');
    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });
});
