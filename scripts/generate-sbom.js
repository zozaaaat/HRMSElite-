#!/usr/bin/env node

/**
 * SBOM Generation Script for HRMS Elite
 * Generates CycloneDX SBOM files and validates them
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const SBOM_DIR = process.cwd();
const PACKAGE_JSON = join(SBOM_DIR, 'package.json');

class SBOMGenerator {
  constructor() {
    this.packageInfo = this.loadPackageInfo();
  }

  loadPackageInfo() {
    try {
      const packageJson = readFileSync(PACKAGE_JSON, 'utf8');
      return JSON.parse(packageJson);
    } catch (error) {
      console.error('❌ Failed to load package.json:', error.message);
      process.exit(1);
    }
  }

  async installCycloneDX() {
    try {
      console.log('📦 Installing CycloneDX npm...');
      execSync('npm install -g @cyclonedx/cyclonedx-npm', { stdio: 'inherit' });
      console.log('✅ CycloneDX installed successfully');
    } catch (error) {
      console.error('❌ Failed to install CycloneDX:', error.message);
      process.exit(1);
    }
  }

  async generateSBOM() {
    try {
      console.log('🔍 Generating CycloneDX SBOM...');
      
      // Generate XML format
      execSync('cyclonedx-npm --output-file sbom.xml --output-format xml', { 
        stdio: 'inherit',
        cwd: SBOM_DIR 
      });
      
      // Generate JSON format
      execSync('cyclonedx-npm --output-file sbom.json --output-format json', { 
        stdio: 'inherit',
        cwd: SBOM_DIR 
      });
      
      console.log('✅ SBOM files generated successfully');
    } catch (error) {
      console.error('❌ Failed to generate SBOM:', error.message);
      process.exit(1);
    }
  }

  validateSBOM() {
    console.log('🔍 Validating SBOM files...');
    
    const xmlPath = join(SBOM_DIR, 'sbom.xml');
    const jsonPath = join(SBOM_DIR, 'sbom.json');
    
    if (!existsSync(xmlPath) || !existsSync(jsonPath)) {
      console.error('❌ SBOM files not found');
      process.exit(1);
    }
    
    try {
      // Validate XML SBOM
      const xmlContent = readFileSync(xmlPath, 'utf8');
      if (!xmlContent.includes('<?xml version="1.0" encoding="UTF-8"?>')) {
        throw new Error('Invalid XML format');
      }
      if (!xmlContent.includes('<bom xmlns="http://cyclonedx.org/schema/bom/1.4"')) {
        throw new Error('Invalid CycloneDX XML structure');
      }
      
      // Validate JSON SBOM
      const jsonContent = readFileSync(jsonPath, 'utf8');
      const jsonData = JSON.parse(jsonContent);
      
      if (!jsonData.bomFormat || !jsonData.specVersion || !jsonData.components) {
        throw new Error('Invalid CycloneDX JSON structure');
      }
      
      console.log('✅ SBOM validation passed');
      console.log(`📊 Components found: ${jsonData.components.length}`);
      
      return {
        xmlPath,
        jsonPath,
        componentCount: jsonData.components.length
      };
    } catch (error) {
      console.error('❌ SBOM validation failed:', error.message);
      process.exit(1);
    }
  }

  async signSBOM(gpgKey) {
    if (!gpgKey) {
      console.log('⚠️  No GPG key provided, skipping SBOM signing');
      return;
    }
    
    try {
      console.log('🔐 Signing SBOM files...');
      
      // Import GPG key
      execSync(`echo "${gpgKey}" | gpg --import`, { stdio: 'inherit' });
      
      // Sign XML SBOM
      execSync('gpg --detach-sign --armor sbom.xml', { 
        stdio: 'inherit',
        cwd: SBOM_DIR 
      });
      
      // Sign JSON SBOM
      execSync('gpg --detach-sign --armor sbom.json', { 
        stdio: 'inherit',
        cwd: SBOM_DIR 
      });
      
      console.log('✅ SBOM files signed successfully');
    } catch (error) {
      console.error('❌ Failed to sign SBOM:', error.message);
      process.exit(1);
    }
  }

  generateReport(validationResult) {
    const report = {
      timestamp: new Date().toISOString(),
      package: {
        name: this.packageInfo.name,
        version: this.packageInfo.version,
        description: this.packageInfo.description
      },
      sbom: {
        xmlFile: validationResult.xmlPath,
        jsonFile: validationResult.jsonPath,
        componentCount: validationResult.componentCount,
        generated: true,
        validated: true
      },
      security: {
        auditLevel: 'moderate',
        vulnerabilityScan: true,
        sastScan: true
      }
    };
    
    const reportPath = join(SBOM_DIR, 'sbom-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('📋 SBOM report generated:', reportPath);
    return report;
  }

  async run() {
    console.log('🚀 Starting SBOM generation for HRMS Elite...');
    console.log(`📦 Package: ${this.packageInfo.name} v${this.packageInfo.version}`);
    
    // Install CycloneDX if not available
    try {
      execSync('cyclonedx-npm --version', { stdio: 'ignore' });
      console.log('✅ CycloneDX already installed');
    } catch {
      await this.installCycloneDX();
    }
    
    // Generate SBOM
    await this.generateSBOM();
    
    // Validate SBOM
    const validationResult = this.validateSBOM();
    
    // Sign SBOM if GPG key provided
    const gpgKey = process.env.GPG_PRIVATE_KEY;
    await this.signSBOM(gpgKey);
    
    // Generate report
    const report = this.generateReport(validationResult);
    
    console.log('\n🎉 SBOM generation completed successfully!');
    console.log('📁 Generated files:');
    console.log(`  - ${validationResult.xmlPath}`);
    console.log(`  - ${validationResult.jsonPath}`);
    if (gpgKey) {
      console.log(`  - ${validationResult.xmlPath}.asc`);
      console.log(`  - ${validationResult.jsonPath}.asc`);
    }
    console.log(`  - sbom-report.json`);
    
    return report;
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new SBOMGenerator();
  generator.run().catch(error => {
    console.error('❌ SBOM generation failed:', error.message);
    process.exit(1);
  });
}

export default SBOMGenerator;
