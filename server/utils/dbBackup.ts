/**
 * @fileoverview Database Backup and Restore System
 * @description Provides encrypted backup and restore functionality for SQLite databases
 * @author HRMS Elite Team
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import * as tar from 'tar';
import cron from 'node-cron';
import { secureDbManager, DatabaseSecurityConfig } from './dbSecurity';
import { log } from './logger';
import 'dotenv/config';

export interface BackupConfig {
  backupDir: string;
  encryptionKey: string;
  compression: boolean;
  retention: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  schedule: string;
  testRestore: boolean;
}

export interface BackupMetadata {
  id: string;
  timestamp: Date;
  size: number;
  compressed: boolean;
  encrypted: boolean;
  checksum: string;
  dbVersion: string;
  type: 'manual' | 'scheduled';
  originalPath: string;
}

export interface RestoreOptions {
  backupId?: string;
  backupPath?: string;
  targetPath?: string;
  verifyIntegrity: boolean;
  createTestCopy: boolean;
}

export class DatabaseBackupManager {
  private config: BackupConfig;
  private cronJob: cron.ScheduledTask | null = null;

  constructor(config?: Partial<BackupConfig>) {
    this.config = {
      backupDir: process.env.DB_BACKUP_DIR || path.join(process.cwd(), 'backups'),
      encryptionKey: process.env.DB_BACKUP_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex'),
      compression: process.env.DB_BACKUP_COMPRESSION !== 'false',
      retention: {
        daily: parseInt(process.env.DB_BACKUP_RETENTION_DAILY || '7'),
        weekly: parseInt(process.env.DB_BACKUP_RETENTION_WEEKLY || '4'),
        monthly: parseInt(process.env.DB_BACKUP_RETENTION_MONTHLY || '12')
      },
      schedule: process.env.DB_BACKUP_SCHEDULE || '0 2 * * *', // Daily at 2 AM
      testRestore: process.env.DB_BACKUP_TEST_RESTORE === 'true',
      ...config
    };

    this.ensureBackupDirectory();
  }

  /**
   * Ensure backup directory exists
   */
  private ensureBackupDirectory(): void {
    try {
      if (!fs.existsSync(this.config.backupDir)) {
        fs.mkdirSync(this.config.backupDir, { recursive: true });
        log.info('Created backup directory:', this.config.backupDir);
      }
    } catch (error) {
      log.error('Failed to create backup directory:', error);
      throw error;
    }
  }

  /**
   * Generate backup ID
   */
  private generateBackupId(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `backup-${timestamp}-${crypto.randomBytes(4).toString('hex')}`;
  }

  /**
   * Calculate file checksum
   */
  private calculateChecksum(filePath: string): string {
    const hash = crypto.createHash('sha256');
    const data = fs.readFileSync(filePath);
    hash.update(data);
    return hash.digest('hex');
  }

  /**
   * Encrypt file
   */
  private encryptFile(inputPath: string, outputPath: string): void {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(this.config.encryptionKey, 'salt', 32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher('aes-256-cbc', key);
    
    const inputData = fs.readFileSync(inputPath);
    let encrypted = cipher.update(inputData);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    // Write IV + encrypted data
    const result = Buffer.concat([iv, encrypted]);
    fs.writeFileSync(outputPath, result);
  }

  /**
   * Decrypt file
   */
  private decryptFile(inputPath: string, outputPath: string): void {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(this.config.encryptionKey, 'salt', 32);
    
    const data = fs.readFileSync(inputPath);
    
    // Extract IV (16 bytes) and encrypted data
    const iv = data.slice(0, 16);
    const encryptedData = data.slice(16);
    
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    
    let decrypted = decipher.update(encryptedData);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    fs.writeFileSync(outputPath, decrypted);
  }

  /**
   * Create database backup
   */
  public async createBackup(dbPath?: string, type: 'manual' | 'scheduled' = 'manual'): Promise<BackupMetadata> {
    try {
      const databasePath = dbPath || process.env.DATABASE_URL || 'dev.db';
      const backupId = this.generateBackupId();
      const timestamp = new Date();
      
      log.info('Starting database backup:', { backupId, databasePath });

      // Ensure database exists
      if (!fs.existsSync(databasePath)) {
        throw new Error(`Database file not found: ${databasePath}`);
      }

      // Create temporary backup file
      const tempBackupPath = path.join(this.config.backupDir, `${backupId}.tmp`);
      
      // Copy database file
      fs.copyFileSync(databasePath, tempBackupPath);
      
      // Also backup WAL file if it exists
      const walPath = `${databasePath}-wal`;
      const tempWalPath = `${tempBackupPath}-wal`;
      if (fs.existsSync(walPath)) {
        fs.copyFileSync(walPath, tempWalPath);
      }

      // Also backup SHM file if it exists
      const shmPath = `${databasePath}-shm`;
      const tempShmPath = `${tempBackupPath}-shm`;
      if (fs.existsSync(shmPath)) {
        fs.copyFileSync(shmPath, tempShmPath);
      }

      let finalBackupPath = tempBackupPath;

      // Compress if enabled
      if (this.config.compression) {
        const compressedPath = path.join(this.config.backupDir, `${backupId}.tar.gz`);
        
        const filesToCompress = [tempBackupPath];
        if (fs.existsSync(tempWalPath)) filesToCompress.push(tempWalPath);
        if (fs.existsSync(tempShmPath)) filesToCompress.push(tempShmPath);

        await tar.create(
          {
            gzip: true,
            file: compressedPath,
            cwd: this.config.backupDir
          },
          filesToCompress.map(f => path.basename(f))
        );

        // Clean up temp files
        filesToCompress.forEach(f => {
          if (fs.existsSync(f)) fs.unlinkSync(f);
        });

        finalBackupPath = compressedPath;
      }

      // Encrypt if needed
      if (this.config.encryptionKey) {
        const encryptedPath = `${finalBackupPath}.enc`;
        this.encryptFile(finalBackupPath, encryptedPath);
        
        // Remove unencrypted file
        fs.unlinkSync(finalBackupPath);
        finalBackupPath = encryptedPath;
      }

      // Calculate checksum
      const checksum = this.calculateChecksum(finalBackupPath);
      const fileStats = fs.statSync(finalBackupPath);

      // Create metadata
      const metadata: BackupMetadata = {
        id: backupId,
        timestamp,
        size: fileStats.size,
        compressed: this.config.compression,
        encrypted: !!this.config.encryptionKey,
        checksum,
        dbVersion: '1.0.0', // Could be dynamic
        type,
        originalPath: databasePath
      };

      // Save metadata
      const metadataPath = path.join(this.config.backupDir, `${backupId}.metadata.json`);
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

      log.info('Database backup completed successfully:', {
        backupId,
        size: Math.round(fileStats.size / 1024 / 1024 * 100) / 100 + ' MB',
        compressed: this.config.compression,
        encrypted: !!this.config.encryptionKey
      });

      // Test restore if enabled
      if (this.config.testRestore && type === 'scheduled') {
        await this.testRestore(backupId);
      }

      // Clean up old backups
      await this.cleanupOldBackups();

      return metadata;

    } catch (error) {
      log.error('Database backup failed:', error);
      throw error;
    }
  }

  /**
   * Restore database from backup
   */
  public async restoreBackup(options: RestoreOptions): Promise<void> {
    try {
      let backupPath: string;
      let metadata: BackupMetadata | null = null;

      if (options.backupId) {
        // Find backup by ID
        const metadataPath = path.join(this.config.backupDir, `${options.backupId}.metadata.json`);
        if (!fs.existsSync(metadataPath)) {
          throw new Error(`Backup metadata not found: ${options.backupId}`);
        }
        metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
        
        // Determine backup file path
        let backupFile = path.join(this.config.backupDir, options.backupId);
        if (metadata.compressed) backupFile += '.tar.gz';
        if (metadata.encrypted) backupFile += '.enc';
        
        backupPath = backupFile;
      } else if (options.backupPath) {
        backupPath = options.backupPath;
      } else {
        throw new Error('Either backupId or backupPath must be provided');
      }

      if (!fs.existsSync(backupPath)) {
        throw new Error(`Backup file not found: ${backupPath}`);
      }

      log.info('Starting database restore:', { backupPath, metadata: metadata?.id });

      const targetPath = options.targetPath || metadata?.originalPath || process.env.DATABASE_URL || 'dev.db';
      let workingPath = backupPath;

      // Decrypt if needed
      if (metadata?.encrypted || backupPath.endsWith('.enc')) {
        const decryptedPath = `${backupPath}.decrypted`;
        this.decryptFile(workingPath, decryptedPath);
        workingPath = decryptedPath;
      }

      // Decompress if needed
      if (metadata?.compressed || workingPath.includes('.tar.gz')) {
        const extractDir = path.join(this.config.backupDir, 'restore-temp');
        if (!fs.existsSync(extractDir)) {
          fs.mkdirSync(extractDir, { recursive: true });
        }

        await tar.extract({
          file: workingPath,
          cwd: extractDir
        });

        // Find the main database file
        const files = fs.readdirSync(extractDir);
        const dbFile = files.find(f => f.endsWith('.tmp') && !f.includes('-wal') && !f.includes('-shm'));
        if (!dbFile) {
          throw new Error('Database file not found in backup archive');
        }
        
        workingPath = path.join(extractDir, dbFile);
      }

      // Verify integrity if requested
      if (options.verifyIntegrity && metadata) {
        const currentChecksum = this.calculateChecksum(workingPath);
        if (currentChecksum !== metadata.checksum) {
          throw new Error('Backup integrity verification failed - checksums do not match');
        }
        log.info('Backup integrity verified successfully');
      }

      // Create test copy if requested
      if (options.createTestCopy) {
        const testPath = `${targetPath}.restore-test`;
        fs.copyFileSync(workingPath, testPath);
        log.info('Test copy created:', testPath);
        return;
      }

      // Stop database connections before restore
      secureDbManager.close();

      // Backup current database
      const currentBackupPath = `${targetPath}.pre-restore-${Date.now()}`;
      if (fs.existsSync(targetPath)) {
        fs.copyFileSync(targetPath, currentBackupPath);
        log.info('Current database backed up to:', currentBackupPath);
      }

      // Restore database
      fs.copyFileSync(workingPath, targetPath);

      // Restore WAL and SHM files if they exist in the backup
      const extractDir = path.dirname(workingPath);
      const walFile = path.join(extractDir, path.basename(workingPath) + '-wal');
      const shmFile = path.join(extractDir, path.basename(workingPath) + '-shm');
      
      if (fs.existsSync(walFile)) {
        fs.copyFileSync(walFile, `${targetPath}-wal`);
      }
      if (fs.existsSync(shmFile)) {
        fs.copyFileSync(shmFile, `${targetPath}-shm`);
      }

      // Clean up temporary files
      if (workingPath !== backupPath) {
        fs.unlinkSync(workingPath);
      }
      if (fs.existsSync(path.join(this.config.backupDir, 'restore-temp'))) {
        fs.rmSync(path.join(this.config.backupDir, 'restore-temp'), { recursive: true });
      }

      log.info('Database restore completed successfully:', { targetPath, backupId: metadata?.id });

    } catch (error) {
      log.error('Database restore failed:', error);
      throw error;
    }
  }

  /**
   * Test restore functionality
   */
  public async testRestore(backupId: string): Promise<boolean> {
    try {
      log.info('Testing restore for backup:', backupId);
      
      const testDbPath = path.join(this.config.backupDir, `test-restore-${backupId}.db`);
      
      await this.restoreBackup({
        backupId,
        targetPath: testDbPath,
        verifyIntegrity: true,
        createTestCopy: false
      });

      // Test database connection
      await secureDbManager.initializeDatabase(testDbPath);
      const testDb = secureDbManager.getRawDatabase();
      const testResult = testDb?.prepare?.('SELECT 1 as test')?.get?.();
      
      if (testResult?.test !== 1) {
        throw new Error('Test database query failed');
      }

      // Clean up test database
      if (fs.existsSync(testDbPath)) {
        fs.unlinkSync(testDbPath);
      }

      log.info('Restore test completed successfully for backup:', backupId);
      return true;

    } catch (error) {
      log.error('Restore test failed for backup:', backupId, error);
      return false;
    }
  }

  /**
   * List available backups
   */
  public listBackups(): BackupMetadata[] {
    try {
      const backups: BackupMetadata[] = [];
      const files = fs.readdirSync(this.config.backupDir);
      
      files
        .filter(file => file.endsWith('.metadata.json'))
        .forEach(metadataFile => {
          try {
            const metadataPath = path.join(this.config.backupDir, metadataFile);
            const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
            backups.push(metadata);
          } catch (error) {
            log.warn('Failed to parse backup metadata:', metadataFile, error);
          }
        });

      return backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      log.error('Failed to list backups:', error);
      return [];
    }
  }

  /**
   * Clean up old backups based on retention policy
   */
  public async cleanupOldBackups(): Promise<void> {
    try {
      const backups = this.listBackups();
      const now = new Date();
      const toDelete: string[] = [];

      // Categorize backups
      const daily: BackupMetadata[] = [];
      const weekly: BackupMetadata[] = [];
      const monthly: BackupMetadata[] = [];

      backups.forEach(backup => {
        const backupDate = new Date(backup.timestamp);
        const daysDiff = Math.floor((now.getTime() - backupDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff <= 7) {
          daily.push(backup);
        } else if (daysDiff <= 30) {
          weekly.push(backup);
        } else {
          monthly.push(backup);
        }
      });

      // Apply retention policy
      if (daily.length > this.config.retention.daily) {
        const excess = daily.slice(this.config.retention.daily);
        toDelete.push(...excess.map(b => b.id));
      }

      if (weekly.length > this.config.retention.weekly) {
        const excess = weekly.slice(this.config.retention.weekly);
        toDelete.push(...excess.map(b => b.id));
      }

      if (monthly.length > this.config.retention.monthly) {
        const excess = monthly.slice(this.config.retention.monthly);
        toDelete.push(...excess.map(b => b.id));
      }

      // Delete old backups
      for (const backupId of toDelete) {
        await this.deleteBackup(backupId);
      }

      if (toDelete.length > 0) {
        log.info('Cleaned up old backups:', { deleted: toDelete.length });
      }

    } catch (error) {
      log.error('Failed to cleanup old backups:', error);
    }
  }

  /**
   * Delete a specific backup
   */
  public async deleteBackup(backupId: string): Promise<void> {
    try {
      const metadataPath = path.join(this.config.backupDir, `${backupId}.metadata.json`);
      if (!fs.existsSync(metadataPath)) {
        throw new Error(`Backup not found: ${backupId}`);
      }

      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
      
      // Determine backup file path
      let backupFile = path.join(this.config.backupDir, backupId);
      if (metadata.compressed) backupFile += '.tar.gz';
      if (metadata.encrypted) backupFile += '.enc';

      // Delete files
      if (fs.existsSync(backupFile)) {
        fs.unlinkSync(backupFile);
      }
      fs.unlinkSync(metadataPath);

      log.info('Backup deleted:', backupId);
    } catch (error) {
      log.error('Failed to delete backup:', backupId, error);
      throw error;
    }
  }

  /**
   * Start scheduled backups
   */
  public startScheduledBackups(): void {
    if (this.cronJob) {
      this.cronJob.stop();
    }

    this.cronJob = cron.schedule(this.config.schedule, async () => {
      try {
        log.info('Starting scheduled backup');
        await this.createBackup(undefined, 'scheduled');
      } catch (error) {
        log.error('Scheduled backup failed:', error);
      }
    }, {
      scheduled: false
    });

    this.cronJob.start();
    log.info('Scheduled backups started with cron:', this.config.schedule);
  }

  /**
   * Stop scheduled backups
   */
  public stopScheduledBackups(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
      log.info('Scheduled backups stopped');
    }
  }
}

