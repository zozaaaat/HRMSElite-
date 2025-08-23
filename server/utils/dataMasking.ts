/**
 * @fileoverview Data Masking and PII Protection Utility
 * @description Provides data masking capabilities for PII protection in non-production environments
 * @author HRMS Elite Team
 * @version 1.0.0
 */

import crypto from 'node:crypto';
import cron from 'node-cron';
import { secureDbManager } from './dbSecurity';
import { log } from './logger';
import { PII_CLASSIFICATION, DEFAULT_RETENTION_CONFIG } from './pii';
import 'dotenv/config';

export interface MaskingConfig {
  environment: 'development' | 'staging' | 'testing';
  rules: MaskingRule[];
  preserveFormat: boolean;
  auditMasking: boolean;
  retentionPolicies: RetentionPolicy[];
}

export interface MaskingRule {
  table: string;
  column: string;
  maskingType: 'full' | 'partial' | 'hash' | 'fake' | 'null';
  preserveLength?: boolean;
  preserveFormat?: boolean;
  conditions?: string; // SQL WHERE conditions
}

export interface RetentionPolicy {
  table: string;
  retentionPeriod: number; // days
  conditions?: string;
  action: 'delete' | 'archive' | 'mask';
  piiFields: string[];
}

export interface MaskingReport {
  tablesProcessed: number;
  recordsProcessed: number;
  fieldsProcessed: number;
  errors: string[];
  startTime: Date;
  endTime: Date;
  environment: string;
}

export class DataMaskingManager {
  private config: MaskingConfig;
  private db: any;

  constructor(config?: Partial<MaskingConfig>) {
    this.config = {
      environment: (process.env.NODE_ENV as any) || 'development',
      preserveFormat: true,
      auditMasking: true,
      rules: this.getDefaultMaskingRules(),
      retentionPolicies: this.getDefaultRetentionPolicies(),
      ...config
    };
  }

  /**
   * Get default masking rules for PII fields
   */
  private getDefaultMaskingRules(): MaskingRule[] {
    const rules: MaskingRule[] = [];
    for (const [table, fields] of Object.entries(PII_CLASSIFICATION)) {
      for (const [column] of Object.entries(fields)) {
        const maskingType = column === 'sess' ? 'hash' : 'partial';
        rules.push({ table, column, maskingType, preserveFormat: true });
      }
    }
    return rules;
  }

  /**
   * Get default retention policies
   */
  private getDefaultRetentionPolicies(): RetentionPolicy[] {
    return Object.entries(DEFAULT_RETENTION_CONFIG).map(([table, cfg]) => ({
      table,
      ...cfg,
    }));
  }

  /**
   * Generate fake data based on field type
   */
  private generateFakeData(fieldName: string, originalValue: string | null): string {
    if (!originalValue) return '';

    const fakeNames = ['Ahmed', 'Fatima', 'Mohammed', 'Aisha', 'Omar', 'Layla', 'Ali', 'Nour'];
    const fakeSurnames = ['Al-Ahmad', 'Al-Mohammed', 'Al-Hassan', 'Al-Salem', 'Al-Rashid', 'Al-Mansouri'];
    const fakeAddresses = ['123 Kuwait City', '456 Hawalli', '789 Farwaniya', '101 Ahmadi', '202 Jahra'];

    switch (fieldName.toLowerCase()) {
      case 'firstname':
      case 'first_name':
        return fakeNames[Math.floor(Math.random() * fakeNames.length)];
      
      case 'lastname':
      case 'last_name':
        return fakeSurnames[Math.floor(Math.random() * fakeSurnames.length)];
      
      case 'arabicname':
      case 'englishname':
        const firstName = fakeNames[Math.floor(Math.random() * fakeNames.length)];
        const lastName = fakeSurnames[Math.floor(Math.random() * fakeSurnames.length)];
        return `${firstName} ${lastName}`;
      
      case 'address':
        return fakeAddresses[Math.floor(Math.random() * fakeAddresses.length)];
      
      case 'emergencycontact':
        return fakeNames[Math.floor(Math.random() * fakeNames.length)] + ' ' + 
               fakeSurnames[Math.floor(Math.random() * fakeSurnames.length)];
      
      case 'fileurl':
        return '/fake/documents/masked-document.pdf';
      
      default:
        return 'MASKED_DATA';
    }
  }

