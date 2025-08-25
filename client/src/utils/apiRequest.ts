function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

export async function apiRequest(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getCookie('X-CSRF-Token');
  return fetch(`/api/v1${path}`, {
    ...options,
    credentials: options.credentials ?? 'include',
    headers: { ...(options.headers || {}), 'X-CSRF-Token': token ?? '' }
  });
}
