/**
 * Base Service Class for Repositories
 * Provides common error handling and utility methods
 */
export abstract class BaseService {
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
   * Validate required fields
   */
  protected validateRequired(data: any, requiredFields: string[]): void {
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`${field} is required`);
      }
    }
  }

  /**
   * Sanitize data for database operations
   */
  protected sanitizeData(data: any): any {
    const sanitized = { ...data };
    
    // Remove undefined values
    Object.keys(sanitized).forEach(key => {
      if (sanitized[key] === undefined) {
        delete sanitized[key];
      }
    });
    
    return sanitized;
  }

  /**
   * Generate unique ID
   */
  protected generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  /**
   * Format date for database
   */
  protected formatDate(date: Date | string): string {
    if (typeof date === 'string') {
      return date;
    }
    return date.toISOString();
  }
}
