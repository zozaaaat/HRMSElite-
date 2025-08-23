import logger from './logger';
import i18n from './i18n';

/**
 * CSRF Token Management for Frontend
 * Handles CSRF token retrieval and inclusion in API requests
 */

interface CsrfResponse {
  csrfToken: string;
  message: string;
}

class CsrfTokenManager {

  private token: string | null = null;
  private tokenExpiry: number | null = null;
  private readonly TOKEN_VALIDITY_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Get CSRF token from server
   */
  async getToken (): Promise<string> {

    // Check if we have a valid cached token
    if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {

      return this.token;

    }

    try {

      const response = await fetch('/api/csrf-token', {
        'method': 'GET',
        'credentials': 'include', // Include cookies
        'headers': {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {

        throw new Error(`Failed to get CSRF token: ${response.status}`);

      }

      const data = await response.json() as CsrfResponse;
      this.token = data.csrfToken;
      this.tokenExpiry = Date.now() + this.TOKEN_VALIDITY_DURATION;

      return this.token;

    } catch (error) {

      logger.error('Error fetching CSRF token:', error);
      throw new Error(i18n.t('errors.csrfFetch'));

    }

  }

  /**
   * Get headers with CSRF token for API requests
   */
  async getHeaders (): Promise<Record<string, string>> {

    const token = await this.getToken();
    return {
      'Content-Type': 'application/json',
      'X-CSRF-Token': token
    };

  }

  /**
   * Clear cached token (useful for logout)
   */
  clearToken (): void {

    this.token = null;
    this.tokenExpiry = null;

  }

  /**
   * Check if token is valid
   */
  isTokenValid (): boolean {

    return !!(this.token && this.tokenExpiry && Date.now() < this.tokenExpiry);

  }

}

// Create singleton instance
export const csrfManager = new CsrfTokenManager();

/**
 * Enhanced fetch function with CSRF token
 */
export async function fetchWithCsrf (
  url: string,
  options: Parameters<typeof fetch>[1] = {}
): Promise<Response> {

  const csrfHeaders = await csrfManager.getHeaders();

  const enhancedOptions: Parameters<typeof fetch>[1] = {
    ...options,
    'credentials': 'include', // Always include cookies
    'headers': {
      ...csrfHeaders,
      ...((options as Record<string, unknown>)?.headers as Record<string, string> | undefined)
    }
  };

  return fetch(url, enhancedOptions);

}

/**
 * Handle CSRF token errors
 */
export function handleCsrfError (error: Record<string, unknown>): void {

  if (error?.code === 'CSRF_TOKEN_INVALID') {

    // Clear the invalid token
    csrfManager.clearToken();

    // Show user-friendly error message
    logger.error('CSRF token error:', error);

    // You can integrate this with your toast notification system
    // toast.error(i18n.t('errors.csrfValidation'));

  }

}

export default csrfManager;
