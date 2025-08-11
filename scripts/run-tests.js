#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Helper function to log with colors
function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Helper function to run command and return promise
function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

// Helper function to check if file exists
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Helper function to get test configuration
function getTestConfig() {
  const config = {
    client: {
      testDir: 'client/tests',
      configFile: 'client/vitest.config.ts',
      coverageDir: 'client/coverage',
      timeout: 30000
    },
    server: {
      testDir: 'tests',
      configFile: 'tests/vitest.config.ts',
      coverageDir: 'tests/coverage',
      timeout: 30000
    },
    performance: {
      testDir: 'tests/performance',
      timeout: 60000
    }
  };

  return config;
}

// Function to run client tests
async function runClientTests(options = {}) {
  const config = getTestConfig();
  const { pattern, coverage = true, watch = false, ui = false } = options;

  log('🧪 Running Client Tests...', 'cyan');

  const args = [];
  
  if (pattern) {
    args.push(pattern);
  }

  if (coverage) {
    args.push('--coverage');
  }

  if (watch) {
    args.push('--watch');
  }

  if (ui) {
    args.push('--ui');
  }

  try {
    await runCommand('npm', ['run', 'test:client', ...args], {
      cwd: path.resolve(__dirname, '..')
    });
    log('✅ Client tests completed successfully!', 'green');
    return true;
  } catch (error) {
    log(`❌ Client tests failed: ${error.message}`, 'red');
    return false;
  }
}

// Function to run server tests
async function runServerTests(options = {}) {
  const config = getTestConfig();
  const { pattern, coverage = true, watch = false } = options;

  log('🔧 Running Server Tests...', 'cyan');

  const args = [];
  
  if (pattern) {
    args.push(pattern);
  }

  if (coverage) {
    args.push('--coverage');
  }

  if (watch) {
    args.push('--watch');
  }

  try {
    await runCommand('npm', ['run', 'test:server', ...args], {
      cwd: path.resolve(__dirname, '..')
    });
    log('✅ Server tests completed successfully!', 'green');
    return true;
  } catch (error) {
    log(`❌ Server tests failed: ${error.message}`, 'red');
    return false;
  }
}

// Function to run performance tests
async function runPerformanceTests(options = {}) {
  const config = getTestConfig();
  const { concurrent = 100, duration = 30 } = options;

  log('⚡ Running Performance Tests...', 'magenta');
  log(`📊 Testing with ${concurrent} concurrent requests for ${duration} seconds`, 'yellow');

  try {
    // Set environment variables for performance testing
    process.env.PERFORMANCE_CONCURRENT = concurrent.toString();
    process.env.PERFORMANCE_DURATION = duration.toString();

    await runCommand('npm', ['run', 'test:performance'], {
      cwd: path.resolve(__dirname, '..'),
      env: { ...process.env }
    });
    log('✅ Performance tests completed successfully!', 'green');
    return true;
  } catch (error) {
    log(`❌ Performance tests failed: ${error.message}`, 'red');
    return false;
  }
}

// Function to run all tests
async function runAllTests(options = {}) {
  const { coverage = true, watch = false, ui = false } = options;

  log('🚀 Running All Tests...', 'bright');

  const results = {
    client: false,
    server: false,
    performance: false
  };

  // Run client tests
  results.client = await runClientTests({ coverage, watch, ui });

  // Run server tests
  results.server = await runServerTests({ coverage, watch });

  // Run performance tests (only if other tests pass)
  if (results.client && results.server) {
    results.performance = await runPerformanceTests();
  }

  // Summary
  log('\n📋 Test Summary:', 'bright');
  log(`Client Tests: ${results.client ? '✅ PASSED' : '❌ FAILED'}`, results.client ? 'green' : 'red');
  log(`Server Tests: ${results.server ? '✅ PASSED' : '❌ FAILED'}`, results.server ? 'green' : 'red');
  log(`Performance Tests: ${results.performance ? '✅ PASSED' : '❌ FAILED'}`, results.performance ? 'green' : 'red');

  const allPassed = results.client && results.server && results.performance;
  
  if (allPassed) {
    log('\n🎉 All tests passed successfully!', 'green');
  } else {
    log('\n💥 Some tests failed. Please check the output above.', 'red');
    process.exit(1);
  }

  return allPassed;
}

