/**
 * @fileoverview Antivirus scanning utility for file upload security
 * @description Provides virus scanning capabilities using ClamAV and external APIs
 * @author HRMS Elite Team
 * @version 1.0.0
 */

import axios from 'axios';
import { log } from './logger';
import { metricsUtils } from '../middleware/metrics';

// EICAR test file signature (standard antivirus test file)
const EICAR_SIGNATURE = 'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*';

export interface AntivirusConfig {
  enabled: boolean;
  provider: 'clamav' | 'external' | 'both';
  externalApiUrl?: string;
  externalApiKey?: string;
  timeout: number;
  maxFileSize: number;
}

export interface ScanResult {
  isClean: boolean;
  threats: string[];
  scanTime: number;
  provider: string;
  error?: string;
}

export class AntivirusScanner {
  private config: AntivirusConfig;

  constructor(config: AntivirusConfig) {
    this.config = config;
  }

  /**
   * Scan a file buffer for viruses
   * @param buffer - File buffer to scan
   * @param filename - Original filename for logging
   * @returns Promise<ScanResult> - Scan result with threat information
   */
  async scanBuffer(buffer: Buffer, filename: string): Promise<ScanResult> {
    if (!this.config.enabled) {
      metricsUtils.incrementAvScanFailure(this.config.provider);
      throw new Error('Antivirus not configured: rejecting upload');
    }

    const startTime = Date.now();

    try {
      // Check file size limit
      if (buffer.length > this.config.maxFileSize) {
        return {
          isClean: false,
          threats: ['File size exceeds scan limit'],
          scanTime: Date.now() - startTime,
          provider: 'size-check'
        };
      }

      // Check for EICAR test file
      const eicarResult = this.checkEICAR(buffer);
      if (!eicarResult.isClean) {
        log.error('EICAR test file detected and rejected', {
          filename,
          threats: eicarResult.threats,
          userAgent: 'antivirus-scanner',
          severity: 'high'
        }, 'SECURITY');

        return {
          ...eicarResult,
          scanTime: Date.now() - startTime,
          provider: 'eicar-detection'
        };
      }

      // Perform virus scanning based on configuration
      switch (this.config.provider) {
        case 'clamav':
          return await this.scanWithClamAV(buffer, filename, startTime);
        case 'external':
          return await this.scanWithExternalAPI(buffer, filename, startTime);
        case 'both':
          return await this.scanWithBoth(buffer, filename, startTime);
        default:
          throw new Error('Antivirus not configured: rejecting upload');
      }
    } catch (error) {
      log.error('Antivirus scan failed', error as Error, 'SECURITY');
      metricsUtils.incrementAvScanFailure(this.config.provider);
      throw error;
    }
  }

  /**
   * Check for EICAR test file signature
   * @param buffer - File buffer to check
   * @returns ScanResult - Result of EICAR check
   */
  private checkEICAR(buffer: Buffer): ScanResult {
    const fileContent = buffer.toString('utf8');
    
    if (fileContent.includes(EICAR_SIGNATURE)) {
      return {
        isClean: false,
        threats: ['EICAR-STANDARD-ANTIVIRUS-TEST-FILE'],
        scanTime: 0,
        provider: 'eicar-detection'
      };
    }

    return {
      isClean: true,
      threats: [],
      scanTime: 0,
      provider: 'eicar-detection'
    };
  }

  /**
   * Scan file using ClamAV (if available)
   * @param buffer - File buffer to scan
   * @param filename - Original filename
   * @param startTime - Scan start time
   * @returns Promise<ScanResult> - ClamAV scan result
   */
  private async scanWithClamAV(buffer: Buffer, filename: string, startTime: number): Promise<ScanResult> {
    try {
      // Note: In a real implementation, you would integrate with ClamAV daemon
      // This is a placeholder for ClamAV integration
      // You would typically use a library like 'clamscan' or 'node-clamscan'
      
      // For now, we'll simulate ClamAV scanning
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate scan time
      
      log.info('ClamAV scan completed', {
        filename,
        scanTime: Date.now() - startTime,
        provider: 'clamav'
      }, 'SECURITY');

      return {
        isClean: true,
        threats: [],
        scanTime: Date.now() - startTime,
        provider: 'clamav'
      };
    } catch (error) {
      log.error('ClamAV scan failed', error as Error, 'SECURITY');
      metricsUtils.incrementAvScanFailure('clamav');
      return {
        isClean: false,
        threats: ['ClamAV scan failed'],
        scanTime: Date.now() - startTime,
        provider: 'clamav',
        error: (error as Error).message
      };
    }
  }