  /**
   * Mask data based on masking type
   */
  private maskValue(value: string | null, rule: MaskingRule): string | null {
    if (!value) return value;

    switch (rule.maskingType) {
      case 'full':
        return '*'.repeat(rule.preserveLength ? value.length : 8);

      case 'partial':
        if (rule.preserveFormat && value.includes('@')) {
          // Email masking
          const [local, domain] = value.split('@');
          const maskedLocal = local.length > 2 ? 
            local.substring(0, 2) + '*'.repeat(local.length - 2) : 
            '*'.repeat(local.length);
          return `${maskedLocal}@${domain}`;
        } else if (rule.preserveFormat && /^\+?\d+$/.test(value)) {
          // Phone number masking
          const visibleDigits = Math.min(4, Math.floor(value.length / 2));
          const maskedPart = '*'.repeat(value.length - visibleDigits);
          return value.substring(0, visibleDigits) + maskedPart;
        } else if (rule.preserveFormat && /^\d+$/.test(value)) {
          // Numeric ID masking (show first and last 2 digits)
          if (value.length <= 4) return '*'.repeat(value.length);
          const start = value.substring(0, 2);
          const end = value.substring(value.length - 2);
          const middle = '*'.repeat(value.length - 4);
          return start + middle + end;
        } else {
          // Generic partial masking
          const visibleChars = Math.min(3, Math.floor(value.length / 3));
          return value.substring(0, visibleChars) + '*'.repeat(value.length - visibleChars);
        }

      case 'hash':
        return crypto.createHash('sha256').update(value).digest('hex').substring(0, 16);

      case 'fake':
        return this.generateFakeData(rule.column, value);

      case 'null':
        return null;

      default:
        return value;
    }
  }

