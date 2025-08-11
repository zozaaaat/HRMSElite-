import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../server/index';
import { db } from '../../server/models/db';
import { users } from '../../shared/schema';
import { logger } from '@utils/logger';


describe('Performance Tests - Concurrent Requests', () => {
  const testUsers: any[] = [];
  const authTokens: string[] = [];

  beforeAll(async () => {
    // Create test users for concurrent testing
    const userPromises = Array.from({ length: 10 }, (_, i) => ({
      username: `testuser${i}`,
      email: `test${i}@example.com`,
      password: 'TestPassword123!',
      role: 'employee',
      company_id: 1,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }));

    // Insert test users
    for (const userData of userPromises) {
      const [insertedUser] = await db.insert(users).values(userData).returning();
      testUsers.push(insertedUser);
    }

    // Get auth tokens for all users
    for (const user of testUsers) {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: user.username,
          password: 'TestPassword123!'
        });

      authTokens.push(response.body.token);
    }
  });

  afterAll(async () => {
    // Clean up test users
    await db.delete(users);
  });

  describe('Concurrent Login Requests', () => {
    it('should handle 100 concurrent login requests', async () => {
      const concurrentRequests = 100;
      const startTime = Date.now();
      const results: any[] = [];

      // Create concurrent login requests
      const loginPromises = Array.from({ length: concurrentRequests }, (_, i) => 
        request(app)
          .post('/api/auth/login')
          .send({
            username: `testuser${i % 10}`, // Use existing test users
            password: 'TestPassword123!'
          })
          .then(response => ({
            status: response.status,
            time: Date.now() - startTime,
            success: response.status === 200
          }))
          .catch(error => ({
            status: error.status || 500,
            time: Date.now() - startTime,
            success: false,
            error: error.message
          }))
      );

      // Wait for all requests to complete
      const responses = await Promise.all(loginPromises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Calculate metrics
      const successfulRequests = responses.filter(r => r.success).length;
      const failedRequests = responses.filter(r => !r.success).length;
      const successRate = (successfulRequests / concurrentRequests) * 100;
      const averageResponseTime = responses.reduce((sum, r) => sum + r.time, 0) / responses.length;
      const requestsPerSecond = (concurrentRequests / totalTime) * 1000;

      // Performance assertions
      expect(successRate).toBeGreaterThan(95); // At least 95% success rate
      expect(averageResponseTime).toBeLessThan(2000); // Average response time under 2 seconds
      expect(requestsPerSecond).toBeGreaterThan(10); // At least 10 requests per second
      expect(failedRequests).toBeLessThan(10); // Less than 10 failed requests

      logger.info('Concurrent Login Performance Results:');
      logger.info(`Total Requests: ${concurrentRequests}`);
      logger.info(`Successful: ${successfulRequests}`);
      logger.info(`Failed: ${failedRequests}`);
      logger.info(`Success Rate: ${successRate.toFixed(2)}%`);
      logger.info(`Average Response Time: ${averageResponseTime.toFixed(2)}ms`);
      logger.info(`Requests per Second: ${requestsPerSecond.toFixed(2)}`);
      logger.info(`Total Time: ${totalTime}ms`);
    }, 30000); // 30 second timeout

    it('should handle 100 concurrent requests with mixed operations', async () => {
      const concurrentRequests = 100;
      const startTime = Date.now();
      const results: any[] = [];

      // Create mixed concurrent requests (login, profile, logout)
      const requestPromises = Array.from({ length: concurrentRequests }, (_, i) => {
        const operation = i % 3; // 0: login, 1: profile, 2: logout
        const userIndex = i % 10;

        switch (operation) {
          case 0: // Login
            return request(app)
              .post('/api/auth/login')
              .send({
                username: `testuser${userIndex}`,
                password: 'TestPassword123!'
              })
              .then(response => ({
                operation: 'login',
                status: response.status,
                time: Date.now() - startTime,
                success: response.status === 200
              }));

          case 1: // Get profile
            return request(app)
              .get('/api/auth/me')
              .set('Authorization', `Bearer ${authTokens[userIndex]}`)
              .then(response => ({
                operation: 'profile',
                status: response.status,
                time: Date.now() - startTime,
                success: response.status === 200
              }));

          case 2: // Logout
            return request(app)
              .post('/api/auth/logout')
              .set('Authorization', `Bearer ${authTokens[userIndex]}`)
              .then(response => ({
                operation: 'logout',
                status: response.status,
                time: Date.now() - startTime,
                success: response.status === 200
              }));

          default:
            return Promise.resolve({
              operation: 'unknown',
              status: 400,
              time: Date.now() - startTime,
              success: false
            });
        }
      });

      // Wait for all requests to complete
      const responses = await Promise.all(requestPromises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Calculate metrics by operation
      const loginRequests = responses.filter(r => r.operation === 'login');
      const profileRequests = responses.filter(r => r.operation === 'profile');
      const logoutRequests = responses.filter(r => r.operation === 'logout');

      const loginSuccessRate = (loginRequests.filter(r => r.success).length / loginRequests.length) * 100;
      const profileSuccessRate = (profileRequests.filter(r => r.success).length / profileRequests.length) * 100;
      const logoutSuccessRate = (logoutRequests.filter(r => r.success).length / logoutRequests.length) * 100;

      const overallSuccessRate = (responses.filter(r => r.success).length / concurrentRequests) * 100;
      const averageResponseTime = responses.reduce((sum, r) => sum + r.time, 0) / responses.length;
      const requestsPerSecond = (concurrentRequests / totalTime) * 1000;

      // Performance assertions
      expect(overallSuccessRate).toBeGreaterThan(90); // At least 90% overall success rate
      expect(loginSuccessRate).toBeGreaterThan(95); // Login should be very reliable
      expect(profileSuccessRate).toBeGreaterThan(95); // Profile should be very reliable
      expect(logoutSuccessRate).toBeGreaterThan(95); // Logout should be very reliable
      expect(averageResponseTime).toBeLessThan(3000); // Average response time under 3 seconds
      expect(requestsPerSecond).toBeGreaterThan(8); // At least 8 requests per second

      logger.info('Mixed Operations Performance Results:');
      logger.info(`Total Requests: ${concurrentRequests}`);
      logger.info(`Login Success Rate: ${loginSuccessRate.toFixed(2)}%`);
      logger.info(`Profile Success Rate: ${profileSuccessRate.toFixed(2)}%`);
      logger.info(`Logout Success Rate: ${logoutSuccessRate.toFixed(2)}%`);
      logger.info(`Overall Success Rate: ${overallSuccessRate.toFixed(2)}%`);
      logger.info(`Average Response Time: ${averageResponseTime.toFixed(2)}ms`);
      logger.info(`Requests per Second: ${requestsPerSecond.toFixed(2)}`);
      logger.info(`Total Time: ${totalTime}ms`);
    }, 30000); // 30 second timeout
  });

  describe('Database Performance Under Load', () => {
    it('should handle concurrent database operations efficiently', async () => {
      const concurrentRequests = 50;
      const startTime = Date.now();

      // Create concurrent database read operations
      const dbPromises = Array.from({ length: concurrentRequests }, (_, i) => 
        request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${authTokens[i % 10]}`)
          .then(response => ({
            status: response.status,
            time: Date.now() - startTime,
            success: response.status === 200
          }))
          .catch(error => ({
            status: error.status || 500,
            time: Date.now() - startTime,
            success: false,
            error: error.message
          }))
      );

      // Wait for all requests to complete
      const responses = await Promise.all(dbPromises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Calculate database performance metrics
      const successfulRequests = responses.filter(r => r.success).length;
      const successRate = (successfulRequests / concurrentRequests) * 100;
      const averageResponseTime = responses.reduce((sum, r) => sum + r.time, 0) / responses.length;
      const requestsPerSecond = (concurrentRequests / totalTime) * 1000;

      // Database performance assertions
      expect(successRate).toBeGreaterThan(98); // Very high success rate for reads
      expect(averageResponseTime).toBeLessThan(1000); // Fast database reads
      expect(requestsPerSecond).toBeGreaterThan(20); // High throughput for reads

      logger.info('Database Performance Results:');
      logger.info(`Concurrent Database Reads: ${concurrentRequests}`);
      logger.info(`Success Rate: ${successRate.toFixed(2)}%`);
      logger.info(`Average Response Time: ${averageResponseTime.toFixed(2)}ms`);
      logger.info(`Requests per Second: ${requestsPerSecond.toFixed(2)}`);
      logger.info(`Total Time: ${totalTime}ms`);
    }, 15000); // 15 second timeout
  });

  describe('Memory and Resource Usage', () => {
    it('should maintain stable memory usage under load', async () => {
      const initialMemory = process.memoryUsage();
      const concurrentRequests = 100;
      const startTime = Date.now();

      // Create concurrent requests
      const requestPromises = Array.from({ length: concurrentRequests }, (_, i) => 
        request(app)
          .post('/api/auth/login')
          .send({
            username: `testuser${i % 10}`,
            password: 'TestPassword123!'
          })
          .then(response => ({
            status: response.status,
            success: response.status === 200
          }))
          .catch(error => ({
            status: error.status || 500,
            success: false
          }))
      );

      // Wait for all requests to complete
      await Promise.all(requestPromises);
      const endTime = Date.now();
      const finalMemory = process.memoryUsage();

      // Calculate memory usage changes
      const memoryIncrease = {
        heapUsed: finalMemory.heapUsed - initialMemory.heapUsed,
        heapTotal: finalMemory.heapTotal - initialMemory.heapTotal,
        external: finalMemory.external - initialMemory.external,
        rss: finalMemory.rss - initialMemory.rss
      };

      const totalTime = endTime - startTime;

      // Memory usage assertions
      expect(memoryIncrease.heapUsed).toBeLessThan(50 * 1024 * 1024); // Less than 50MB increase
      expect(memoryIncrease.rss).toBeLessThan(100 * 1024 * 1024); // Less than 100MB RSS increase
      expect(totalTime).toBeLessThan(30000); // Should complete within 30 seconds

      logger.info('Memory Usage Results:');
      logger.info(`Initial Heap Used: ${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`);
      logger.info(`Final Heap Used: ${(finalMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`);
      logger.info(`Heap Increase: ${(memoryIncrease.heapUsed / 1024 / 1024).toFixed(2)}MB`);
      logger.info(`RSS Increase: ${(memoryIncrease.rss / 1024 / 1024).toFixed(2)}MB`);
      logger.info(`Total Time: ${totalTime}ms`);
    }, 30000); // 30 second timeout
  });

  describe('Error Handling Under Load', () => {
    it('should handle errors gracefully under concurrent load', async () => {
      const concurrentRequests = 100;
      const startTime = Date.now();

      // Create concurrent requests with some invalid data
      const requestPromises = Array.from({ length: concurrentRequests }, (_, i) => {
        // Mix valid and invalid requests
        if (i % 5 === 0) {
          // Invalid request
          return request(app)
            .post('/api/auth/login')
            .send({
              username: 'nonexistent',
              password: 'wrongpassword'
            })
            .then(response => ({
              type: 'invalid',
              status: response.status,
              time: Date.now() - startTime,
              expected: response.status === 401
            }));
        } else {
          // Valid request
          return request(app)
            .post('/api/auth/login')
            .send({
              username: `testuser${i % 10}`,
              password: 'TestPassword123!'
            })
            .then(response => ({
              type: 'valid',
              status: response.status,
              time: Date.now() - startTime,
              expected: response.status === 200
            }));
        }
      });

      // Wait for all requests to complete
      const responses = await Promise.all(requestPromises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Calculate error handling metrics
      const validRequests = responses.filter(r => r.type === 'valid');
      const invalidRequests = responses.filter(r => r.type === 'invalid');
      
      const validSuccessRate = (validRequests.filter(r => r.expected).length / validRequests.length) * 100;
      const invalidErrorRate = (invalidRequests.filter(r => r.expected).length / invalidRequests.length) * 100;
      const overallSuccessRate = (responses.filter(r => r.expected).length / concurrentRequests) * 100;

      // Error handling assertions
      expect(validSuccessRate).toBeGreaterThan(95); // Valid requests should succeed
      expect(invalidErrorRate).toBeGreaterThan(95); // Invalid requests should fail properly
      expect(overallSuccessRate).toBeGreaterThan(75); // Overall system should handle errors well
      expect(totalTime).toBeLessThan(30000); // Should complete within 30 seconds

      logger.info('Error Handling Results:');
      logger.info(`Valid Requests Success Rate: ${validSuccessRate.toFixed(2)}%`);
      logger.info(`Invalid Requests Error Rate: ${invalidErrorRate.toFixed(2)}%`);
      logger.info(`Overall Success Rate: ${overallSuccessRate.toFixed(2)}%`);
      logger.info(`Total Time: ${totalTime}ms`);
    }, 30000); // 30 second timeout
  });

  describe('Load Testing Scenarios', () => {
    it('should handle burst traffic patterns', async () => {
      const burstSize = 50;
      const burstCount = 3;
      const results: any[] = [];

      for (let burst = 0; burst < burstCount; burst++) {
        const startTime = Date.now();
        
        // Create burst of requests
        const burstPromises = Array.from({ length: burstSize }, (_, i) => 
          request(app)
            .post('/api/auth/login')
            .send({
              username: `testuser${i % 10}`,
              password: 'TestPassword123!'
            })
            .then(response => ({
              burst,
              status: response.status,
              time: Date.now() - startTime,
              success: response.status === 200
            }))
            .catch(error => ({
              burst,
              status: error.status || 500,
              time: Date.now() - startTime,
              success: false
            }))
        );

        const burstResponses = await Promise.all(burstPromises);
        results.push(...burstResponses);

        // Small delay between bursts
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Calculate burst performance metrics
      const totalRequests = burstSize * burstCount;
      const successfulRequests = results.filter(r => r.success).length;
      const successRate = (successfulRequests / totalRequests) * 100;
      const averageResponseTime = results.reduce((sum, r) => sum + r.time, 0) / results.length;

      // Burst traffic assertions
      expect(successRate).toBeGreaterThan(90); // High success rate under burst load
      expect(averageResponseTime).toBeLessThan(2000); // Reasonable response time
      expect(results.length).toBe(totalRequests); // All requests should complete

      logger.info('Burst Traffic Results:');
      logger.info(`Total Bursts: ${burstCount}`);
      logger.info(`Burst Size: ${burstSize}`);
      logger.info(`Total Requests: ${totalRequests}`);
      logger.info(`Success Rate: ${successRate.toFixed(2)}%`);
      logger.info(`Average Response Time: ${averageResponseTime.toFixed(2)}ms`);
    }, 45000); // 45 second timeout

    it('should handle sustained load over time', async () => {
      const requestsPerSecond = 10;
      const durationSeconds = 10;
      const totalRequests = requestsPerSecond * durationSeconds;
      const results: any[] = [];
      const startTime = Date.now();

      // Create sustained load
      for (let i = 0; i < totalRequests; i++) {
        const requestPromise = request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${authTokens[i % 10]}`)
          .then(response => ({
            status: response.status,
            time: Date.now() - startTime,
            success: response.status === 200
          }))
          .catch(error => ({
            status: error.status || 500,
            time: Date.now() - startTime,
            success: false
          }));

        results.push(requestPromise);

        // Wait to maintain rate
        if (i < totalRequests - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 / requestsPerSecond));
        }
      }

      // Wait for all requests to complete
      const responses = await Promise.all(results);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Calculate sustained load metrics
      const successfulRequests = responses.filter(r => r.success).length;
      const successRate = (successfulRequests / totalRequests) * 100;
      const averageResponseTime = responses.reduce((sum, r) => sum + r.time, 0) / responses.length;
      const actualRequestsPerSecond = (totalRequests / totalTime) * 1000;

      // Sustained load assertions
      expect(successRate).toBeGreaterThan(95); // Very high success rate
      expect(averageResponseTime).toBeLessThan(1000); // Fast response times
      expect(actualRequestsPerSecond).toBeGreaterThan(8); // Maintain reasonable throughput

      logger.info('Sustained Load Results:');
      logger.info(`Duration: ${durationSeconds} seconds`);
      logger.info(`Target Rate: ${requestsPerSecond} req/s`);
      logger.info(`Actual Rate: ${actualRequestsPerSecond.toFixed(2)} req/s`);
      logger.info(`Total Requests: ${totalRequests}`);
      logger.info(`Success Rate: ${successRate.toFixed(2)}%`);
      logger.info(`Average Response Time: ${averageResponseTime.toFixed(2)}ms`);
    }, 60000); // 60 second timeout
  });
}); 