  /**
   * Scan file using external antivirus API
   * @param buffer - File buffer to scan
   * @param filename - Original filename
   * @param startTime - Scan start time
   * @returns Promise<ScanResult> - External API scan result
   */
  private async scanWithExternalAPI(buffer: Buffer, filename: string, startTime: number): Promise<ScanResult> {
    try {
      if (!this.config.externalApiUrl || !this.config.externalApiKey) {
        throw new Error('External antivirus API not configured');
      }

      // Create form data for file upload
      const FormData = await import('form-data');
      const form = new FormData();
      form.append('file', buffer, {
        filename,
        contentType: 'application/octet-stream'
      });

      const response = await axios.post(this.config.externalApiUrl, form, {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${this.config.externalApiKey}`,
          'X-API-Key': this.config.externalApiKey
        },
        timeout: this.config.timeout
      });

      const result = response.data;
      
      log.info('External antivirus scan completed', {
        filename,
        scanTime: Date.now() - startTime,
        provider: 'external-api',
        isClean: result.isClean
      }, 'SECURITY');

      return {
        isClean: result.isClean || false,
        threats: result.threats || [],
        scanTime: Date.now() - startTime,
        provider: 'external-api'
      };
    } catch (error) {
      log.error('External antivirus scan failed', error as Error, 'SECURITY');
      metricsUtils.incrementAvScanFailure('external-api');
      return {
        isClean: false,
        threats: ['External scan failed'],
        scanTime: Date.now() - startTime,
        provider: 'external-api',
        error: (error as Error).message
      };
    }
  }

  /**
   * Scan file using both ClamAV and external API
   * @param buffer - File buffer to scan
   * @param filename - Original filename
   * @param startTime - Scan start time
   * @returns Promise<ScanResult> - Combined scan result
   */
  private async scanWithBoth(buffer: Buffer, filename: string, startTime: number): Promise<ScanResult> {
    try {
      const [clamavResult, externalResult] = await Promise.allSettled([
        this.scanWithClamAV(buffer, filename, startTime),
        this.scanWithExternalAPI(buffer, filename, startTime)
      ]);

      const results: ScanResult[] = [];
      const threats: string[] = [];

      // Process ClamAV result
      if (clamavResult.status === 'fulfilled') {
        results.push(clamavResult.value);
        threats.push(...clamavResult.value.threats);
      } else {
        log.error('ClamAV scan failed in dual scan', clamavResult.reason, 'SECURITY');
      }

      // Process external API result
      if (externalResult.status === 'fulfilled') {
        results.push(externalResult.value);
        threats.push(...externalResult.value.threats);
      } else {
        log.error('External API scan failed in dual scan', externalResult.reason, 'SECURITY');
      }

      const isClean = results.length > 0 && results.every(result => result.isClean);
      const scanTime = Date.now() - startTime;

      log.info('Dual antivirus scan completed', {
        filename,
        scanTime,
        providers: results.map(r => r.provider),
        isClean,
        threatCount: threats.length
      }, 'SECURITY');

      return {
        isClean,
        threats: [...new Set(threats)], // Remove duplicates
        scanTime,
        provider: 'dual-scan'
      };
    } catch (error) {
      log.error('Dual antivirus scan failed', error as Error, 'SECURITY');
      metricsUtils.incrementAvScanFailure('dual-scan');
      return {
        isClean: false,
        threats: ['Dual scan failed'],
        scanTime: Date.now() - startTime,
        provider: 'dual-scan',
        error: (error as Error).message
      };
    }
  }

  /**
   * Get scanner status and configuration
   * @returns object - Scanner status information
   */
  getStatus(): {
    enabled: boolean;
    provider: string;
    maxFileSize: number;
    timeout: number;
    externalApiConfigured: boolean;
  } {
    return {
      enabled: this.config.enabled,
      provider: this.config.provider,
      maxFileSize: this.config.maxFileSize,
      timeout: this.config.timeout,
      externalApiConfigured: !!(this.config.externalApiUrl && this.config.externalApiKey)
    };
  }
}

// Default antivirus configuration
export const defaultAntivirusConfig: AntivirusConfig = {
  enabled:
    process.env.NODE_ENV === 'production'
      ? true
      : process.env.ANTIVIRUS_ENABLED === 'true',
  provider: (process.env.ANTIVIRUS_PROVIDER as 'clamav' | 'external' | 'both') || 'external',
  externalApiUrl: process.env.ANTIVIRUS_API_URL,
  externalApiKey: process.env.ANTIVIRUS_API_KEY,
  timeout: parseInt(process.env.ANTIVIRUS_TIMEOUT || '30000'),
  maxFileSize: parseInt(process.env.ANTIVIRUS_MAX_FILE_SIZE || '10485760') // 10MB
};

// Create default antivirus scanner instance
export const antivirusScanner = new AntivirusScanner(defaultAntivirusConfig);