// Function to generate test report
async function generateTestReport() {
  log('📊 Generating Test Report...', 'cyan');

  try {
    // Generate coverage reports
    await runCommand('npm', ['run', 'test:coverage'], {
      cwd: path.resolve(__dirname, '..')
    });

    // Generate performance report
    await runCommand('npm', ['run', 'test:performance:report'], {
      cwd: path.resolve(__dirname, '..')
    });

    log('✅ Test report generated successfully!', 'green');
    log('📁 Check the coverage and reports directories for detailed results.', 'yellow');
  } catch (error) {
    log(`❌ Failed to generate test report: ${error.message}`, 'red');
  }
}

// Function to clean test artifacts
async function cleanTestArtifacts() {
  log('🧹 Cleaning Test Artifacts...', 'cyan');

  const dirsToClean = [
    'client/coverage',
    'tests/coverage',
    'client/.vitest',
    'tests/.vitest',
    'node_modules/.cache'
  ];

  for (const dir of dirsToClean) {
    const fullPath = path.resolve(__dirname, '..', dir);
    if (fs.existsSync(fullPath)) {
      try {
        fs.rmSync(fullPath, { recursive: true, force: true });
        log(`✅ Cleaned: ${dir}`, 'green');
      } catch (error) {
        log(`⚠️  Could not clean ${dir}: ${error.message}`, 'yellow');
      }
    }
  }
}

// Function to show help
function showHelp() {
  log('\n🧪 HRMS Elite Test Runner', 'bright');
  log('========================\n', 'bright');
  
  log('Usage:', 'cyan');
  log('  node scripts/run-tests.js [command] [options]\n', 'white');
  
  log('Commands:', 'cyan');
  log('  all                    Run all tests (client, server, performance)', 'white');
  log('  client                 Run client tests only', 'white');
  log('  server                 Run server tests only', 'white');
  log('  performance            Run performance tests only', 'white');
  log('  report                 Generate test coverage and performance reports', 'white');
  log('  clean                  Clean test artifacts and cache', 'white');
  log('  help                   Show this help message\n', 'white');
  
  log('Options:', 'cyan');
  log('  --pattern <pattern>    Run tests matching pattern (e.g., "auth" or "*.test.ts")', 'white');
  log('  --no-coverage          Skip coverage generation', 'white');
  log('  --watch                Run tests in watch mode', 'white');
  log('  --ui                   Run tests with UI interface (client only)', 'white');
  log('  --concurrent <number>  Number of concurrent requests for performance tests (default: 100)', 'white');
  log('  --duration <seconds>   Duration for performance tests (default: 30)\n', 'white');
  
  log('Examples:', 'cyan');
  log('  node scripts/run-tests.js all', 'white');
  log('  node scripts/run-tests.js client --pattern "auth"', 'white');
  log('  node scripts/run-tests.js performance --concurrent 200 --duration 60', 'white');
  log('  node scripts/run-tests.js client --watch --ui', 'white');
  log('  node scripts/run-tests.js report', 'white');
  log('  node scripts/run-tests.js clean\n', 'white');
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  // Parse options
  const options = {
    pattern: null,
    coverage: true,
    watch: false,
    ui: false,
    concurrent: 100,
    duration: 30
  };

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--pattern':
        options.pattern = args[++i];
        break;
      case '--no-coverage':
        options.coverage = false;
        break;
      case '--watch':
        options.watch = true;
        break;
      case '--ui':
        options.ui = true;
        break;
      case '--concurrent':
        options.concurrent = parseInt(args[++i]);
        break;
      case '--duration':
        options.duration = parseInt(args[++i]);
        break;
    }
  }

  try {
    switch (command) {
      case 'all':
        await runAllTests(options);
        break;
      case 'client':
        await runClientTests(options);
        break;
      case 'server':
        await runServerTests(options);
        break;
      case 'performance':
        await runPerformanceTests(options);
        break;
      case 'report':
        await generateTestReport();
        break;
      case 'clean':
        await cleanTestArtifacts();
        break;
      case 'help':
      case '--help':
      case '-h':
        showHelp();
        break;
      default:
        log('❌ Unknown command. Use "help" to see available commands.', 'red');
        process.exit(1);
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  runClientTests,
  runServerTests,
  runPerformanceTests,
  runAllTests,
  generateTestReport,
  cleanTestArtifacts
}; 