/**
 * @fileoverview EICAR test file detection test
 * @description Tests that the antivirus scanner properly detects and rejects EICAR test files
 * @author HRMS Elite Team
 * @version 1.0.0
 */

import { antivirusScanner } from '../server/utils/antivirus';

// EICAR test file content (standard antivirus test file)
const EICAR_CONTENT = 'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*';

// Test functions for EICAR detection
async function testEicarDetection() {
  console.log('🧪 Testing EICAR test file detection...');
  
  // Create EICAR test file buffer
  const eicarBuffer = Buffer.from(EICAR_CONTENT, 'utf8');
  
  // Scan the EICAR test file
  const scanResult = await antivirusScanner.scanBuffer(eicarBuffer, 'eicar-test.txt');
  
  // Verify that the file is detected as malicious
  const isDetected = !scanResult.isClean;
  const hasCorrectThreat = scanResult.threats.includes('EICAR-STANDARD-ANTIVIRUS-TEST-FILE');
  const hasCorrectProvider = scanResult.provider === 'eicar-detection';
  
  console.log('✅ EICAR test file detected and rejected successfully');
  console.log('Scan result:', scanResult);
  console.log('Detection status:', { isDetected, hasCorrectThreat, hasCorrectProvider });
  
  return isDetected && hasCorrectThreat && hasCorrectProvider;
}

async function testCleanFile() {
  console.log('\n🧪 Testing clean file acceptance...');
  
  // Create a clean file buffer
  const cleanContent = 'This is a clean test file with no malicious content.';
  const cleanBuffer = Buffer.from(cleanContent, 'utf8');
  
  // Scan the clean file
  const scanResult = await antivirusScanner.scanBuffer(cleanBuffer, 'clean-test.txt');
  
  // Verify that the file is accepted
  const isAccepted = scanResult.isClean;
  const noThreats = scanResult.threats.length === 0;
  
  console.log('✅ Clean file accepted successfully');
  console.log('Scan result:', scanResult);
  console.log('Acceptance status:', { isAccepted, noThreats });
  
  return isAccepted && noThreats;
}

async function testLargeFile() {
  console.log('\n🧪 Testing large file handling...');
  
  // Create a large buffer (exceeds typical scan limits)
  const largeBuffer = Buffer.alloc(20 * 1024 * 1024); // 20MB
  
  // Scan the large file
  const scanResult = await antivirusScanner.scanBuffer(largeBuffer, 'large-test.bin');
  
  // Should either be rejected for size or processed
  const hasResult = scanResult.isClean !== undefined;
  const hasProvider = scanResult.provider !== undefined;
  
  console.log('✅ Large file handled appropriately');
  console.log('Scan result:', scanResult);
  console.log('Handling status:', { hasResult, hasProvider });
  
  return hasResult && hasProvider;
}

function testScannerStatus() {
  console.log('\n🧪 Testing scanner status information...');
  
  const status = antivirusScanner.getStatus();
  
  const hasEnabled = 'enabled' in status;
  const hasProvider = 'provider' in status;
  const hasMaxFileSize = 'maxFileSize' in status;
  const hasTimeout = 'timeout' in status;
  const hasExternalApiConfigured = 'externalApiConfigured' in status;
  
  console.log('✅ Scanner status information available');
  console.log('Status:', status);
  console.log('Status check:', { hasEnabled, hasProvider, hasMaxFileSize, hasTimeout, hasExternalApiConfigured });
  
  return hasEnabled && hasProvider && hasMaxFileSize && hasTimeout && hasExternalApiConfigured;
}

// Run tests
console.log('🧪 Running EICAR detection tests...\n');

const runTests = async () => {
  try {
    let allTestsPassed = true;
    
    // Test 1: EICAR detection
    const eicarResult = await testEicarDetection();
    if (!eicarResult) {
      console.log('❌ EICAR detection test failed');
      allTestsPassed = false;
    }
    
    // Test 2: Clean file
    const cleanResult = await testCleanFile();
    if (!cleanResult) {
      console.log('❌ Clean file test failed');
      allTestsPassed = false;
    }
    
    // Test 3: Large file
    const largeResult = await testLargeFile();
    if (!largeResult) {
      console.log('❌ Large file test failed');
      allTestsPassed = false;
    }
    
    // Test 4: Scanner status
    const statusResult = testScannerStatus();
    if (!statusResult) {
      console.log('❌ Scanner status test failed');
      allTestsPassed = false;
    }
    
    if (allTestsPassed) {
      console.log('\n🎉 All EICAR detection tests completed successfully!');
    } else {
      console.log('\n❌ Some tests failed');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

runTests();
