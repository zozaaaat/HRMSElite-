/* eslint-env node */

// Simple test script to verify rate limiting functionality
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function testRateLimiting() {
  console.info('🧪 Testing Rate Limiting Implementation...\n');

  try {
    // Test 1: Make multiple requests to trigger rate limiting
    console.info('📊 Making multiple API requests to test rate limiting...');
    
    const requests = [];
    for (let i = 0; i < 105; i++) {
      requests.push(
        axios.get(`${BASE_URL}/api/health`, {
          timeout: 5000,
          validateStatus: () => true // Don't throw on any status code
        }).catch(err => ({ status: err.response?.status || 500, data: err.response?.data || err.message }))
      );
    }

    const responses = await Promise.all(requests);
    
    // Count different status codes
    const statusCounts = {};
    responses.forEach(response => {
      const status = response.status || response.statusCode || 500;
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    console.info('📈 Response Status Distribution:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.info(`  ${status}: ${count} requests`);
    });

    // Check for rate limiting headers
    const successfulResponses = responses.filter(r => r.status === 200);
    if (successfulResponses.length > 0) {
      const headers = successfulResponses[0].headers;
      console.info('\n📋 Rate Limiting Headers:');
      console.info(`  X-RateLimit-Limit: ${headers['x-ratelimit-limit'] || 'Not found'}`);
      console.info(`  X-RateLimit-Remaining: ${headers['x-ratelimit-remaining'] || 'Not found'}`);
      console.info(`  X-RateLimit-Reset: ${headers['x-ratelimit-reset'] || 'Not found'}`);
    }

    // Check for 429 responses (rate limit exceeded)
    const rateLimitedResponses = responses.filter(r => r.status === 429);
    if (rateLimitedResponses.length > 0) {
      console.info('\n🚫 Rate Limiting Working:');
      console.info(`  ${rateLimitedResponses.length} requests were rate limited (429 status)`);
      
      const errorResponse = rateLimitedResponses[0].data;
      console.info('  Error Response:', JSON.stringify(errorResponse, null, 2));
    } else {
      console.info('\n⚠️  No rate limiting detected - this might be expected in development mode');
    }

    console.info('\n✅ Rate limiting test completed!');

  } catch (error) {
    console.error('❌ Error testing rate limiting:', error.message);
  }
}

// Run the test
testRateLimiting(); 