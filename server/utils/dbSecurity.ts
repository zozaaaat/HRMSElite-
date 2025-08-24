/**
 * @fileoverview Database Security Configuration and Management
 * @description Provides SQLite database support with optional encryption
 * @author HRMS Elite Team
 * @version 1.0.0
 */

import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '@shared/schema';
import { log } from './logger';
import { env } from './env';

export interface DatabaseSecurityConfig {
  encryption: {
    enabled: boolean;
    algorithm: 'AES-256' | 'AES-128';
    keyDerivation: 'PBKDF2' | 'scrypt';
    iterations: number;
  };
  backup: {
    enabled: boolean;
    schedule: string; // cron format
    retention: {
      daily: number;
      weekly: number;
      monthly: number;
    };
    encryption: boolean;
    compression: boolean;
  };
  audit: {
    enabled: boolean;
    logQueries: boolean;
    logConnections: boolean;
  };
  performance: {
    walMode: boolean;
    synchronous: 'OFF' | 'NORMAL' | 'FULL';
    cacheSize: number;
    mmapSize: number;
  };
}

export interface DatabaseStatus {
  encrypted: boolean;
  backupEnabled: boolean;
  lastBackup?: Date;
  fileSize: number;
  walSize?: number;
  connections: number;
  securityLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendations: string[];
}

export class SecureDatabaseManager {
  private config: DatabaseSecurityConfig;
  private encryptionKey: string;
  private previousEncryptionKey?: string;
  private database: Database.Database | null = null;
  private drizzleDb: any = null;

  constructor(config?: Partial<DatabaseSecurityConfig>) {
    this.config = {
      encryption: {
        enabled: process.env.DB_ENCRYPTION_ENABLED === 'true',
        algorithm: 'AES-256',
        keyDerivation: 'PBKDF2',
        iterations: 100000
      },
      backup: {
        enabled: process.env.DB_BACKUP_ENABLED !== 'false',
        schedule: process.env.DB_BACKUP_SCHEDULE || '0 2 * * *', // Daily at 2 AM
        retention: {
          daily: parseInt(process.env.DB_BACKUP_RETENTION_DAILY || '7'),
          weekly: parseInt(process.env.DB_BACKUP_RETENTION_WEEKLY || '4'),
          monthly: parseInt(process.env.DB_BACKUP_RETENTION_MONTHLY || '12')
        },
        encryption: true,
        compression: true
      },
      audit: {
        enabled: process.env.DB_AUDIT_ENABLED === 'true',
        logQueries: process.env.DB_AUDIT_LOG_QUERIES === 'true',
        logConnections: process.env.DB_AUDIT_LOG_CONNECTIONS === 'true'
      },
      performance: {
        walMode: true,
        synchronous: 'NORMAL',
        cacheSize: parseInt(process.env.DB_CACHE_SIZE || '2000'),
        mmapSize: parseInt(process.env.DB_MMAP_SIZE || '268435456') // 256MB
      },
      ...config
    };

    this.encryptionKey = env.DB_ENCRYPTION_KEY;
    this.previousEncryptionKey = env.DB_ENCRYPTION_KEY_PREVIOUS;
  }

