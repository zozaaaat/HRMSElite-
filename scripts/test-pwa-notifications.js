#!/usr/bin/env node

/**
 * @fileoverview PWA Push Notifications Test Script
 * @description Tests PWA push notification functionality
 * @author HRMS Elite Team
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Test PWA push notifications
 */
async function testPWANotifications() {
  console.log('🔍 Testing PWA Push Notifications...\n');

  const tests = [
    {
      name: 'Push Event Handler',
      test: () => {
        const swPath = path.join(__dirname, '../public/sw.js');
        if (!fs.existsSync(swPath)) {
          throw new Error('Service worker not found');
        }
        
        const swContent = fs.readFileSync(swPath, 'utf8');
        
        // Check for push event handler
        const hasPushHandler = swContent.includes('push') && 
                             swContent.includes('addEventListener') &&
                             swContent.includes('showNotification');
        
        if (!hasPushHandler) {
          throw new Error('Push event handler not found');
        }
        
        return '✅ Push event handler configured';
      }
    },
    {
      name: 'Notification Click Handler',
      test: () => {
        const swPath = path.join(__dirname, '../public/sw.js');
        const swContent = fs.readFileSync(swPath, 'utf8');
        
        // Check for notification click handler
        const hasClickHandler = swContent.includes('notificationclick') && 
                              swContent.includes('addEventListener');
        
        if (!hasClickHandler) {
          throw new Error('Notification click handler not found');
        }
        
        return '✅ Notification click handler configured';
      }
    },
    {
      name: 'Notification Options',
      test: () => {
        const swPath = path.join(__dirname, '../public/sw.js');
        const swContent = fs.readFileSync(swPath, 'utf8');
        
        // Check for notification options
        const hasNotificationOptions = swContent.includes('body') || 
                                     swContent.includes('icon') ||
                                     swContent.includes('badge') ||
                                     swContent.includes('vibrate');
        
        if (!hasNotificationOptions) {
          throw new Error('Notification options not configured');
        }
        
        return '✅ Notification options configured';
      }
    },
    {
      name: 'Notification Actions',
      test: () => {
        const swPath = path.join(__dirname, '../public/sw.js');
        const swContent = fs.readFileSync(swPath, 'utf8');
        
        // Check for notification actions
        const hasActions = swContent.includes('actions') && 
                          swContent.includes('action') &&
                          swContent.includes('title');
        
        if (!hasActions) {
          console.warn('⚠️  Notification actions not configured - basic notifications only');
        }
        
        return '✅ Notification actions checked';
      }
    },
    {
      name: 'Permission Handling',
      test: () => {
        // Check if notification permission handling is implemented in the app
        const appFiles = [
          path.join(__dirname, '../client/src/hooks/useNotifications.ts'),
          path.join(__dirname, '../client/src/services/notifications.ts'),
          path.join(__dirname, '../client/src/components/NotificationManager.tsx')
        ];
        
        let hasPermissionHandling = false;
        for (const file of appFiles) {
          if (fs.existsSync(file)) {
            const content = fs.readFileSync(file, 'utf8');
            if (content.includes('Notification.requestPermission') || 
                content.includes('permission') ||
                content.includes('granted')) {
              hasPermissionHandling = true;
              break;
            }
          }
        }
        
        if (!hasPermissionHandling) {
          console.warn('⚠️  Notification permission handling not found - may need implementation');
        }
        
        return '✅ Permission handling checked';
      }
    },
    {
      name: 'Service Worker Registration',
      test: () => {
        // Check for service worker registration in the app
        const appFiles = [
          path.join(__dirname, '../client/src/main.tsx'),
          path.join(__dirname, '../client/src/App.tsx'),
          path.join(__dirname, '../client/index.html')
        ];
        
        let hasSWRegistration = false;
        for (const file of appFiles) {
          if (fs.existsSync(file)) {
            const content = fs.readFileSync(file, 'utf8');
            if (content.includes('serviceWorker') || 
                content.includes('navigator.serviceWorker') ||
                content.includes('register')) {
              hasSWRegistration = true;
              break;
            }
          }
        }
        
        if (!hasSWRegistration) {
          console.warn('⚠️  Service worker registration not found - PWA features may not work');
        }
        
        return '✅ Service worker registration checked';
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
    console.error('\n❌ PWA notifications test failed');
    process.exit(1);
  } else {
    console.log('\n✅ PWA notifications test passed');
  }
}

/**
 * Main execution
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  testPWANotifications().catch(console.error);
}

export default testPWANotifications; 