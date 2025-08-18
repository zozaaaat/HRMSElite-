// API Request utility with error handling and CSRF protection

import {fetchWithCsrf, handleCsrfError} from './csrf';
import logger from './logger';

// Local aliases to avoid direct references to DOM lib names in annotations
type BodyInitLike = globalThis.BodyInit;
type HeadersInitLike = globalThis.HeadersInit;
type RequestInitLike = globalThis.RequestInit;

// Type definition for error response data
interface ErrorResponseData {
  code?: string;
  message?: string;
  [key: string]: unknown;
}

export interface ApiRequestOptions {
  method?: string;
  body?: BodyInitLike | null;
  headers?: HeadersInitLike;
  useCsrf?: boolean; // Whether to include CSRF token
  responseType?: 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData';
}

/**
 * Wrapped fetch function with error handling
 * @param url - The URL to fetch from
 * @param options - Request options including method, body, and headers
 * @returns Promise with the response data
 */
export const apiRequest = async <T = unknown>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<T> => {

  try {

    const {method = 'GET', body, headers = {}, useCsrf = true, responseType} = options;

    // Compute headers; remove Content-Type if sending FormData so the browser can set boundary
    const isFormDataBody = (() => {
      const ctor = (globalThis as unknown as Record<string, unknown>).FormData;
      if (typeof ctor !== 'function' || body === null) {
        return false;
      }
      return Object.prototype.toString.call(body) === '[object FormData]';
    })();

    const computedHeaders: HeadersInitLike = {
      'Content-Type': 'application/json',
      ...(headers as Record<string, string>)
    };

    if (isFormDataBody) {
      // Remove content-type for multipart/form-data
      if (typeof computedHeaders === 'object' && computedHeaders !== null) {
         
        delete (computedHeaders)['Content-Type'];
         
        delete (computedHeaders)['content-type'];
      }
    }

    const requestOptions: RequestInitLike = {
      method,
      headers: computedHeaders
    };

    if (body !== undefined) {
      requestOptions.body = body as BodyInitLike;
    }

    // Use CSRF-protected fetch if enabled
    const response = useCsrf
      ? await fetchWithCsrf(url, requestOptions)
      : await fetch(url, requestOptions);

    if (!response.ok) {

      // Handle CSRF token errors specifically
      if (response.status === 403) {

        try {

          const errorData = await response.json() as ErrorResponseData;
          if (errorData.code === 'CSRF_TOKEN_INVALID') {

            handleCsrfError(errorData);
            throw new Error('خطأ في التحقق من الأمان، يرجى إعادة تحميل الصفحة');

          }

        } catch {
          // If we can't parse the error, continue with generic error
        }

      }

      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);

    }

    // Handle different response types
    if (responseType === 'blob') {
      return (await response.blob()) as unknown as T;
    }
    if (responseType === 'arrayBuffer') {
      return (await response.arrayBuffer()) as unknown as T;
    }
    if (responseType === 'formData') {
      return (await response.formData()) as unknown as T;
    }
    if (responseType === 'text') {
      return (await response.text()) as unknown as T;
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return (await response.json()) as T;
    }
    return (await response.text()) as T;

  } catch (error) {

    logger.error(`API Request failed for ${url}:`, error);
    throw error;

  }

};

/**
 * Convenience methods for common HTTP methods
 */
export const apiGet = <T = unknown>(url: string, headers?: Record<string, string>): Promise<T> => {

  return apiRequest<T>(url, {
    method: 'GET', 
    headers: headers ?? {}
  });

};

export const apiPost = <T = unknown>(
  url: string,
  data: unknown,
  headers?: Record<string, string>
): Promise<T> => {

  return apiRequest<T>(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: headers ?? {}
  });

};

export const apiPut = <T = unknown>(
  url: string,
  data: unknown,
  headers?: Record<string, string>
): Promise<T> => {

  return apiRequest<T>(url, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: headers ?? {}
  });

};

export const apiDelete = <T = unknown>(url: string, headers?: Record<string, string>): Promise<T> => {

  return apiRequest<T>(url, {
    method: 'DELETE', 
    headers: headers ?? {}
  });

};

export const apiPatch = <T = unknown>(
  url: string,
  data: unknown,
  headers?: Record<string, string>
): Promise<T> => {

  return apiRequest<T>(url, {
    method: 'PATCH',
    body: JSON.stringify(data),
    headers: headers ?? {}
  });

};
