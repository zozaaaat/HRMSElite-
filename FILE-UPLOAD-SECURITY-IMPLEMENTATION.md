# File Upload Security Implementation

## Overview

This document describes the comprehensive security enhancements implemented for file uploads in the HRMS Elite application. The implementation includes antivirus scanning, secure storage, signed URLs, and metadata stripping to ensure maximum security for uploaded files.

## Security Features Implemented

### 1. Antivirus Scanning

#### EICAR Test File Detection
- **Implementation**: `server/utils/antivirus.ts`
- **Feature**: Detects and rejects EICAR test files (standard antivirus test files)
- **Test**: `tests/eicar-test.ts`

```typescript
// EICAR test file signature detection
const EICAR_SIGNATURE = 'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*';

// Detection logic
if (fileContent.includes(EICAR_SIGNATURE)) {
  return {
    isClean: false,
    threats: ['EICAR-STANDARD-ANTIVIRUS-TEST-FILE'],
    scanTime: 0,
    provider: 'eicar-detection'
  };
}
```

#### Multiple Scanning Providers
- **ClamAV**: Local antivirus scanning (placeholder implementation)
- **External API**: Integration with external antivirus services
- **Dual Scan**: Option to use both providers for maximum security

#### Configuration
```typescript
export const defaultAntivirusConfig: AntivirusConfig = {
  enabled: process.env.ANTIVIRUS_ENABLED === 'true',
  provider: (process.env.ANTIVIRUS_PROVIDER as 'clamav' | 'external' | 'both') || 'external',
  externalApiUrl: process.env.ANTIVIRUS_API_URL,
  externalApiKey: process.env.ANTIVIRUS_API_KEY,
  timeout: parseInt(process.env.ANTIVIRUS_TIMEOUT || '30000'),
  maxFileSize: parseInt(process.env.ANTIVIRUS_MAX_FILE_SIZE || '10485760') // 10MB
};
```

### 2. Secure File Storage

#### AWS S3 Integration
- **Implementation**: `server/utils/secureStorage.ts`
- **Features**:
  - Server-side encryption (AES256)
  - Private bucket access
  - Signed URLs for secure access
  - Metadata storage

#### Local Storage with Security
- **Features**:
  - Encrypted file storage
  - Signed URL generation
  - Metadata separation
  - Access control

#### Image Processing
- **Metadata Stripping**: Removes EXIF and other metadata from images
- **Format Conversion**: Converts to safe formats (JPEG, PNG, WebP)
- **Quality Optimization**: Maintains quality while ensuring security

```typescript
// Image processing with metadata stripping
const processedImage = image
  .removeMetadata()
  .jpeg({ quality: 85, progressive: true })
  .png({ progressive: true })
  .webp({ quality: 85 });
```

### 3. Signed URLs

#### URL Generation
- **Expiration**: URLs expire within 10 minutes (configurable)
- **Signature**: HMAC-SHA256 signature for URL integrity
- **Security**: Timing-safe comparison to prevent timing attacks

#### Implementation
```typescript
// Generate signed URL
const expiresAt = Date.now() + this.config.urlExpiration * 1000;
const signature = crypto
  .createHmac('sha256', process.env.FILE_SIGNATURE_SECRET || 'default-secret')
  .update(`${fileId}:${expiresAt}`)
  .digest('hex');

return `/api/files/${fileId}/download?expires=${expiresAt}&signature=${signature}`;
```

#### Verification
```typescript
// Verify signed URL
function verifySignedUrl(fileId: string, expires: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.FILE_SIGNATURE_SECRET || 'default-secret')
    .update(`${fileId}:${expires}`)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}
```

### 4. Enhanced Upload Endpoint

#### Security Middleware Chain
```typescript
app.post('/api/documents/upload', 
  isAuthenticated,           // Authentication check
  upload.single('file'),     // File upload handling
  validateFile,              // File validation
  scanFile,                  // Antivirus scanning
  async (req, res) => {      // Secure storage and processing
    // Implementation
  }
);
```

#### File Validation
- **Size Limits**: Configurable maximum file size
- **Type Validation**: MIME type and file signature verification
- **Extension Check**: Allowed file extensions
- **Content Verification**: File content matches declared type

#### Security Logging
```typescript
log.info('File uploaded and stored securely', {
  fileId: storedFile.id,
  fileName: file.originalname,
  fileSize: file.size,
  mimeType: file.mimetype,
  uploadedBy: req.user?.id,
  scanResult: {
    isClean: scanResult.isClean,
    provider: scanResult.provider,
    scanTime: scanResult.scanTime
  },
  storage: {
    provider: secureFileStorage.getStatus().provider,
    urlExpiration: secureFileStorage.getStatus().urlExpiration
  },
  timestamp: new Date().toISOString()
}, 'UPLOAD');
```

