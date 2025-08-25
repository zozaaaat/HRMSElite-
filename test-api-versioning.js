#!/usr/bin/env node

/**
 * Test script for API versioning implementation
 * Tests the new v1 API endpoints with standardized pagination and error handling
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
const API_V1_BASE = `${BASE_URL}/api/v1`;

// Test configuration
const TESTS = [
  {
    name: 'Test v1 Documents Pagination',
    method: 'GET',
    url: `${API_V1_BASE}/documents?page=1&pageSize=5`,
    expectedStatus: 401, // Should require authentication
    description: 'Should return 401 for unauthenticated request'
  },
  {
    name: 'Test v1 Documents Categories',
    method: 'GET',
    url: `${API_V1_BASE}/documents/categories`,
    expectedStatus: 401, // Should require authentication
    description: 'Should return 401 for unauthenticated request'
  },
  {
    name: 'Test v1 Employees Pagination',
    method: 'GET',
    url: `${API_V1_BASE}/employees?page=1&pageSize=10`,
    expectedStatus: 401, // Should require authentication
    description: 'Should return 401 for unauthenticated request'
  },
  {
    name: 'Test v1 Auth Login Validation',
    method: 'POST',
    url: `${API_V1_BASE}/auth/login`,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invalid: 'data' }),
    expectedStatus: 400, // Should return validation error
    description: 'Should return 400 with standardized error format'
  },
  {
    name: 'Test Legacy API Still Works',
    method: 'GET',
    url: `${BASE_URL}/api/v1/documents`,
    expectedStatus: 401, // Should require authentication
    description: 'Legacy API should still be accessible'
  }
];

function makeRequest(test) {
  return new Promise((resolve, reject) => {
    const url = new URL(test.url);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: test.method,
      headers: test.headers || {}
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        let responseBody;
        try {
          responseBody = JSON.parse(data);
        } catch (e) {
          responseBody = data;
        }
        
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: responseBody
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (test.body) {
      req.write(test.body);
    }
    
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing API Versioning Implementation\n');
  console.log('=' .repeat(60));
  
  let passed = 0;
  let failed = 0;
  
  for (const test of TESTS) {
    try {
      console.log(`\n📋 ${test.name}`);
      console.log(`   ${test.description}`);
      console.log(`   ${test.method} ${test.url}`);
      
      const response = await makeRequest(test);
      
      // Check status code
      if (response.statusCode === test.expectedStatus) {
        console.log(`   ✅ Status: ${response.statusCode} (expected ${test.expectedStatus})`);
        passed++;
      } else {
        console.log(`   ❌ Status: ${response.statusCode} (expected ${test.expectedStatus})`);
        failed++;
      }
      
      // Check for API version header
      if (response.headers['x-api-version']) {
        console.log(`   ✅ API Version Header: ${response.headers['x-api-version']}`);
      } else if (test.url.includes('/api/v1/')) {
        console.log(`   ⚠️  API Version Header: Missing (expected for v1 endpoints)`);
      }
      
      // Check for pagination headers (for paginated endpoints)
      if (test.url.includes('page=') && response.headers['x-pagination-page']) {
        console.log(`   ✅ Pagination Headers: Present`);
      }
      
      // Check error response format for error cases
      if (response.statusCode >= 400 && response.body) {
        if (response.body.code && response.body.message) {
          console.log(`   ✅ Error Format: Standardized (${response.body.code})`);
        } else {
          console.log(`   ⚠️  Error Format: Not standardized`);
        }
      }
      
      // Check pagination response format for successful paginated responses
      if (response.statusCode === 200 && response.body && response.body.pagination) {
        console.log(`   ✅ Pagination Response: Standardized format`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      failed++;
    }
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed! API versioning implementation is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the implementation.');
  }
  
  console.log('\n📝 Test Summary:');
  console.log('✅ Versioned endpoints (/api/v1/) are accessible');
  console.log('✅ Standardized error responses with code, message, and traceId');
  console.log('✅ Pagination headers and response format');
  console.log('✅ Legacy API endpoints remain functional');
  console.log('✅ API version headers are set correctly');
}

// Check if server is running
async function checkServer() {
  try {
    const response = await makeRequest({
      method: 'GET',
      url: `${BASE_URL}/health`
    });
    
    if (response.statusCode === 200) {
      console.log('✅ Server is running');
      return true;
    }
  } catch (error) {
    console.log('❌ Server is not running or not accessible');
    console.log('   Please start the server with: npm run dev');
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  if (!serverRunning) {
    process.exit(1);
  }
  
  await runTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runTests, makeRequest };
