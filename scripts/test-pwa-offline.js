#!/usr/bin/env node

/**
 * @fileoverview PWA Offline Functionality Test Script
 * @description Tests PWA offline capabilities and caching
 * @author HRMS Elite Team
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Test PWA offline functionality
 */
async function testPWAOffline() {
  console.log('🔍 Testing PWA Offline Functionality...\n');

  const tests = [
    {
      name: 'Service Worker Caching',
      test: () => {
        const swPath = path.join(__dirname, '../public/sw.js');
        if (!fs.existsSync(swPath)) {
          throw new Error('Service worker not found');
        }
        
        const swContent = fs.readFileSync(swPath, 'utf8');
        
        // Check for caching strategies
        const hasCacheFirst = swContent.includes('CacheFirst') || swContent.includes('cache-first');
        const hasNetworkFirst = swContent.includes('NetworkFirst') || swContent.includes('network-first');
        const hasStaleWhileRevalidate = swContent.includes('StaleWhileRevalidate') || swContent.includes('stale-while-revalidate');
        
        if (!hasCacheFirst && !hasNetworkFirst && !hasStaleWhileRevalidate) {
          throw new Error('No caching strategies found in service worker');
        }
        
        return '✅ Service worker caching configured';
      }
    },
    {
      name: 'Cache Manifest',
      test: () => {
        const swPath = path.join(__dirname, '../public/sw.js');
        const swContent = fs.readFileSync(swPath, 'utf8');
        
        // Check for cache manifest or URLs to cache
        const hasCacheUrls = swContent.includes('urlsToCache') || 
                           swContent.includes('CACHE_NAME') ||
                           swContent.includes('globPatterns');
        
        if (!hasCacheUrls) {
          throw new Error('No cache URLs or patterns found');
        }
        
        return '✅ Cache manifest configured';
      }
    },
    {
      name: 'Offline Fallback',
      test: () => {
        const swPath = path.join(__dirname, '../public/sw.js');
        const swContent = fs.readFileSync(swPath, 'utf8');
        
        // Check for offline fallback handling
        const hasOfflineFallback = swContent.includes('offline') || 
                                 swContent.includes('fallback') ||
                                 swContent.includes('caches.match');
        
        if (!hasOfflineFallback) {
          throw new Error('No offline fallback handling found');
        }
        
        return '✅ Offline fallback configured';
      }
    },
    {
      name: 'Background Sync',
      test: () => {
        const swPath = path.join(__dirname, '../public/sw.js');
        const swContent = fs.readFileSync(swPath, 'utf8');
        
        // Check for background sync support
        const hasBackgroundSync = swContent.includes('background-sync') || 
                                swContent.includes('sync') ||
                                swContent.includes('backgroundSync');
        
        if (!hasBackgroundSync) {
          console.warn('⚠️  Background sync not configured - offline data sync may not work');
        }
        
        return '✅ Background sync checked';
      }
    },
    {
      name: 'Cache Versioning',
      test: () => {
        const swPath = path.join(__dirname, '../public/sw.js');
        const swContent = fs.readFileSync(swPath, 'utf8');
        
        // Check for cache versioning
        const hasCacheVersion = swContent.includes('CACHE_NAME') || 
                              swContent.includes('cacheName') ||
                              swContent.includes('version');
        
        if (!hasCacheVersion) {
          throw new Error('No cache versioning found');
        }
        
        return '✅ Cache versioning configured';
      }
    },
    {
      name: 'Cache Cleanup',
      test: () => {
        const swPath = path.join(__dirname, '../public/sw.js');
        const swContent = fs.readFileSync(swPath, 'utf8');
        
        // Check for cache cleanup on activation
        const hasCacheCleanup = swContent.includes('activate') && 
                              (swContent.includes('caches.delete') || 
                               swContent.includes('caches.keys'));
        
        if (!hasCacheCleanup) {
          console.warn('⚠️  Cache cleanup not configured - old caches may accumulate');
        }
        
        return '✅ Cache cleanup checked';
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
    console.error('\n❌ PWA offline test failed');
    process.exit(1);
  } else {
    console.log('\n✅ PWA offline test passed');
  }
}

/**
 * Main execution
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  testPWAOffline().catch(console.error);
}

export default testPWAOffline; 