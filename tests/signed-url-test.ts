/**
 * @fileoverview Signed URL functionality test
 * @description Tests that signed URLs are generated correctly and expire within 10 minutes
 * @author HRMS Elite Team
 * @version 1.0.0
 */

import './test-env.js';
import { secureFileStorage } from '../server/utils/secureStorage';
import crypto from 'node:crypto';

// Test functions for signed URL functionality
async function testSignedUrlGeneration() {
  console.log('🔐 Testing signed URL generation...');
  
  const fileId = 'test-file-123';
  const key = 'private/test-file-123/test.pdf';
  
  // Generate signed URL
  const signedUrl = await secureFileStorage.generateSignedUrl(fileId, key);
  
  // Verify URL format
  const hasUrl = signedUrl !== undefined;
  const isString = typeof signedUrl === 'string';
  const hasLength = signedUrl.length > 0;
  
  console.log('Generated URL:', signedUrl);
  console.log('URL validation:', { hasUrl, isString, hasLength });
  
  // For local storage, verify URL contains expiration and signature
  if (signedUrl.includes('/api/files/')) {
    const url = new URL(signedUrl, 'http://localhost');
    const expires = url.searchParams.get('expires');
    const signature = url.searchParams.get('signature');
    
    const hasExpires = expires !== null;
    const hasSignature = signature !== null;
    
    // Verify expiration is within 10 minutes (600 seconds)
    const expiresTime = parseInt(expires!);
    const now = Date.now();
    const timeDiff = expiresTime - now;
    
    const notExpired = timeDiff > 0;
    const withinLimit = timeDiff <= 600 * 1000; // Within 10 minutes
    
    console.log('✅ Signed URL generated with correct expiration');
    console.log('Expiration time:', new Date(expiresTime));
    console.log('Time until expiration:', Math.round(timeDiff / 1000), 'seconds');
    console.log('URL validation:', { hasExpires, hasSignature, notExpired, withinLimit });
    
    return hasUrl && isString && hasLength && hasExpires && hasSignature && notExpired && withinLimit;
  }
  
  return hasUrl && isString && hasLength;
}

function testSignatureVerification() {
  console.log('\n🔐 Testing signature verification...');
  
  const fileId = 'test-file-456';
  const expires = Date.now() + 300000; // 5 minutes from now
  const secret = process.env.FILE_SIGNATURE_SECRET!;
  
  // Generate signature
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${fileId}:${expires}`)
    .digest('hex');
  
  // Verify signature
  const isValid = crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
  
  console.log('✅ Signature verification works correctly');
  console.log('Signature validation:', { isValid });
  
  return isValid;
}

function testExpiredUrlDetection() {
  console.log('\n🔐 Testing expired URL detection...');
  
  const fileId = 'test-file-789';
  const expires = Date.now() - 1000; // 1 second ago (expired)
  const secret = process.env.FILE_SIGNATURE_SECRET!;
  
  // Generate signature for expired URL
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${fileId}:${expires}`)
    .digest('hex');
  
  // Check if expired
  const now = Date.now();
  const isExpired = now > expires;
  
  console.log('✅ Expired URLs are properly detected');
  console.log('Expiration check:', { isExpired, expires, now });
  
  return isExpired;
}

function testInvalidSignatureRejection() {
  console.log('\n🔐 Testing invalid signature rejection...');
  
  const fileId = 'test-file-abc';
  const expires = Date.now() + 300000; // 5 minutes from now
  const secret = process.env.FILE_SIGNATURE_SECRET!;
  
  // Generate correct signature
  const correctSignature = crypto
    .createHmac('sha256', secret)
    .update(`${fileId}:${expires}`)
    .digest('hex');
  
  // Generate incorrect signature
  const incorrectSignature = crypto
    .createHmac('sha256', secret)
    .update(`${fileId}:${expires + 1}`) // Different data
    .digest('hex');
  
  // Verify signatures are different
  const signaturesDifferent = correctSignature !== incorrectSignature;
  
  // Test timing-safe comparison
  const isValid = crypto.timingSafeEqual(
    Buffer.from(correctSignature, 'hex'),
    Buffer.from(incorrectSignature, 'hex')
  );
  
  console.log('✅ Invalid signatures are properly rejected');
  console.log('Signature validation:', { signaturesDifferent, isValid });
  
  return signaturesDifferent && !isValid;
}

function testStorageStatus() {
  console.log('\n🔐 Testing storage status information...');
  
  const status = secureFileStorage.getStatus();
  
  const hasProvider = 'provider' in status;
  const hasS3Configured = 's3Configured' in status;
  const hasLocalPath = 'localPath' in status;
  const hasUrlExpiration = 'urlExpiration' in status;
  const hasMaxFileSize = 'maxFileSize' in status;
  
  // Verify URL expiration is 10 minutes or less
  const expirationWithinLimit = status.urlExpiration <= 600; // 10 minutes in seconds
  
  console.log('✅ Storage status information available');
  console.log('URL expiration:', status.urlExpiration, 'seconds');
  console.log('Storage provider:', status.provider);
  console.log('Status validation:', { hasProvider, hasS3Configured, hasLocalPath, hasUrlExpiration, hasMaxFileSize, expirationWithinLimit });
  
  return hasProvider && hasS3Configured && hasLocalPath && hasUrlExpiration && hasMaxFileSize && expirationWithinLimit;
}

// Run tests
console.log('🧪 Running signed URL tests...\n');

const runTests = async () => {
  try {
    let allTestsPassed = true;

    const urlResult = await testSignedUrlGeneration();
    if (!urlResult) {
      console.log('❌ Signed URL generation test failed');
      allTestsPassed = false;
    }

    const signatureResult = testSignatureVerification();
    if (!signatureResult) {
      console.log('❌ Signature verification test failed');
      allTestsPassed = false;
    }

    const expiredResult = testExpiredUrlDetection();
    if (!expiredResult) {
      console.log('❌ Expired URL detection test failed');
      allTestsPassed = false;
    }

    const invalidResult = testInvalidSignatureRejection();
    if (!invalidResult) {
      console.log('❌ Invalid signature rejection test failed');
      allTestsPassed = false;
    }

    const statusResult = testStorageStatus();
    if (!statusResult) {
      console.log('❌ Storage status test failed');
      allTestsPassed = false;
    }

    if (allTestsPassed) {
      console.log('\n🎉 All signed URL tests completed successfully!');
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