  /**
   * Initialize secure database connection
   */
  public async initializeDatabase(dbPath?: string): Promise<any> {
    try {
      const databasePath = dbPath || env.DATABASE_URL || 'dev.db';

      if (this.config.encryption.enabled) {
        if (!this.encryptionKey || this.encryptionKey.length < 32) {
          throw new Error('DB_ENCRYPTION_KEY is required and must be at least 32 characters');
        }
        // Use SQLite for encrypted database
        this.database = new Database(databasePath) as any;

        // Set encryption key and verify
        this.database.pragma(`key = '${this.encryptionKey}'`);
        try {
          this.database.prepare('SELECT 1').get();
        } catch (err) {
          if (this.previousEncryptionKey) {
            this.database.pragma(`key = '${this.previousEncryptionKey}'`);
            this.database.prepare('SELECT 1').get();
            this.database.pragma(`rekey = '${this.encryptionKey}'`);
            this.database.pragma(`key = '${this.encryptionKey}'`);
            log.info('Database encryption key rotated');
          } else {
            throw err;
          }
        }

        // Configure encryption

        log.info('Database initialized with encryption enabled');
      } else {
        // Use regular SQLite
        this.database = new Database(databasePath);
        log.info('Database initialized without encryption');
      }

      // Apply performance optimizations
      this.applyPerformanceSettings();

      // Setup audit logging if enabled
      if (this.config.audit.enabled) {
        this.setupAuditLogging();
      }

      // Initialize Drizzle ORM
      this.drizzleDb = drizzle(this.database, { schema });

      // Test database connection
      await this.testConnection();

      return this.drizzleDb;

    } catch (error) {
      log.error('Failed to initialize secure database:', error);
      throw new Error(`Database initialization failed: ${error.message}`);
    }
  }

  /**
   * Apply performance settings to database
   */
  private applyPerformanceSettings(): void {
    if (!this.database) return;

    try {
      // Enable WAL mode for better concurrency
      if (this.config.performance.walMode) {
        this.database.pragma('journal_mode = WAL');
      }

      // Set synchronous mode
      this.database.pragma(`synchronous = ${this.config.performance.synchronous}`);

      // Set cache size
      this.database.pragma(`cache_size = ${this.config.performance.cacheSize}`);

      // Set memory-mapped I/O size
      this.database.pragma(`mmap_size = ${this.config.performance.mmapSize}`);

      // Enable foreign keys
      this.database.pragma('foreign_keys = ON');

      log.info('Database performance settings applied');
    } catch (error) {
      log.error('Failed to apply performance settings:', error);
    }
  }

  /**
   * Setup audit logging
   */
  private setupAuditLogging(): void {
    if (!this.database || !this.config.audit.enabled) return;

    try {
      // Create audit log table if it doesn't exist
      this.database.exec(`
        CREATE TABLE IF NOT EXISTS audit_log (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          timestamp INTEGER NOT NULL DEFAULT (unixepoch()),
          event_type TEXT NOT NULL,
          table_name TEXT,
          operation TEXT,
          user_id TEXT,
          ip_address TEXT,
          user_agent TEXT,
          query_hash TEXT,
          affected_rows INTEGER,
          execution_time REAL,
          details TEXT
        )
      `);

      // Create index for performance
      this.database.exec(`
        CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp);
        CREATE INDEX IF NOT EXISTS idx_audit_log_event_type ON audit_log(event_type);
        CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
      `);

      log.info('Audit logging initialized');
    } catch (error) {
      log.error('Failed to setup audit logging:', error);
    }
  }