  /**
   * Apply masking rules to database
   */
  public async applyMasking(): Promise<MaskingReport> {
    const report: MaskingReport = {
      tablesProcessed: 0,
      recordsProcessed: 0,
      fieldsProcessed: 0,
      errors: [],
      startTime: new Date(),
      endTime: new Date(),
      environment: this.config.environment
    };

    try {
      // Prevent masking in production
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Data masking is not allowed in production environment');
      }

      // Initialize database connection
      await secureDbManager.initializeDatabase();
      this.db = secureDbManager.getRawDatabase();

      log.info('Starting data masking process:', {
        environment: this.config.environment,
        rulesCount: this.config.rules.length
      });

      // Group rules by table
      const rulesByTable = this.config.rules.reduce((acc, rule) => {
        if (!acc[rule.table]) acc[rule.table] = [];
        acc[rule.table].push(rule);
        return acc;
      }, {} as Record<string, MaskingRule[]>);

      // Process each table
      for (const [tableName, rules] of Object.entries(rulesByTable)) {
        try {
          await this.maskTable(tableName, rules, report);
          report.tablesProcessed++;
        } catch (error) {
          const errorMsg = `Failed to mask table ${tableName}: ${error.message}`;
          report.errors.push(errorMsg);
          log.error(errorMsg, error);
        }
      }

      // Apply retention policies
      await this.applyRetentionPolicies(report);

      report.endTime = new Date();

      log.info('Data masking completed:', {
        tablesProcessed: report.tablesProcessed,
        recordsProcessed: report.recordsProcessed,
        fieldsProcessed: report.fieldsProcessed,
        errors: report.errors.length,
        duration: report.endTime.getTime() - report.startTime.getTime()
      });

      return report;

    } catch (error) {
      report.errors.push(`Masking process failed: ${error.message}`);
      log.error('Data masking failed:', error);
      throw error;
    }
  }

  /**
   * Mask a specific table
   */
  private async maskTable(tableName: string, rules: MaskingRule[], report: MaskingReport): Promise<void> {
    try {
      // Check if table exists
      const tableExists = this.db.prepare(`
        SELECT name FROM sqlite_master WHERE type='table' AND name=?
      `).get(tableName);

      if (!tableExists) {
        log.warn(`Table ${tableName} does not exist, skipping`);
        return;
      }

      // Get all records
      let query = `SELECT * FROM ${tableName}`;
      
      // Apply conditions if any rule has them
      const conditionsRule = rules.find(r => r.conditions);
      if (conditionsRule) {
        query += ` WHERE ${conditionsRule.conditions}`;
      }

      const records = this.db.prepare(query).all();
      
      if (records.length === 0) {
        log.info(`No records to mask in table ${tableName}`);
        return;
      }

      // Prepare update statement
      const columns = rules.map(r => r.column);
      const updateQuery = `
        UPDATE ${tableName} 
        SET ${columns.map(col => `${col} = ?`).join(', ')} 
        WHERE id = ?
      `;
      const updateStmt = this.db.prepare(updateQuery);

      // Process each record
      const transaction = this.db.transaction((records: any[]) => {
        for (const record of records) {
          const maskedValues: any[] = [];
          
          for (const rule of rules) {
            const originalValue = record[rule.column];
            const maskedValue = this.maskValue(originalValue, rule);
            maskedValues.push(maskedValue);
            
            if (originalValue !== maskedValue) {
              report.fieldsProcessed++;
            }
          }
          
          // Add record ID for WHERE clause
          maskedValues.push(record.id);
          
          updateStmt.run(...maskedValues);
          report.recordsProcessed++;
        }
      });

      transaction(records);

      log.info(`Masked ${records.length} records in table ${tableName}`);

    } catch (error) {
      log.error(`Failed to mask table ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Apply retention policies
   */
  private async applyRetentionPolicies(report: MaskingReport): Promise<void> {
    try {
      log.info('Applying retention policies:', { policies: this.config.retentionPolicies.length });

      for (const policy of this.config.retentionPolicies) {
        try {
          await this.applyRetentionPolicy(policy, report);
        } catch (error) {
          const errorMsg = `Failed to apply retention policy for ${policy.table}: ${error.message}`;
          report.errors.push(errorMsg);
          log.error(errorMsg, error);
        }
      }

    } catch (error) {
      log.error('Failed to apply retention policies:', error);
      throw error;
    }
  }

  /**
   * Apply a specific retention policy
   */
  private async applyRetentionPolicy(policy: RetentionPolicy, report: MaskingReport): Promise<void> {
    try {
      // Check if table exists
      const tableExists = this.db.prepare(`
        SELECT name FROM sqlite_master WHERE type='table' AND name=?
      `).get(policy.table);

      if (!tableExists) {
        log.warn(`Table ${policy.table} does not exist, skipping retention policy`);
        return;
      }

      // Get records matching retention criteria
      const query = `SELECT * FROM ${policy.table} WHERE ${policy.conditions}`;
      const records = this.db.prepare(query).all();

      if (records.length === 0) {
        log.info(`No records match retention policy for table ${policy.table}`);
        return;
      }

      switch (policy.action) {
        case 'delete':
          const deleteQuery = `DELETE FROM ${policy.table} WHERE ${policy.conditions}`;
          const deleteResult = this.db.prepare(deleteQuery).run();
          log.info(`Deleted ${deleteResult.changes} records from ${policy.table} per retention policy`);
          break;

        case 'mask':
          // Apply masking to PII fields
          const maskRules: MaskingRule[] = policy.piiFields.map(field => ({
            table: policy.table,
            column: field,
            maskingType: 'hash' as const
          }));
          
          const updateQuery = `
            UPDATE ${policy.table} 
            SET ${policy.piiFields.map(field => `${field} = ?`).join(', ')} 
            WHERE id = ? AND ${policy.conditions}
          `;
          const updateStmt = this.db.prepare(updateQuery);

          const transaction = this.db.transaction((records: any[]) => {
            for (const record of records) {
              const maskedValues = policy.piiFields.map(field => {
                return this.maskValue(record[field], { 
                  table: policy.table, 
                  column: field, 
                  maskingType: 'hash' 
                });
              });
              maskedValues.push(record.id);
              updateStmt.run(...maskedValues);
            }
          });

          transaction(records);
          log.info(`Masked ${records.length} records in ${policy.table} per retention policy`);
          break;

        case 'archive':
          // For now, we'll just log archival (could implement actual archiving later)
          log.info(`Would archive ${records.length} records from ${policy.table} per retention policy`);
          break;
      }

    } catch (error) {
      log.error(`Failed to apply retention policy for ${policy.table}:`, error);
      throw error;
    }
  }

  /**
   * Run retention policies immediately
   */
  public async runRetentionPolicies(): Promise<void> {
    await secureDbManager.initializeDatabase();
    this.db = secureDbManager.getRawDatabase();
    const report: MaskingReport = {
      tablesProcessed: 0,
      recordsProcessed: 0,
      fieldsProcessed: 0,
      errors: [],
      startTime: new Date(),
      endTime: new Date(),
      environment: this.config.environment
    };
    await this.applyRetentionPolicies(report);
  }

  /**
   * Schedule automated retention execution
   */
  public scheduleRetentionJobs(schedule = '0 3 * * *'): void {
    cron.schedule(schedule, () => {
      this.runRetentionPolicies().catch(err => log.error('Retention job failed:', err));
    });
  }

  /**
   * Generate masking report
   */
  public async generateMaskingReport(): Promise<string> {
    try {
      const report = await this.applyMasking();
      
      const reportContent = `
# Data Masking Report

**Environment:** ${report.environment}
**Date:** ${report.startTime.toISOString()}
**Duration:** ${report.endTime.getTime() - report.startTime.getTime()}ms

## Summary
- **Tables Processed:** ${report.tablesProcessed}
- **Records Processed:** ${report.recordsProcessed}
- **Fields Processed:** ${report.fieldsProcessed}
- **Errors:** ${report.errors.length}

## Masking Rules Applied
${this.config.rules.map(rule => 
  `- **${rule.table}.${rule.column}**: ${rule.maskingType}${rule.conditions ? ` (${rule.conditions})` : ''}`
).join('\n')}

## Retention Policies Applied
${this.config.retentionPolicies.map(policy => 
  `- **${policy.table}**: ${policy.action} after ${policy.retentionPeriod} days`
).join('\n')}

${report.errors.length > 0 ? `## Errors\n${report.errors.map(error => `- ${error}`).join('\n')}` : ''}

---
*Generated by HRMS Elite Data Masking System*
`;

      return reportContent;

    } catch (error) {
      log.error('Failed to generate masking report:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const dataMaskingManager = new DataMaskingManager();

// Command-line interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  const runCommand = async () => {
    try {
      switch (command) {
        case '--mask':
          console.log('🎭 Starting data masking process...');
          const report = await dataMaskingManager.applyMasking();
          console.log('✅ Data masking completed successfully:');
          console.log('Tables processed:', report.tablesProcessed);
          console.log('Records processed:', report.recordsProcessed);
          console.log('Fields processed:', report.fieldsProcessed);
          if (report.errors.length > 0) {
            console.log('❌ Errors:', report.errors.length);
            report.errors.forEach(error => console.log('  -', error));
          }
          break;

        case '--report':
          console.log('📊 Generating masking report...');
          const reportContent = await dataMaskingManager.generateMaskingReport();
          console.log(reportContent);
          break;

        default:
          console.log('Usage:');
          console.log('  npm run db:mask-data     - Apply data masking');
          console.log('  tsx server/utils/dataMasking.ts --report - Generate report');
          break;
      }
    } catch (error) {
      console.error('❌ Command failed:', error);
      process.exit(1);
    }
  };

  runCommand();
}
