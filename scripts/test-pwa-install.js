#!/usr/bin/env node

/**
 * @fileoverview PWA Installation Test Script
 * @description Tests PWA installation functionality and requirements
 * @author HRMS Elite Team
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Test PWA installation requirements
 */
async function testPWAInstallation() {
  console.log('🔍 Testing PWA Installation Requirements...\n');

  const tests = [
    {
      name: 'Manifest File',
      test: () => {
        const manifestPath = path.join(__dirname, '../public/manifest.json');
        if (!fs.existsSync(manifestPath)) {
          throw new Error('manifest.json not found');
        }
        
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
        
        for (const field of requiredFields) {
          if (!manifest[field]) {
            throw new Error(`Missing required field: ${field}`);
          }
        }
        
        return '✅ Manifest file is valid';
      }
    },
    {
      name: 'Service Worker',
      test: () => {
        const swPath = path.join(__dirname, '../public/sw.js');
        if (!fs.existsSync(swPath)) {
          throw new Error('Service worker not found');
        }
        
        const swContent = fs.readFileSync(swPath, 'utf8');
        if (!swContent.includes('install') || !swContent.includes('fetch')) {
          throw new Error('Service worker missing required events');
        }
        
        return '✅ Service worker is valid';
      }
    },
    {
      name: 'HTTPS Configuration',
      test: () => {
        // Check if running in production or with HTTPS
        const isHTTPS = process.env.NODE_ENV === 'production' || 
                       process.env.HTTPS === 'true' ||
                       process.env.SSL_CRT_FILE;
        
        if (!isHTTPS) {
          console.warn('⚠️  HTTPS not detected - PWA features may not work in production');
        }
        
        return '✅ HTTPS configuration checked';
      }
    },
    {
      name: 'Icons',
      test: () => {
        const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
        const publicDir = path.join(__dirname, '../public');
        
        for (const size of iconSizes) {
          const iconPath = path.join(publicDir, `icon-${size}x${size}.png`);
          if (!fs.existsSync(iconPath)) {
            throw new Error(`Missing icon: icon-${size}x${size}.png`);
          }
        }
        
        return '✅ All required icons present';
      }
    },
    {
      name: 'Vite PWA Plugin',
      test: () => {
        const viteConfigPath = path.join(__dirname, '../vite.config.ts');
        if (!fs.existsSync(viteConfigPath)) {
          throw new Error('vite.config.ts not found');
        }
        
        const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
        if (!viteConfig.includes('VitePWA')) {
          throw new Error('VitePWA plugin not configured');
        }
        
        return '✅ Vite PWA plugin configured';
      }
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = test.test();
      console.log(`${result}`);
      passed++;
    } catch (error) {
      console.error(`❌ ${test.name}: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    console.error('\n❌ PWA installation test failed');
    process.exit(1);
  } else {
    console.log('\n✅ PWA installation test passed');
  }
}

/**
 * Main execution
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  testPWAInstallation().catch(console.error);
}

export default testPWAInstallation; 