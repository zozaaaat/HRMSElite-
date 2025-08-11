#!/usr/bin/env node

/**
 * Quick PWA Test Script
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Quick PWA Test...\n');
console.log('Current directory:', process.cwd());
console.log('Script directory:', __dirname);

// Test 1: Check manifest
try {
  const manifestPath = path.join(__dirname, '../public/manifest.json');
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    console.log('✅ Manifest file exists and is valid JSON');
    console.log(`   Name: ${manifest.name}`);
    console.log(`   Short name: ${manifest.short_name}`);
    console.log(`   Display: ${manifest.display}`);
  } else {
    console.log('❌ Manifest file not found');
  }
} catch (error) {
  console.log('❌ Error reading manifest:', error.message);
}

// Test 2: Check service worker
try {
  const swPath = path.join(__dirname, '../public/sw.js');
  if (fs.existsSync(swPath)) {
    console.log('✅ Service worker exists');
    const swContent = fs.readFileSync(swPath, 'utf8');
    if (swContent.includes('install') && swContent.includes('fetch')) {
      console.log('✅ Service worker has required events');
    } else {
      console.log('⚠️  Service worker missing some events');
    }
  } else {
    console.log('❌ Service worker not found');
  }
} catch (error) {
  console.log('❌ Error reading service worker:', error.message);
}

// Test 3: Check Vite config
try {
  const viteConfigPath = path.join(__dirname, '../vite.config.ts');
  if (fs.existsSync(viteConfigPath)) {
    const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
    if (viteConfig.includes('VitePWA')) {
      console.log('✅ Vite PWA plugin configured');
    } else {
      console.log('❌ Vite PWA plugin not found');
    }
  } else {
    console.log('❌ Vite config not found');
  }
} catch (error) {
  console.log('❌ Error reading Vite config:', error.message);
}

// Test 4: Check icons
try {
  const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
  let foundIcons = 0;
  
  for (const size of iconSizes) {
    const iconPath = path.join(__dirname, '../public', `icon-${size}x${size}.png`);
    if (fs.existsSync(iconPath)) {
      foundIcons++;
    }
  }
  
  if (foundIcons > 0) {
    console.log(`✅ Found ${foundIcons}/${iconSizes.length} icons`);
  } else {
    console.log('⚠️  No PWA icons found - these need to be created');
    console.log('   Icons should be placed in: public/icon-{size}x{size}.png');
    console.log('   Required sizes: 72, 96, 128, 144, 152, 192, 384, 512');
  }
} catch (error) {
  console.log('❌ Error checking icons:', error.message);
}

console.log('\n🎉 PWA test completed!'); 