// Create singleton instance
export const dbBackupManager = new DatabaseBackupManager();

// Command-line interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  const backupId = process.argv[3];
  
  const runCommand = async () => {
    try {
      switch (command) {
        case '--backup':
          console.log('🔄 Creating database backup...');
          const metadata = await dbBackupManager.createBackup();
          console.log('✅ Backup created successfully:');
          console.log('ID:', metadata.id);
          console.log('Size:', Math.round(metadata.size / 1024 / 1024 * 100) / 100, 'MB');
          console.log('Encrypted:', metadata.encrypted);
          console.log('Compressed:', metadata.compressed);
          break;

        case '--restore':
          if (!backupId) {
            console.log('❌ Backup ID required for restore');
            console.log('Usage: npm run db:restore <backup-id>');
            process.exit(1);
          }
          console.log('🔄 Restoring database from backup:', backupId);
          await dbBackupManager.restoreBackup({
            backupId,
            verifyIntegrity: true,
            createTestCopy: false
          });
          console.log('✅ Database restored successfully');
          break;

        case '--test-restore':
          if (!backupId) {
            // Test latest backup
            const backups = dbBackupManager.listBackups();
            if (backups.length === 0) {
              console.log('❌ No backups found');
              process.exit(1);
            }
            const latest = backups[0];
            console.log('🧪 Testing restore for latest backup:', latest.id);
            const success = await dbBackupManager.testRestore(latest.id);
            console.log(success ? '✅ Restore test passed' : '❌ Restore test failed');
          } else {
            console.log('🧪 Testing restore for backup:', backupId);
            const success = await dbBackupManager.testRestore(backupId);
            console.log(success ? '✅ Restore test passed' : '❌ Restore test failed');
          }
          break;

        case '--list':
          console.log('📋 Available backups:');
          const backups = dbBackupManager.listBackups();
          if (backups.length === 0) {
            console.log('No backups found');
          } else {
            backups.forEach(backup => {
              console.log(`${backup.id} | ${backup.timestamp} | ${Math.round(backup.size / 1024 / 1024 * 100) / 100}MB | ${backup.type}`);
            });
          }
          break;

        default:
          console.log('Usage:');
          console.log('  npm run db:backup           - Create backup');
          console.log('  npm run db:restore <id>     - Restore backup');
          console.log('  npm run db:test-restore [id] - Test restore');
          console.log('  tsx server/utils/dbBackup.ts --list - List backups');
          break;
      }
    } catch (error) {
      console.error('❌ Command failed:', error);
      process.exit(1);
    }
  };

  runCommand();
}