## Environment Variables

### Required Environment Variables
```env
# Antivirus Configuration
ANTIVIRUS_ENABLED=true
ANTIVIRUS_PROVIDER=external
ANTIVIRUS_API_URL=https://api.antivirus-service.com/scan
ANTIVIRUS_API_KEY=your-antivirus-api-key
ANTIVIRUS_TIMEOUT=30000
ANTIVIRUS_MAX_FILE_SIZE=10485760

# File Storage Configuration
FILE_STORAGE_PROVIDER=local
AWS_S3_BUCKET=hrms-elite-files
AWS_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
LOCAL_FILE_PATH=./uploads
FILE_URL_EXPIRATION=600
FILE_SIGNATURE_SECRET=your-file-signature-secret

# File Upload Limits
UPLOAD_MAX_BYTES=5242880
```

## Testing

### EICAR Test File Detection
```bash
# Run EICAR detection test
npm run test:eicar

# Or run directly
npx tsx tests/eicar-test.ts
```

### Signed URL Functionality
```bash
# Run signed URL test
npm run test:signed-url

# Or run directly
npx tsx tests/signed-url-test.ts
```

### Security Status Endpoint
```bash
# Check security configuration
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/security/status
```

## Security Acceptance Criteria

### ✅ EICAR Test File Detection
- EICAR test files are detected and rejected
- Clean files are accepted
- Large files are handled appropriately
- Scanner status information is available

### ✅ Signed URL Security
- URLs expire within 10 minutes (≤600 seconds)
- Signatures are verified using timing-safe comparison
- Expired URLs are rejected
- Invalid signatures are rejected
- Storage status information is available

### ✅ File Upload Security
- File size and type validation
- File signature verification
- Antivirus scanning integration
- Secure storage with encryption
- Metadata stripping for images
- Comprehensive security logging

## Dependencies Added

### Production Dependencies
```json
{
  "@aws-sdk/client-s3": "^3.540.0",
  "@aws-sdk/s3-request-presigner": "^3.540.0",
  "axios": "^1.7.9",
  "jimp": "^0.24.0",
  "multer": "^1.4.5-lts.1",
  "sharp": "^0.34.0"
}
```

### Development Dependencies
```json
{
  "@types/jimp": "^0.16.8",
  "@types/multer": "^1.4.11"
}
```

## Installation

1. **Install Dependencies**
```bash
npm install
```

2. **Configure Environment Variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Create Upload Directory**
```bash
mkdir -p uploads
```

4. **Run Tests**
```bash
npm run test:eicar
npm run test:signed-url
```

## Security Best Practices

### 1. File Validation
- Always validate file types using both extension and MIME type
- Verify file signatures (magic bytes) for additional security
- Implement size limits to prevent DoS attacks

### 2. Antivirus Scanning
- Use multiple scanning providers when possible
- Implement EICAR test file detection
- Log all scan results for audit purposes

### 3. Secure Storage
- Use encrypted storage (AES256 for S3)
- Implement private access with signed URLs
- Strip metadata from images to prevent information leakage

### 4. Access Control
- Implement proper authentication and authorization
- Use signed URLs with short expiration times
- Log all file access attempts

### 5. Monitoring and Logging
- Log all file uploads and downloads
- Monitor for suspicious activity
- Implement security alerts for failed scans

## Troubleshooting

### Common Issues

1. **Antivirus Scan Fails**
   - Check antivirus API configuration
   - Verify network connectivity
   - Check API rate limits

2. **File Upload Rejected**
   - Verify file type is in allowed list
   - Check file size limits
   - Ensure file signature is valid

3. **Signed URL Expires Too Quickly**
   - Adjust `FILE_URL_EXPIRATION` environment variable
   - Default is 600 seconds (10 minutes)

4. **Storage Configuration Issues**
   - Verify AWS credentials for S3
   - Check local file path permissions
   - Ensure storage provider is correctly configured

## Future Enhancements

1. **Advanced Threat Detection**
   - Machine learning-based threat detection
   - Behavioral analysis of uploaded files
   - Sandbox execution for suspicious files

2. **Enhanced Monitoring**
   - Real-time security dashboard
   - Automated threat response
   - Integration with SIEM systems

3. **Compliance Features**
   - GDPR compliance tools
   - Data retention policies
   - Audit trail enhancements

## Support

For security-related issues or questions, please contact the security team or create an issue in the project repository with the `security` label.
