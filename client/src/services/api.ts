import {apiDelete, apiGet, apiPatch, apiPost, apiPut, withIfMatch} from '../lib/apiRequest';
import { getCachedEtag } from '../lib/apiRequest';

// Base API service with common HTTP methods
export class ApiService {

  static async get<T> (url: string, params?: Record<string, string | number | boolean | null | undefined>): Promise<T> {
    const finalUrl = ApiService.createUrlWithParams(url, params);
    return apiGet<T>(finalUrl);
  }

  static async post<T> (url: string, data?: unknown): Promise<T> {
    return apiPost<T>(url, data ?? {});
  }

  static async put<T> (url: string, data?: unknown): Promise<T> {
    // Allow callers to pass { __etag } to include If-Match
    const payload = (data ?? {}) as Record<string, unknown> & { __etag?: string };
    const { __etag, ...rest } = payload;
    const cached = __etag || getCachedEtag(url);
    const headers = withIfMatch(cached ?? undefined);
    return apiPut<T>(url, rest, headers);
  }

  static async delete<T> (url: string): Promise<T> {
    return apiDelete<T>(url);
  }

  static async patch<T> (url: string, data?: unknown): Promise<T> {
    const payload = (data ?? {}) as Record<string, unknown> & { __etag?: string };
    const { __etag, ...rest } = payload;
    const cached = __etag || getCachedEtag(url);
    const headers = withIfMatch(cached ?? undefined);
    return apiPatch<T>(url, rest, headers);
  }

  private static createUrlWithParams (
    url: string,
    params?: Record<string, string | number | boolean | null | undefined | Array<string | number | boolean>>
  ): string {
    if (!params) return url;
    const segments: string[] = [];
    for (const [key, raw] of Object.entries(params)) {
      if (raw === undefined || raw === null) continue;
      const values = Array.isArray(raw) ? raw : [raw];
      for (const value of values) {
        if (value === undefined || value === null) continue;
        segments.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
      }
    }
    if (segments.length === 0) return url;
    const query = segments.join('&');
    return url.includes('?') ? `${url}&${query}` : `${url}?${query}`;
  }

}