  /**
   * Test database connection
   */
  private async testConnection(): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    try {
      // Test basic query
      const result = this.database.prepare('SELECT 1 as test').get();
      
      if (result?.test !== 1) {
        throw new Error('Database connection test failed');
      }

      // Test encryption if enabled
      if (this.config.encryption.enabled) {
        const encryptionTest = this.database.pragma('cipher_version');
        if (!encryptionTest) {
          throw new Error('Database encryption verification failed');
        }
        log.info('Database encryption verified');
      }

      log.info('Database connection test successful');
    } catch (error) {
      log.error('Database connection test failed:', error);
      throw error;
    }
  }

  /**
   * Get database status and security information
   */
  public async getStatus(): Promise<DatabaseStatus> {
    try {
      const stats = this.database?.prepare('PRAGMA database_list').all() || [];
      const pageCount = this.database?.prepare('PRAGMA page_count').get() as any;
      const pageSize = this.database?.prepare('PRAGMA page_size').get() as any;
      
      const fileSize = (pageCount?.page_count || 0) * (pageSize?.page_size || 0);
      
      // Check WAL file size if exists
      let walSize: number | undefined;
      try {
        const walInfo = this.database?.prepare('PRAGMA wal_checkpoint(PASSIVE)').get() as any;
        walSize = walInfo ? walInfo.pages_in_wal * (pageSize?.page_size || 0) : 0;
      } catch {
        // WAL mode not enabled or other error
      }

      const recommendations: string[] = [];
      let securityLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';

      // Security assessment
      if (this.config.encryption.enabled) {
        securityLevel = 'HIGH';
      } else {
        recommendations.push('Enable database encryption for production use');
        securityLevel = 'MEDIUM';
      }

      if (!this.config.backup.enabled) {
        recommendations.push('Enable automated backups');
        if (securityLevel === 'HIGH') securityLevel = 'MEDIUM';
      }

      if (!this.config.audit.enabled) {
        recommendations.push('Enable audit logging for compliance');
      }

      if (!this.config.performance.walMode) {
        recommendations.push('Enable WAL mode for better performance');
      }

      return {
        encrypted: this.config.encryption.enabled,
        backupEnabled: this.config.backup.enabled,
        fileSize,
        walSize,
        connections: 1, // SQLite is single-connection
        securityLevel,
        recommendations
      };

    } catch (error) {
      log.error('Failed to get database status:', error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  public close(): void {
    try {
      if (this.database) {
        this.database.close();
        this.database = null;
        this.drizzleDb = null;
        log.info('Database connection closed');
      }
    } catch (error) {
      log.error('Error closing database:', error);
    }
  }

  /**
   * Get database instance (Drizzle ORM)
   */
  public getDatabase(): any {
    return this.drizzleDb;
  }

  /**
   * Get raw SQLite database instance
   */
  public getRawDatabase(): Database.Database | null {
    return this.database;
  }

  /**
   * Get configuration
   */
  public getConfig(): DatabaseSecurityConfig {
    return { ...this.config };
  }
}

// Default configuration
export const defaultSecurityConfig: DatabaseSecurityConfig = {
  encryption: {
    enabled: process.env.NODE_ENV === 'production',
    algorithm: 'AES-256',
    keyDerivation: 'PBKDF2',
    iterations: 100000
  },
  backup: {
    enabled: true,
    schedule: '0 2 * * *',
    retention: {
      daily: 7,
      weekly: 4,
      monthly: 12
    },
    encryption: true,
    compression: true
  },
  audit: {
    enabled: process.env.NODE_ENV === 'production',
    logQueries: false, // Can be performance intensive
    logConnections: true
  },
  performance: {
    walMode: true,
    synchronous: 'NORMAL',
    cacheSize: 2000,
    mmapSize: 268435456
  }
};

// Create singleton instance
export const secureDbManager = new SecureDatabaseManager(defaultSecurityConfig);

// Command-line interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  const runCommand = async () => {
    try {
      switch (command) {
        case '--status':
          await secureDbManager.initializeDatabase();
          const status = await secureDbManager.getStatus();
          console.log('🔒 Database Security Status:');
          console.log('Encrypted:', status.encrypted ? '✅' : '❌');
          console.log('Backup Enabled:', status.backupEnabled ? '✅' : '❌');
          console.log('File Size:', Math.round(status.fileSize / 1024 / 1024 * 100) / 100, 'MB');
          if (status.walSize) {
            console.log('WAL Size:', Math.round(status.walSize / 1024 / 1024 * 100) / 100, 'MB');
          }
          console.log('Security Level:', status.securityLevel);
          if (status.recommendations.length > 0) {
            console.log('\n📋 Recommendations:');
            status.recommendations.forEach((rec, index) => {
              console.log(`${index + 1}. ${rec}`);
            });
          }
          secureDbManager.close();
          break;
          
        default:
          console.log('Usage: tsx server/utils/dbSecurity.ts --status');
          break;
      }
    } catch (error) {
      console.error('❌ Command failed:', error);
      process.exit(1);
    }
  };

  runCommand();
}
