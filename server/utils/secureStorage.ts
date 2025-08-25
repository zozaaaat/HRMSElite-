/**
 * @fileoverview Secure file storage utility with AWS S3 integration
 * @description Provides secure file storage with signed URLs, metadata stripping, and private access
 * @author HRMS Elite Team
 * @version 1.0.0
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';
import { log } from './logger';
import crypto from 'node:crypto';
import { env } from './env';

export interface StorageConfig {
  provider: 's3' | 'local' | 'hybrid';
  s3Bucket: string;
  s3Region: string;
  s3AccessKeyId?: string;
  s3SecretAccessKey?: string;
  localPath: string;
  urlExpiration: number; // in seconds
  maxFileSize: number;
  allowedMimeTypes: string[];
}

export interface FileMetadata {
  originalName: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
  checksum: string;
  isImage: boolean;
  imageMetadata?: {
    width: number;
    height: number;
    format: string;
  };
}

export interface StoredFile {
  id: string;
  key: string;
  url: string;
  metadata: FileMetadata;
  expiresAt: Date;
}

export class SecureFileStorage {
  private config: StorageConfig;
  private s3Client: S3Client | null = null;

  constructor(config: StorageConfig) {
    this.config = config;
    
    if (config.provider === 's3' || config.provider === 'hybrid') {
      this.initializeS3Client();
    }
  }

  /**
   * Initialize AWS S3 client
   */
  private initializeS3Client(): void {
    if (!this.config.s3AccessKeyId || !this.config.s3SecretAccessKey) {
      log.error('AWS S3 credentials not provided; S3 operations disabled', {}, 'STORAGE');
      return;
    }

    this.s3Client = new S3Client({
      region: this.config.s3Region,
      credentials: {
        accessKeyId: this.config.s3AccessKeyId,
        secretAccessKey: this.config.s3SecretAccessKey
      }
    });

    log.info('AWS S3 client initialized', {
      region: this.config.s3Region,
      bucket: this.config.s3Bucket
    }, 'STORAGE');
  }

  /**
   * Generate a secure file ID
   * @returns string - Secure file ID
   */
  private generateFileId(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Generate file checksum
   * @param buffer - File buffer
   * @returns string - SHA256 checksum
   */
  private generateChecksum(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Check if file is an image
   * @param mimeType - File MIME type
   * @returns boolean - True if image
   */
  private isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  /**
   * Strip metadata from image and generate safe derivatives
   * @param buffer - Image buffer
   * @param mimeType - Image MIME type
   * @returns Promise<Buffer> - Processed image buffer
   */
  private async processImage(buffer: Buffer, mimeType: string): Promise<{
    buffer: Buffer;
    metadata: { width: number; height: number; format: string };
  }> {
    try {
      const image = sharp(buffer);
      const metadata = await image.metadata();
      
      // Strip all metadata and convert to safe format
      const processedImage = image
        .removeMetadata()
        .jpeg({ quality: 85, progressive: true })
        .png({ progressive: true })
        .webp({ quality: 85 });

      const processedBuffer = await processedImage.toBuffer();

      return {
        buffer: processedBuffer,
        metadata: {
          width: metadata.width || 0,
          height: metadata.height || 0,
          format: metadata.format || 'unknown'
        }
      };
    } catch (error) {
      log.error('Image processing failed', error as Error, 'STORAGE');
      throw new Error('Failed to process image');
    }
  }

  /**
   * Store file securely
   * @param buffer - File buffer
   * @param originalName - Original filename
   * @param mimeType - File MIME type
   * @param uploadedBy - User ID who uploaded the file
   * @returns Promise<StoredFile> - Stored file information
   */
  async storeFile(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    uploadedBy: string
  ): Promise<StoredFile> {
    try {
      // Validate file size
      if (buffer.length > this.config.maxFileSize) {
        throw new Error(`File size ${buffer.length} exceeds limit ${this.config.maxFileSize}`);
      }

      // Validate MIME type
      if (!this.config.allowedMimeTypes.includes(mimeType)) {
        throw new Error(`MIME type ${mimeType} not allowed`);
      }

      const fileId = this.generateFileId();
      const checksum = this.generateChecksum(buffer);
      const isImage = this.isImage(mimeType);
      let processedBuffer = buffer;
      let imageMetadata;

      // Process image if it's an image file
      if (isImage) {
        const processed = await this.processImage(buffer, mimeType);
        processedBuffer = processed.buffer;
        imageMetadata = processed.metadata;
      }

      // Create file metadata
      const metadata: FileMetadata = {
        originalName,
        mimeType,
        size: processedBuffer.length,
        uploadedBy,
        uploadedAt: new Date(),
        checksum,
        isImage,
        imageMetadata
      };

      // Generate storage key
      const key = `private/${fileId}/${originalName}`;

      // Store file based on provider
      let url: string;
      if (this.config.provider === 's3') {
        if (!this.s3Client) {
          throw new Error('S3 storage selected but AWS credentials are missing');
        }
        url = await this.storeInS3(processedBuffer, key, metadata);
      } else if (this.config.provider === 'local') {
        url = await this.storeLocally(processedBuffer, key, metadata);
      } else {
        if (!this.s3Client) {
          throw new Error('Hybrid storage requires valid AWS credentials');
        }
        // Hybrid: store in both S3 and local
        const [s3Url, localUrl] = await Promise.all([
          this.storeInS3(processedBuffer, key, metadata),
          this.storeLocally(processedBuffer, key, metadata)
        ]);
        url = s3Url || localUrl;
      }

      const expiresAt = new Date(Date.now() + this.config.urlExpiration * 1000);

      log.info('File stored securely', {
        fileId,
        originalName,
        size: processedBuffer.length,
        provider: this.config.provider,
        isImage
      }, 'STORAGE');

      return {
        id: fileId,
        key,
        url,
        metadata,
        expiresAt
      };
    } catch (error) {
      log.error('File storage failed', error as Error, 'STORAGE');
      throw error;
    }
  }

  /**
   * Store file in AWS S3
   * @param buffer - File buffer
   * @param key - S3 object key
   * @param metadata - File metadata
   * @returns Promise<string> - S3 URL
   */
  private async storeInS3(buffer: Buffer, key: string, metadata: FileMetadata): Promise<string> {
    if (!this.s3Client) {
      throw new Error('S3 client not initialized');
    }

    const command = new PutObjectCommand({
      Bucket: this.config.s3Bucket,
      Key: key,
      Body: buffer,
      ContentType: metadata.mimeType,
      Metadata: {
        'original-name': metadata.originalName,
        'uploaded-by': metadata.uploadedBy,
        'uploaded-at': metadata.uploadedAt.toISOString(),
        'checksum': metadata.checksum,
        'is-image': metadata.isImage.toString(),
        ...(metadata.imageMetadata && {
          'image-width': metadata.imageMetadata.width.toString(),
          'image-height': metadata.imageMetadata.height.toString(),
          'image-format': metadata.imageMetadata.format
        })
      },
      ServerSideEncryption: 'AES256'
    });

    await this.s3Client.send(command);

    // Generate signed URL for private access
    const getCommand = new GetObjectCommand({
      Bucket: this.config.s3Bucket,
      Key: key
    });

    return await getSignedUrl(this.s3Client, getCommand, {
      expiresIn: this.config.urlExpiration
    });
  }

  /**
   * Store file locally
   * @param buffer - File buffer
   * @param key - File key
   * @param metadata - File metadata
   * @returns Promise<string> - Local file URL
   */
  private async storeLocally(buffer: Buffer, key: string, metadata: FileMetadata): Promise<string> {
    const fs = await import('fs/promises');
    const path = await import('path');

    const filePath = path.join(this.config.localPath, key);
    const dirPath = path.dirname(filePath);

    // Create directory if it doesn't exist
    await fs.mkdir(dirPath, { recursive: true });
    const keyHex = env.FILE_ENCRYPTION_KEY;
    if (!keyHex || keyHex.length < 32) {
      throw new Error('FILE_ENCRYPTION_KEY is required for local storage');
    }
    const encryptionKey = Buffer.from(keyHex, 'hex');
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    const authTag = cipher.getAuthTag();
    const encryptedBuffer = Buffer.concat([iv, authTag, encrypted]);

    // Write encrypted file with restricted permissions
    await fs.writeFile(filePath, encryptedBuffer, { mode: 0o600 });

    // Store metadata separately with restricted permissions
    const metadataPath = `${filePath}.meta.json`;
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), { mode: 0o600 });

    return `/api/files/${key}`;
  }

  /**
   * Generate signed URL for file access
   * @param fileId - File ID
   * @param key - File key
   * @returns Promise<string> - Signed URL
   */
  async generateSignedUrl(fileId: string, key: string): Promise<string> {
    try {
      if (this.config.provider === 's3') {
        if (!this.s3Client) {
          throw new Error('S3 client not initialized');
        }
        const command = new GetObjectCommand({
          Bucket: this.config.s3Bucket,
          Key: key
        });

        return await getSignedUrl(this.s3Client, command, {
          expiresIn: this.config.urlExpiration
        });
      } else if (this.config.provider === 'local') {
        // For local storage, return a temporary signed URL
        const expiresAt = Date.now() + this.config.urlExpiration * 1000;
        const signature = crypto
          .createHmac('sha256', env.FILE_SIGNATURE_SECRET)
          .update(`${fileId}:${expiresAt}`)
          .digest('hex');

        return `/api/files/${fileId}/download?expires=${expiresAt}&signature=${signature}`;
      } else {
        if (!this.s3Client) {
          throw new Error('Hybrid storage requires valid AWS credentials');
        }
        const command = new GetObjectCommand({
          Bucket: this.config.s3Bucket,
          Key: key
        });

        return await getSignedUrl(this.s3Client, command, {
          expiresIn: this.config.urlExpiration
        });
      }
    } catch (error) {
      log.error('Failed to generate signed URL', error as Error, 'STORAGE');
      throw error;
    }
  }

  /**
   * Delete file from storage
   * @param key - File key
   * @returns Promise<void>
   */
  async deleteFile(key: string): Promise<void> {
    try {
      if (this.config.provider === 's3') {
        if (!this.s3Client) {
          throw new Error('S3 client not initialized');
        }
        const command = new DeleteObjectCommand({
          Bucket: this.config.s3Bucket,
          Key: key
        });
        await this.s3Client.send(command);
      } else if (this.config.provider === 'local') {
        const fs = await import('fs/promises');
        const path = await import('path');

        const filePath = path.join(this.config.localPath, key);
        const metadataPath = `${filePath}.meta.json`;

        await Promise.allSettled([
          fs.unlink(filePath),
          fs.unlink(metadataPath)
        ]);
      } else {
        if (!this.s3Client) {
          throw new Error('Hybrid storage requires valid AWS credentials');
        }
        const fs = await import('fs/promises');
        const path = await import('path');
        const filePath = path.join(this.config.localPath, key);
        const metadataPath = `${filePath}.meta.json`;

        await Promise.allSettled([
          this.s3Client.send(new DeleteObjectCommand({ Bucket: this.config.s3Bucket, Key: key })),
          fs.unlink(filePath),
          fs.unlink(metadataPath)
        ]);
      }

      log.info('File deleted', { key }, 'STORAGE');
    } catch (error) {
      log.error('Failed to delete file', error as Error, 'STORAGE');
      throw error;
    }
  }

  /**
   * Check if file exists
   * @param key - File key
   * @returns Promise<boolean> - True if file exists
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      if (this.config.provider === 's3') {
        if (!this.s3Client) {
          throw new Error('S3 client not initialized');
        }
        const command = new HeadObjectCommand({
          Bucket: this.config.s3Bucket,
          Key: key
        });
        await this.s3Client.send(command);
        return true;
      } else if (this.config.provider === 'local') {
        const fs = await import('fs/promises');
        const path = await import('path');

        const filePath = path.join(this.config.localPath, key);
        await fs.access(filePath);
        return true;
      } else {
        if (!this.s3Client) {
          throw new Error('Hybrid storage requires valid AWS credentials');
        }
        try {
          const command = new HeadObjectCommand({
            Bucket: this.config.s3Bucket,
            Key: key
          });
          await this.s3Client.send(command);
          return true;
        } catch {
          const fs = await import('fs/promises');
          const path = await import('path');
          const filePath = path.join(this.config.localPath, key);
          await fs.access(filePath);
          return true;
        }
      }
    } catch {
      return false;
    }
  }

  /**
   * Get storage status
   * @returns object - Storage status information
   */
  getStatus(): {
    provider: string;
    s3Configured: boolean;
    localPath: string;
    urlExpiration: number;
    maxFileSize: number;
  } {
    return {
      provider: this.config.provider,
      s3Configured: !!this.s3Client,
      localPath: this.config.localPath,
      urlExpiration: this.config.urlExpiration,
      maxFileSize: this.config.maxFileSize
    };
  }
}

// Default storage configuration
export const defaultStorageConfig: StorageConfig = {
  provider: (process.env.FILE_STORAGE_PROVIDER as 's3' | 'local' | 'hybrid') || 'local',
  s3Bucket: process.env.AWS_S3_BUCKET || 'hrms-elite-files',
  s3Region: process.env.AWS_S3_REGION || 'us-east-1',
  s3AccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  s3SecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  localPath: process.env.LOCAL_FILE_PATH || './uploads',
  urlExpiration: parseInt(process.env.FILE_URL_EXPIRATION || '600'), // 10 minutes
  maxFileSize: parseInt(process.env.UPLOAD_MAX_BYTES || process.env.MAX_FILE_SIZE || '5242880'), // 5MB default
  allowedMimeTypes: [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
};

// Create default storage instance
export const secureFileStorage = new SecureFileStorage(defaultStorageConfig);
