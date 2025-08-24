/**
 * PWA (Progressive Web App) functionality
 * Handles service worker registration and PWA features
 */

// Enhanced PWA Configuration for HRMS Mobile
import { Platform } from 'react-native';
import { SyncData, PendingDataItem, EmployeeData, CompanyData, DocumentData, LicenseData } from '@shared/types/common';
import { logger } from './logger';

declare const __BUILD_HASH__: string;


export interface PWAConfig {
  name: string;
  shortName: string;
  description: string;
  themeColor: string;
  backgroundColor: string;
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  orientation: 'portrait' | 'landscape' | 'any';
  scope: string;
  startUrl: string;
  icons: PWAIcon[];
  shortcuts: PWAShortcut[];
  categories: string[];
  lang: string;
  dir: 'ltr' | 'rtl';
}

export interface PWAIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: 'maskable' | 'any' | 'maskable any';
}

export interface PWAShortcut {
  name: string;
  shortName: string;
  description: string;
  url: string;
  icons?: PWAIcon[];
}

export const pwaConfig: PWAConfig = {
  name: 'HRMS Elite - نظام إدارة الموارد البشرية',
  shortName: 'HRMS Elite',
  description: 'نظام إدارة الموارد البشرية الشامل والمتقدم',
  themeColor: '#2563eb',
  backgroundColor: '#ffffff',
  display: 'standalone',
  orientation: 'portrait',
  scope: '/',
  startUrl: '/',
  lang: 'ar',
  dir: 'rtl',
  categories: ['business', 'productivity', 'utilities'],
  icons: [
    {
      src: '/icon-72x72.png',
      sizes: '72x72',
      type: 'image/png',
      purpose: 'maskable any'
    },
    {
      src: '/icon-96x96.png',
      sizes: '96x96',
      type: 'image/png',
      purpose: 'maskable any'
    },
    {
      src: '/icon-128x128.png',
      sizes: '128x128',
      type: 'image/png',
      purpose: 'maskable any'
    },
    {
      src: '/icon-144x144.png',
      sizes: '144x144',
      type: 'image/png',
      purpose: 'maskable any'
    },
    {
      src: '/icon-152x152.png',
      sizes: '152x152',
      type: 'image/png',
      purpose: 'maskable any'
    },
    {
      src: '/icon-192x192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'maskable any'
    },
    {
      src: '/icon-384x384.png',
      sizes: '384x384',
      type: 'image/png',
      purpose: 'maskable any'
    },
    {
      src: '/icon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable any'
    }
  ],
  shortcuts: [
    {
      name: 'لوحة التحكم',
      shortName: 'لوحة التحكم',
      description: 'الوصول السريع للوحة التحكم الرئيسية',
      url: '/dashboard',
      icons: [
        {
          src: '/shortcut-dashboard.png',
          sizes: '96x96',
          type: 'image/png'
        }
      ]
    },
    {
      name: 'الموظفين',
      shortName: 'الموظفين',
      description: 'إدارة بيانات الموظفين',
      url: '/employees',
      icons: [
        {
          src: '/shortcut-employees.png',
          sizes: '96x96',
          type: 'image/png'
        }
      ]
    },
    {
      name: 'الحضور',
      shortName: 'الحضور',
      description: 'تسجيل الحضور والانصراف',
      url: '/attendance',
      icons: [
        {
          src: '/shortcut-attendance.png',
          sizes: '96x96',
          type: 'image/png'
        }
      ]
    },
    {
      name: 'التقارير',
      shortName: 'التقارير',
      description: 'عرض التقارير والإحصائيات',
      url: '/reports',
      icons: [
        {
          src: '/shortcut-reports.png',
          sizes: '96x96',
          type: 'image/png'
        }
      ]
    }
  ]
};

// Service Worker Registration
export class PWAManager {
  private static instance: PWAManager;
  private swRegistration: ServiceWorkerRegistration | null = null;
  private isOnline: boolean = navigator.onLine;

  private constructor() {
    this.initializePWA();
  }

