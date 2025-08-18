/**
 * @fileoverview Additional security middleware tests
 * @description Covers IP blocklist, rate limiting exceed, and CSRF error scenarios
 */
import request from 'supertest';
import { app } from '../server/index';

describe('Security Middleware Edge Cases', () => {
  describe('IP Blocklist', () => {
    it('should block subsequent requests from suspicious IP', async () => {
      // allow setting custom IP via X-Forwarded-For
      app.set('trust proxy', 1);
      const testIp = '1.2.3.4';

      const firstRes = await request(app)
        .post('/api/test-endpoint')
        .set('X-Forwarded-For', testIp)
        .send({ data: '<script>alert("x")</script>' });
      expect(firstRes.status).toBe(403);

      const secondRes = await request(app)
        .get('/health')
        .set('X-Forwarded-For', testIp);
      expect(secondRes.status).toBe(403);
      expect(secondRes.body).toHaveProperty('error');

      // reset trust proxy
      app.set('trust proxy', false);
    });
  });

  describe('Rate Limiting', () => {
    it('should return 429 after exceeding limit', async () => {
      const requests = [];
      for (let i = 0; i < 105; i++) {
        requests.push(request(app).get('/api/test-endpoint'));
      }
      const responses = await Promise.all(requests);
      const limited = responses.filter(r => r.status === 429);
      expect(limited.length).toBeGreaterThan(0);
    });
  });

  describe('CSRF Protection', () => {
    it('should reject requests with invalid CSRF token', async () => {
      const agent = request.agent(app);
      const tokenRes = await agent.get('/api/csrf-token');
      expect(tokenRes.status).toBe(200);

      const res = await agent
        .post('/api/test-endpoint')
        .set('X-CSRF-Token', 'invalid-token')
        .send({ data: 'test' });
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('error');
      expect(res.body).toHaveProperty('code', 'CSRF_TOKEN_INVALID');
    });
  });
});

