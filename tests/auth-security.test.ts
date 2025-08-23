/**
 * @fileoverview Authentication security tests verifying removal of header-based bypass.
 */

import request from 'supertest';
import express from 'express';
import {optionalAuth} from '../server/middleware/auth';

describe('Authentication Security - Header Bypass Removal', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(optionalAuth);

    app.get('/api/test', (req, res) => {
      if (req.user) {
        return res.json({success: true});
      }
      return res.status(401).json({success: false, message: 'Authentication required'});
    });
  });

  afterEach(() => {
    delete process.env.NODE_ENV;
    delete process.env.ALLOW_DEV_AUTH;
  });

  it('rejects header-based authentication in development', async () => {
    process.env.NODE_ENV = 'development';
    process.env.ALLOW_DEV_AUTH = 'true';

    const res = await request(app)
      .get('/api/test')
      .set('x-user-role', 'admin')
      .set('x-user-id', '123');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('rejects header-based authentication in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.ALLOW_DEV_AUTH = 'true';

    const res = await request(app)
      .get('/api/test')
      .set('x-user-role', 'admin')
      .set('x-user-id', '123');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

