#!/usr/bin/env node

/**
 * Mobile and Desktop Setup Test Script
 * Tests the mobile and desktop implementations
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🔍 Testing Mobile and Desktop Setup...\n');

// Colors for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileExists(filePath, description) {
  const exists = fs.existsSync(filePath);
  if (exists) {
    log(`✅ ${description}`, 'green');
  } else {
    log(`❌ ${description} - File not found: ${filePath}`, 'red');
  }
  return exists;
}

function checkDirectoryExists(dirPath, description) {
  const exists = fs.existsSync(dirPath);
  if (exists) {
    log(`✅ ${description}`, 'green');
  } else {
    log(`❌ ${description} - Directory not found: ${dirPath}`, 'red');
  }
  return exists;
}

function checkPackageJson(packagePath, description) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    log(`✅ ${description}`, 'green');
    return packageJson;
  } catch (error) {
    log(`❌ ${description} - Invalid package.json: ${packagePath}`, 'red');
    return null;
  }
}

function checkDependencies(packageJson, requiredDeps, description) {
  if (!packageJson) return false;
  
  const missing = [];
  for (const dep of requiredDeps) {
    if (!packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]) {
      missing.push(dep);
    }
  }
  
  if (missing.length === 0) {
    log(`✅ ${description}`, 'green');
    return true;
  } else {
    log(`❌ ${description} - Missing dependencies: ${missing.join(', ')}`, 'red');
    return false;
  }
}

// Test results
const results = {
  mobile: { passed: 0, total: 0 },
  desktop: { passed: 0, total: 0 },
  pwa: { passed: 0, total: 0 }
};

// Test Mobile Setup
log('\n📱 Testing Mobile App Setup...', 'blue');

// Check mobile directory structure
results.mobile.total += 1;
if (checkDirectoryExists('hrms-mobile', 'Mobile app directory')) {
  results.mobile.passed += 1;
}

results.mobile.total += 1;
if (checkDirectoryExists('hrms-mobile/app', 'Mobile app pages directory')) {
  results.mobile.passed += 1;
}

results.mobile.total += 1;
if (checkDirectoryExists('hrms-mobile/components', 'Mobile components directory')) {
  results.mobile.passed += 1;
}

results.mobile.total += 1;
if (checkDirectoryExists('hrms-mobile/stores', 'Mobile state management directory')) {
  results.mobile.passed += 1;
}

// Check mobile package.json
results.mobile.total += 1;
const mobilePackage = checkPackageJson('hrms-mobile/package.json', 'Mobile package.json');
if (mobilePackage) {
  results.mobile.passed += 1;
}

// Check mobile dependencies
if (mobilePackage) {
  results.mobile.total += 1;
  const mobileDeps = ['expo', 'react-native', 'expo-router', 'zustand', 'axios'];
  if (checkDependencies(mobilePackage, mobileDeps, 'Mobile dependencies')) {
    results.mobile.passed += 1;
  }
}

// Check mobile app.json
results.mobile.total += 1;
if (checkFileExists('hrms-mobile/app.json', 'Mobile app.json configuration')) {
  results.mobile.passed += 1;
}

// Check mobile screens
const mobileScreens = [
  'hrms-mobile/app/(tabs)/index.tsx',
  'hrms-mobile/app/(tabs)/employees.tsx',
  'hrms-mobile/app/(tabs)/attendance.tsx',
  'hrms-mobile/app/(tabs)/documents.tsx',
  'hrms-mobile/app/(tabs)/profile.tsx',
  'hrms-mobile/app/(tabs)/explore.tsx',
  'hrms-mobile/app/login.tsx'
];

mobileScreens.forEach(screen => {
  results.mobile.total += 1;
  if (checkFileExists(screen, `Mobile screen: ${path.basename(screen)}`)) {
    results.mobile.passed += 1;
  }
});

// Test Desktop Setup
log('\n🖥️ Testing Desktop App Setup...', 'blue');

// Check electron directory structure
results.desktop.total += 1;
if (checkDirectoryExists('electron', 'Desktop app directory')) {
  results.desktop.passed += 1;
}

// Check desktop main files
results.desktop.total += 1;
if (checkFileExists('electron/main.ts', 'Desktop main process')) {
  results.desktop.passed += 1;
}

results.desktop.total += 1;
if (checkFileExists('electron/preload.ts', 'Desktop preload script')) {
  results.desktop.passed += 1;
}

// Check desktop package.json
results.desktop.total += 1;
const desktopPackage = checkPackageJson('electron/package.json', 'Desktop package.json');
if (desktopPackage) {
  results.desktop.passed += 1;
}

// Check desktop dependencies
if (desktopPackage) {
  results.desktop.total += 1;
  const desktopDeps = ['electron', 'electron-builder', 'typescript'];
  if (checkDependencies(desktopPackage, desktopDeps, 'Desktop dependencies')) {
    results.desktop.passed += 1;
  }
}

// Check desktop build configuration
results.desktop.total += 1;
if (checkFileExists('electron/tsconfig.json', 'Desktop TypeScript config')) {
  results.desktop.passed += 1;
}

// Test PWA Setup
log('\n🌐 Testing PWA Setup...', 'blue');

// Check PWA manifest
results.pwa.total += 1;
if (checkFileExists('public/manifest.json', 'PWA manifest')) {
  results.pwa.passed += 1;
}

// Check service worker
results.pwa.total += 1;
if (checkFileExists('public/sw.js', 'PWA service worker')) {
  results.pwa.passed += 1;
}

// Check PWA icons
const pwaIcons = [
  'public/icon-72x72.png',
  'public/icon-96x96.png',
  'public/icon-128x128.png',
  'public/icon-144x144.png',
  'public/icon-152x152.png',
  'public/icon-192x192.png',
  'public/icon-384x384.png',
  'public/icon-512x512.png'
];

pwaIcons.forEach(icon => {
  results.pwa.total += 1;
  if (checkFileExists(icon, `PWA icon: ${path.basename(icon)}`)) {
    results.pwa.passed += 1;
  }
});

// Check PWA configuration in client
results.pwa.total += 1;
if (checkFileExists('client/vite.config.ts', 'Client Vite config')) {
  results.pwa.passed += 1;
}

// Summary
log('\n📊 Test Results Summary:', 'bold');

const mobilePercentage = Math.round((results.mobile.passed / results.mobile.total) * 100);
const desktopPercentage = Math.round((results.desktop.passed / results.desktop.total) * 100);
const pwaPercentage = Math.round((results.pwa.passed / results.pwa.total) * 100);

log(`📱 Mobile App: ${results.mobile.passed}/${results.mobile.total} (${mobilePercentage}%)`, mobilePercentage >= 80 ? 'green' : 'yellow');
log(`🖥️ Desktop App: ${results.desktop.passed}/${results.desktop.total} (${desktopPercentage}%)`, desktopPercentage >= 80 ? 'green' : 'yellow');
log(`🌐 PWA: ${results.pwa.passed}/${results.pwa.total} (${pwaPercentage}%)`, pwaPercentage >= 80 ? 'green' : 'yellow');

const totalPassed = results.mobile.passed + results.desktop.passed + results.pwa.passed;
const totalTests = results.mobile.total + results.desktop.total + results.pwa.total;
const overallPercentage = Math.round((totalPassed / totalTests) * 100);

log(`\n🎯 Overall: ${totalPassed}/${totalTests} (${overallPercentage}%)`, overallPercentage >= 80 ? 'green' : 'yellow');

if (overallPercentage >= 80) {
  log('\n🎉 Mobile and Desktop setup is ready!', 'green');
  log('You can now run the development commands:', 'blue');
  log('  • Mobile: cd hrms-mobile && npm start', 'blue');
  log('  • Desktop: cd electron && npm run dev', 'blue');
  log('  • PWA: npm run dev:client', 'blue');
} else {
  log('\n⚠️  Some setup issues detected. Please check the failed tests above.', 'yellow');
}

// Additional recommendations
log('\n💡 Recommendations:', 'blue');
log('1. Install dependencies: npm install', 'blue');
log('2. Set up development environment', 'blue');
log('3. Test on real devices', 'blue');
log('4. Configure build settings', 'blue');

console.log('\n');
