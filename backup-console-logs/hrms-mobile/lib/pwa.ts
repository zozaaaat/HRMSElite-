import { logger } from './logger';

/**
 * PWA (Progressive Web App) functionality
 * Handles service worker registration and PWA features
 */

// Type declaration for NotificationPermission if not available
type NotificationPermission = 'default' | 'granted' | 'denied';

interface PWAConfig {
  swPath: string;
  scope: string;
  updateViaCache: 'all' | 'none' | 'imports';
}

class PWAManager {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private config: PWAConfig;

  constructor(config: PWAConfig) {
    this.config = config;
  }

  /**
   * Register the service worker
   */
  async register(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      logger.warn('Service Worker not supported');
      return null;
    }

    try {
      this.swRegistration = await navigator.serviceWorker.register(
        this.config.swPath,
        {
          scope: this.config.scope,
          updateViaCache: this.config.updateViaCache,
        }
      );

      logger.info('Service Worker registered successfully:', this.swRegistration);

      // Handle service worker updates
      this.swRegistration.addEventListener('updatefound', () => {
        const newWorker = this.swRegistration!.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is available
              this.showUpdateNotification();
            }
          });
        }
      });

      // Handle service worker controller change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        logger.info('Service Worker controller changed');
        window.location.reload();
      });

      return this.swRegistration;
    } catch (error) {
      logger.error('Service Worker registration failed:', error);
      return null;
    }
  }

  /**
   * Show update notification to user
   */
  private showUpdateNotification(): void {
    if (window.confirm('A new version is available. Would you like to update?')) {
      this.swRegistration?.waiting?.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  /**
   * Check if the app is installed as PWA
   */
  isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  /**
   * Check if the app is running offline
   */
  isOffline(): boolean {
    return !navigator.onLine;
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      logger.warn('Notifications not supported');
      return 'denied';
    }

    if (Notification.permission === 'default') {
      return await Notification.requestPermission();
    }

    return Notification.permission;
  }

  /**
   * Show a notification
   */
  async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (Notification.permission === 'granted') {
      new Notification(title, options);
    } else if (Notification.permission === 'default') {
      const permission = await this.requestNotificationPermission();
      if (permission === 'granted') {
        new Notification(title, options);
      }
    }
  }

  /**
   * Add to home screen prompt
   */
  async showAddToHomeScreenPrompt(): Promise<void> {
    // This would typically use the BeforeInstallPromptEvent
    // For now, we'll show a manual prompt
    if (!this.isInstalled()) {
      const shouldShow = window.confirm(
        'Install HRMS Elite on your home screen for quick access?'
      );
      
      if (shouldShow) {
        // Show instructions for manual installation
        window.alert(
          'To install HRMS Elite:\n\n' +
          'iOS Safari:\n' +
          '1. Tap the Share button\n' +
          '2. Tap "Add to Home Screen"\n\n' +
          'Android Chrome:\n' +
          '1. Tap the menu button\n' +
          '2. Tap "Add to Home screen"\n\n' +
          'Desktop Chrome:\n' +
          '1. Click the install icon in the address bar\n' +
          '2. Click "Install"'
        );
      }
    }
  }

  /**
   * Get offline status
   */
  getOfflineStatus(): { isOffline: boolean; lastOnline: Date | null } {
    return {
      isOffline: this.isOffline(),
      lastOnline: this.getLastOnlineTime(),
    };
  }

  /**
   * Get last online time from localStorage
   */
  private getLastOnlineTime(): Date | null {
    const lastOnline = localStorage.getItem('hrms_last_online');
    return lastOnline ? new Date(lastOnline) : null;
  }

  /**
   * Update last online time
   */
  private updateLastOnlineTime(): void {
    localStorage.setItem('hrms_last_online', new Date().toISOString());
  }

  /**
   * Initialize PWA functionality
   */
  async init(): Promise<void> {
    // Register service worker
    await this.register();

    // Set up online/offline listeners
    window.addEventListener('online', () => {
      logger.info('App is online');
      this.updateLastOnlineTime();
      this.showNotification('HRMS Elite', {
        body: 'You are back online',
        icon: '/assets/images/icon-192.png',
      });
    });

    window.addEventListener('offline', () => {
      logger.info('App is offline');
      this.showNotification('HRMS Elite', {
        body: 'You are offline. Some features may be limited.',
        icon: '/assets/images/icon-192.png',
      });
    });

    // Show add to home screen prompt after a delay
    setTimeout(() => {
      this.showAddToHomeScreenPrompt();
    }, 5000);

    // Update last online time if currently online
    if (navigator.onLine) {
      this.updateLastOnlineTime();
    }
  }

  /**
   * Get service worker registration
   */
  getRegistration(): ServiceWorkerRegistration | null {
    return this.swRegistration;
  }

  /**
   * Unregister service worker (for testing)
   */
  async unregister(): Promise<boolean> {
    if (this.swRegistration) {
      return await this.swRegistration.unregister();
    }
    return false;
  }
}

// Create and export PWA manager instance
export const pwaManager = new PWAManager({
  swPath: '/sw.js',
  scope: '/',
  updateViaCache: 'none',
});

// Export PWA utilities
export const PWAUtils = {
  /**
   * Initialize PWA
   */
  async init(): Promise<void> {
    await pwaManager.init();
  },

  /**
   * Check if app is installed
   */
  isInstalled(): boolean {
    return pwaManager.isInstalled();
  },

  /**
   * Check if app is offline
   */
  isOffline(): boolean {
    return pwaManager.isOffline();
  },

  /**
   * Show notification
   */
  async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    await pwaManager.showNotification(title, options);
  },

  /**
   * Get offline status
   */
  getOfflineStatus() {
    return pwaManager.getOfflineStatus();
  },
};

export default pwaManager; 