  public static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager();
    }
    return PWAManager.instance;
  }

  private async initializePWA(): Promise<void> {
    if (Platform.OS === 'web') {
      await this.registerServiceWorker();
      this.setupEventListeners();
      this.checkForUpdates();
    }
  }

  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const swUrl = `/sw.js?build=${__BUILD_HASH__}`;
        this.swRegistration = await navigator.serviceWorker.register(swUrl, {
          scope: '/'
        });
        logger.info('Service Worker registered successfully:', this.swRegistration);
      } catch (error) {
        logger.error('Service Worker registration failed:', error);
      }
    }
  }

  private setupEventListeners(): void {
    // Online/Offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.onOnline();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.onOffline();
    });

    // Service Worker events
    if (this.swRegistration) {
      this.swRegistration.addEventListener('updatefound', () => {
        this.onUpdateFound();
      });
    }
  }

  private onOnline(): void {
    logger.info('App is online');
    // Sync any pending data
    this.syncPendingData();
  }

  private onOffline(): void {
    logger.info('App is offline');
    // Show offline indicator
    this.showOfflineIndicator();
  }

  private onUpdateFound(): void {
    logger.info('App update found');
    // Show update notification
    this.showUpdateNotification();
  }

  private async syncPendingData(): Promise<void> {
    try {
      // Sync any data that was stored while offline
      const pendingData = await this.getPendingData();
      if (pendingData.length > 0) {
        // Convert PendingDataItem to SyncData format
        const syncData: SyncData[] = pendingData.map(item => ({
          id: item.id,
          type: item.type as 'employee' | 'company' | 'document' | 'license',
          action: item.action as 'create' | 'update' | 'delete',
          data: item.data as EmployeeData | CompanyData | DocumentData | LicenseData,
          timestamp: item.timestamp,
          status: 'pending' as const,
          retryCount: item.retryCount || 0
        }));
        await this.syncData(syncData);
      }
    } catch (error) {
      logger.error('Error syncing pending data:', error);
    }
  }

  private async getPendingData(): Promise<PendingDataItem[]> {
    // Get data from IndexedDB or localStorage
    const pendingData = localStorage.getItem('pendingData');
    return pendingData ? JSON.parse(pendingData) : [];
  }

  private async syncData(data: SyncData[]): Promise<void> {
    // Sync data with server
    for (const item of data) {
      try {
        // Make API call to sync data
        await this.makeAPICall(item);
        // Remove from pending data
        await this.removePendingData(item);
      } catch (error) {
        logger.error('Error syncing item:', error);
      }
    }
  }

  private async makeAPICall(data: SyncData): Promise<void> {
    // Implementation for API calls
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('API call failed');
    }
  }

  private async removePendingData(item: SyncData): Promise<void> {
    // Remove item from pending data
    const pendingData = await this.getPendingData();
    const filteredData = pendingData.filter((pendingItem: PendingDataItem) => 
      pendingItem.id !== item.id
    );
    localStorage.setItem('pendingData', JSON.stringify(filteredData));
  }

  private showOfflineIndicator(): void {
    // Show offline indicator in UI
    const event = new CustomEvent('offline-status', {
      detail: { isOnline: false }
    });
    window.dispatchEvent(event);
  }

  private showUpdateNotification(): void {
    // Show update notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('HRMS Elite', {
        body: 'تم العثور على تحديث جديد. انقر لتحديث التطبيق.',
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        tag: 'update-notification'
      });
    }
  }

  private async checkForUpdates(): Promise<void> {
    if (this.swRegistration) {
      try {
        await this.swRegistration.update();
      } catch (error) {
        logger.error('Error checking for updates:', error);
      }
    }
  }

  // Public methods
  public async requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  public async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        ...options
      });
    }
  }

  public isAppOnline(): boolean {
    return this.isOnline;
  }

  public async addToHomeScreen(): Promise<void> {
    // Trigger add to home screen prompt
    const event = new CustomEvent('beforeinstallprompt');
    window.dispatchEvent(event);
  }
}

// Export singleton instance
export const pwaManager = PWAManager.getInstance();

// Utility functions
export const isPWAInstalled = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
};

export const isPWACompatible = (): boolean => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

export const getPWAConfig = (): PWAConfig => {
  return pwaConfig;
}; 