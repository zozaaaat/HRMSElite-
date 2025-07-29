
/**
 * اختبار شامل للنسخة المستقلة
 * Comprehensive test for standalone version
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';

// Test configurations
const tests = [
  { name: 'Health Check', path: '/health', method: 'GET' },
  { name: 'System Test', path: '/api/test', method: 'GET' },
  { name: 'Companies API', path: '/api/companies', method: 'GET' },
  { name: 'Employees API', path: '/api/employees', method: 'GET' },
  { name: 'Documents API', path: '/api/documents', method: 'GET' },
  { name: 'Licenses API', path: '/api/licenses', method: 'GET' },
  { name: 'Dashboard Stats', path: '/api/dashboard/stats', method: 'GET' },
  { name: 'Company Details', path: '/api/companies/1', method: 'GET' },
  { name: 'Company Employees', path: '/api/companies/1/employees', method: 'GET' },
  { name: 'Employee Details', path: '/api/employees/1', method: 'GET' },
];

const loginTest = {
  name: 'Login Test',
  path: '/api/auth/login',
  method: 'POST',
  data: JSON.stringify({
    username: 'admin',
    password: 'admin123'
  })
};

function makeRequest(test) {
  return new Promise((resolve, reject) => {
    const url = new URL(test.path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: test.method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            test: test.name,
            status: res.statusCode,
            success: res.statusCode >= 200 && res.statusCode < 300,
            data: parsed,
            response: data.substring(0, 200) + (data.length > 200 ? '...' : '')
          });
        } catch (e) {
          resolve({
            test: test.name,
            status: res.statusCode,
            success: res.statusCode >= 200 && res.statusCode < 300,
            data: null,
            response: data.substring(0, 200) + (data.length > 200 ? '...' : ''),
            parseError: e.message
          });
        }
      });
    });

    req.on('error', (err) => {
      reject({
        test: test.name,
        error: err.message,
        success: false
      });
    });

    if (test.data) {
      req.write(test.data);
    }

    req.end();
  });
}

async function runTests() {
  console.log('\n🧪 بدء الاختبار الشامل للنسخة المستقلة...\n');
  console.log('═'.repeat(60));

  const results = [];
  let passed = 0;
  let failed = 0;

  // Test all GET endpoints
  for (const test of tests) {
    try {
      const result = await makeRequest(test);
      results.push(result);
      
      if (result.success) {
        console.log(`✅ ${result.test}: نجح (${result.status})`);
        passed++;
      } else {
        console.log(`❌ ${result.test}: فشل (${result.status})`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${error.test}: خطأ - ${error.error}`);
      results.push(error);
      failed++;
    }
  }

  // Test login endpoint
  try {
    const loginResult = await makeRequest(loginTest);
    results.push(loginResult);
    
    if (loginResult.success && loginResult.data && loginResult.data.success) {
      console.log(`✅ ${loginResult.test}: نجح (${loginResult.status})`);
      console.log(`   المستخدم: ${loginResult.data.user.name}`);
      console.log(`   الدور: ${loginResult.data.user.role}`);
      passed++;
    } else {
      console.log(`❌ ${loginResult.test}: فشل (${loginResult.status})`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ ${error.test}: خطأ - ${error.error}`);
    results.push(error);
    failed++;
  }

  console.log('\n═'.repeat(60));
  console.log('📊 نتائج الاختبار:');
  console.log(`✅ نجح: ${passed}`);
  console.log(`❌ فشل: ${failed}`);
  console.log(`📈 نسبة النجاح: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log('\n🎉 جميع الاختبارات نجحت! النسخة المستقلة تعمل بشكل مثالي');
  } else {
    console.log('\n⚠️  بعض الاختبارات فشلت. يرجى التحقق من الأخطاء أعلاه');
  }

  console.log('\n📋 تفاصيل البيانات:');
  const statsResult = results.find(r => r.test === 'Dashboard Stats');
  if (statsResult && statsResult.data) {
    console.log(`   • الشركات: ${statsResult.data.totalCompanies}`);
    console.log(`   • الموظفين: ${statsResult.data.totalEmployees}`);
    console.log(`   • المستندات: ${statsResult.data.totalDocuments}`);
    console.log(`   • التراخيص: ${statsResult.data.totalLicenses}`);
  }

  console.log('\n🌐 للوصول للنظام: http://localhost:5000');
  console.log('═'.repeat(60));
}

// Check if server is running
http.get(BASE_URL + '/health', (res) => {
  if (res.statusCode === 200) {
    runTests();
  } else {
    console.log('❌ الخادم لا يعمل. يرجى تشغيل النسخة المستقلة أولاً:');
    console.log('   node ZeylabHRMS-Final.cjs');
  }
}).on('error', () => {
  console.log('❌ لا يمكن الوصول للخادم على http://localhost:5000');
  console.log('   يرجى تشغيل النسخة المستقلة أولاً:');
  console.log('   node ZeylabHRMS-Final.cjs');
});
