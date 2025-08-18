import { apiRequest } from '../../lib/apiRequest';

/**
 * Base Service Class - DRY Principle
 * Provides common functionality for all services
 */
export abstract class BaseService {
  protected baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic GET request
   */
  protected async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return apiRequest<T>(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      params
    });
  }

  /**
   * Generic POST request
   */
  protected async post<T>(endpoint: string, data?: any): Promise<T> {
    return apiRequest<T>(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      data
    });
  }

  /**
   * Generic PUT request
   */
  protected async put<T>(endpoint: string, data?: any): Promise<T> {
    return apiRequest<T>(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      data
    });
  }

  /**
   * Generic DELETE request
   */
  protected async delete<T>(endpoint: string): Promise<T> {
    return apiRequest<T>(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE'
    });
  }

  /**
   * Generic PATCH request
   */
  protected async patch<T>(endpoint: string, data?: any): Promise<T> {
    return apiRequest<T>(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      data
    });
  }

  /**
   * Handle service errors consistently
   */
  protected handleError(error: any): never {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    if (error.message) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred');
  }

  /**
   * Build query string from parameters
   */
  protected buildQueryString(params?: Record<string, any>): string {
    if (!params) return '';
    
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }
}
