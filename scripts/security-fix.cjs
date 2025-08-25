#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command, description) {
  try {
    console.log(`🔧 ${description}...`);
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`✅ ${description} completed successfully`);
    return { success: true, output };
  } catch (error) {
    console.log(`❌ ${description} failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

function updatePackageJson() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Update vulnerable packages
  const updates = {
    'csrf': '^3.1.0',
    'drizzle-kit': '^0.31.4',
    'ink-docstrap': '^1.3.2'
  };

  let updated = false;
  Object.entries(updates).forEach(([packageName, version]) => {
    if (packageJson.devDependencies && packageJson.devDependencies[packageName]) {
      packageJson.devDependencies[packageName] = version;
      updated = true;
    }
    if (packageJson.dependencies && packageJson.dependencies[packageName]) {
      packageJson.dependencies[packageName] = version;
      updated = true;
    }
  });

  if (updated) {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Updated package.json with security fixes');
    return true;
  }
  return false;
}

function createSecurityConfig() {
  const securityConfig = {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'strict-dynamic'; style-src 'self'; img-src 'self' data: https:; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self';",
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.'
    },
    csrf: {
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      }
    }
  };

  const configPath = path.join(process.cwd(), 'security-config.json');
  fs.writeFileSync(configPath, JSON.stringify(securityConfig, null, 2));
  console.log('✅ Created security configuration file');
}

function main() {
  console.log('🔒 Starting security fixes...\n');

  // Step 1: Update vulnerable packages
  const packageUpdated = updatePackageJson();

  // Step 2: Run npm audit fix
  runCommand('npm audit fix', 'Running npm audit fix');

  // Step 3: Install updated packages if package.json was updated
  if (packageUpdated) {
    runCommand('npm install', 'Installing updated packages');
  }

  // Step 4: Create security configuration
  createSecurityConfig();

  // Step 5: Final audit check
  const finalAudit = runCommand('npm audit', 'Final security audit');

  console.log('\n🎉 Security fixes completed!');
  console.log('\n📋 Recommendations:');
  console.log('1. Review the security-config.json file');
  console.log('2. Ensure CSRF protection uses a maintained library such as csrf');
  console.log('3. Remove unused or deprecated dependencies');
  console.log('4. Regularly run npm audit to check for new vulnerabilities');
  console.log('5. Consider using npm audit --audit-level=moderate for stricter checks');
}

if (require.main === module) {
  main();
}

module.exports = { updatePackageJson, createSecurityConfig };
