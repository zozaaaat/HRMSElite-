import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface AccessibilityContextType {
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
  setPageTitle: (title: string) => void;
  focusMainContent: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const { t } = useTranslation();
  const [announcements, setAnnouncements] = useState<Array<{ id: string; message: string; priority: 'polite' | 'assertive' }>>([]);
  const mainContentRef = useRef<HTMLElement>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);

  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const id = `announcement-${Date.now()}`;
    setAnnouncements(prev => [...prev, { id, message, priority }]);
    
    // Remove announcement after it's been read
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(announcement => announcement.id !== id));
    }, 1000);
  };

  const setPageTitle = (title: string) => {
    document.title = title;
  };

  const focusMainContent = () => {
    if (mainContentRef.current) {
      mainContentRef.current.focus();
    }
  };

  // Handle keyboard navigation for skip links
  const handleSkipLinkKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const targetId = event.currentTarget.getAttribute('href')?.replace('#', '');
      const targetElement = document.getElementById(targetId || '');
      if (targetElement) {
        targetElement.focus();
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const contextValue: AccessibilityContextType = {
    announceToScreenReader,
    setPageTitle,
    focusMainContent,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {/* Skip Links for Keyboard Navigation */}
      <div className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50">
        <nav aria-label={t('accessibility.skipNavigation')}>
          <ul className="flex flex-col gap-2">
            <li>
              <a
                href="#main-content"
                className="bg-blue-600 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={handleSkipLinkKeyDown}
                aria-label={t('accessibility.skipToMainContent')}
              >
                {t('accessibility.skipToMainContent')}
              </a>
            </li>
            <li>
              <a
                href="#navigation"
                className="bg-blue-600 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={handleSkipLinkKeyDown}
                aria-label={t('accessibility.skipToNavigation')}
              >
                {t('accessibility.skipToNavigation')}
              </a>
            </li>
            <li>
              <a
                href="#footer"
                className="bg-blue-600 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={handleSkipLinkKeyDown}
                aria-label={t('accessibility.skipToFooter')}
              >
                {t('accessibility.skipToFooter')}
              </a>
            </li>
          </ul>
        </nav>
      </div>

      {/* Live Region for Screen Reader Announcements */}
      <div
        ref={liveRegionRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {announcements.map(announcement => (
          <div key={announcement.id} aria-live={announcement.priority}>
            {announcement.message}
          </div>
        ))}
      </div>

      {/* Main Content Reference */}
      <main
        ref={mainContentRef}
        id="main-content"
        tabIndex={-1}
        className="outline-none"
        role="main"
      >
        {children}
      </main>
    </AccessibilityContext.Provider>
  );
};

// Focus trap hook for modals
export const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    // Store the previously focused element
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Find all focusable elements within the container
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    // Focus the first element
    firstElement.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          // Shift + Tab: move to previous element
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: move to next element
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus when trap is deactivated
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isActive]);

  return containerRef;
};

// High contrast mode hook
export const useHighContrast = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setIsHighContrast(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isHighContrast;
};

// Reduced motion hook
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};
