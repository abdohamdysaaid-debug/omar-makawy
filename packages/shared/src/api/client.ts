import { ApiError, Tokens } from '../types';

export const DEFAULT_API_BASE_URL =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE_URL) ||
  (typeof window !== 'undefined' && window.location.hostname.includes('omarmeckawy.com')
    ? 'https://api.omarmeckawy.com/api/v1'
    : 'http://localhost:3000/api/v1');

export function resolveMediaUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('blob:') ||
    url.startsWith('data:')
  ) {
    return url;
  }
  const baseUrl = DEFAULT_API_BASE_URL.replace(/\/api\/v1\/?$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${cleanPath}`;
}

export interface ApiClientConfig {
  baseUrl?: string;
  tokenKey?: string;
  refreshKey?: string;
  deviceUuidKey?: string;
  userKey?: string;
}

export const DEFAULT_STORAGE_KEYS = {
  ACCESS_TOKEN: 'omar_staff_access_token',
  REFRESH_TOKEN: 'omar_staff_refresh_token',
  DEVICE_UUID: 'omar_device_uuid',
  USER: 'omar_staff_user',
};

export function generateSecureDeviceUuid(): string {
  if (typeof crypto !== 'undefined') {
    if (typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    if (typeof crypto.getRandomValues === 'function') {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
      bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 1 (RFC 4122)
      const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
    }
  }
  // Node.js environment fallback (for SSR / test runners)
  try {
    const nodeCrypto = require('crypto');
    if (typeof nodeCrypto?.randomUUID === 'function') {
      return nodeCrypto.randomUUID();
    }
    if (typeof nodeCrypto?.randomBytes === 'function') {
      const bytes = nodeCrypto.randomBytes(16);
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      const hex = bytes.toString('hex');
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
    }
  } catch {
    // ignore
  }
  throw new Error('Secure Web Crypto API is unavailable to generate device UUID');
}

export function getOrCreateDeviceUuid(storageKey = DEFAULT_STORAGE_KEYS.DEVICE_UUID): string {
  if (typeof window === 'undefined') {
    return generateSecureDeviceUuid();
  }
  let uuid = localStorage.getItem(storageKey);
  if (!uuid) {
    uuid = generateSecureDeviceUuid();
    localStorage.setItem(storageKey, uuid);
  }
  return uuid;
}

export interface RequestOptions extends RequestInit {
  academicYearId?: string; // Explicit tenancy scope (optional)
  skipAuth?: boolean;
}

export function createApiClient(
  configOrTokenKey?: ApiClientConfig | string,
  legacyRefreshKey?: string
) {
  const config: ApiClientConfig =
    typeof configOrTokenKey === 'string'
      ? { tokenKey: configOrTokenKey, refreshKey: legacyRefreshKey }
      : configOrTokenKey || {};

  const baseUrl = config.baseUrl || DEFAULT_API_BASE_URL;
  const tokenKey = config.tokenKey || DEFAULT_STORAGE_KEYS.ACCESS_TOKEN;
  const refreshKey = config.refreshKey || DEFAULT_STORAGE_KEYS.REFRESH_TOKEN;
  const deviceUuidKey = config.deviceUuidKey || DEFAULT_STORAGE_KEYS.DEVICE_UUID;
  const userKey = config.userKey || DEFAULT_STORAGE_KEYS.USER;

  function getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return (
      localStorage.getItem(tokenKey) ||
      localStorage.getItem('omar_student_access_token') ||
      localStorage.getItem('omar_staff_access_token') ||
      localStorage.getItem('omar_access_token') ||
      localStorage.getItem('omar_admin_access_token')
    );
  }

  function getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return (
      localStorage.getItem(refreshKey) ||
      localStorage.getItem('omar_student_refresh_token') ||
      localStorage.getItem('omar_staff_refresh_token') ||
      localStorage.getItem('omar_refresh_token') ||
      localStorage.getItem('omar_admin_refresh_token')
    );
  }

  function storeTokens(tokens: Tokens): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(tokenKey, tokens.access_token);
    localStorage.setItem(refreshKey, tokens.refresh_token);
    if (localStorage.getItem('omar_student_access_token') || tokenKey === 'omar_student_access_token') {
      localStorage.setItem('omar_student_access_token', tokens.access_token);
      localStorage.setItem('omar_student_refresh_token', tokens.refresh_token);
    }
    if (localStorage.getItem('omar_staff_access_token') || tokenKey === 'omar_staff_access_token') {
      localStorage.setItem('omar_staff_access_token', tokens.access_token);
      localStorage.setItem('omar_staff_refresh_token', tokens.refresh_token);
    }
  }

  function clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(refreshKey);
    localStorage.removeItem('omar_student_access_token');
    localStorage.removeItem('omar_student_refresh_token');
    localStorage.removeItem('omar_staff_access_token');
    localStorage.removeItem('omar_staff_refresh_token');
    localStorage.removeItem('omar_access_token');
    localStorage.removeItem('omar_refresh_token');
  }

  function getStoredUser(): any | null {
    if (typeof window === 'undefined') return null;
    const raw =
      localStorage.getItem(userKey) ||
      localStorage.getItem('omar_student_user') ||
      localStorage.getItem('omar_staff_user') ||
      localStorage.getItem('omar_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function storeUser(user: any): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(userKey, JSON.stringify(user));
  }

  function clearStoredAuth(): void {
    clearTokens();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(userKey);
      localStorage.removeItem('omar_student_user');
      localStorage.removeItem('omar_staff_user');
      localStorage.removeItem('omar_user');
    }
  }

  // Concurrency-safe single-flight refresh queue
  let isRefreshing = false;
  let refreshSubscribers: Array<{
    resolve: (token: string) => void;
    reject: (err: any) => void;
  }> = [];

  function subscribeTokenRefresh(
    resolve: (token: string) => void,
    reject: (err: any) => void
  ) {
    refreshSubscribers.push({ resolve, reject });
  }

  function onRefreshed(newToken: string) {
    refreshSubscribers.forEach(({ resolve }) => resolve(newToken));
    refreshSubscribers = [];
  }

  function onRefreshFailed(err: any) {
    refreshSubscribers.forEach(({ reject }) => reject(err));
    refreshSubscribers = [];
  }

  async function request<T>(
    endpoint: string,
    options: RequestOptions = {},
    retry = true
  ): Promise<T> {
    let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    if (baseUrl.endsWith('/api/v1') && (cleanEndpoint === '/api/v1' || cleanEndpoint.startsWith('/api/v1/'))) {
      cleanEndpoint = cleanEndpoint.replace(/^\/api\/v1/, '') || '/';
    }
    const url = `${baseUrl}${cleanEndpoint}`;

    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }
    if (!headers.has('Accept')) {
      headers.set('Accept', 'application/json');
    }

    if (!options.skipAuth) {
      const token = getAccessToken();
      if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    const deviceUuid = getOrCreateDeviceUuid(deviceUuidKey);
    if (!headers.has('x-device-id')) {
      headers.set('x-device-id', deviceUuid);
    }

    // Explicit Tenancy Scope (Only set if specifically provided)
    if (options.academicYearId && !headers.has('x-academic-year-id')) {
      headers.set('x-academic-year-id', options.academicYearId);
    }

    try {
      const res = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized with token refresh rotation
      if (res.status === 401 && retry && !options.skipAuth) {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          if (!isRefreshing) {
            isRefreshing = true;
            try {
              const refreshRes = await fetch(`${baseUrl}/auth/refresh`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Accept: 'application/json',
                  'x-device-id': deviceUuid,
                },
                body: JSON.stringify({
                  refresh_token: refreshToken,
                  device_uuid: deviceUuid,
                }),
              });

              if (refreshRes.ok) {
                const rawRefreshData = await refreshRes.json();
                const newTokens: Tokens =
                  rawRefreshData.data?.tokens || rawRefreshData.data || rawRefreshData.tokens;

                if (newTokens && newTokens.access_token) {
                  storeTokens(newTokens);
                  isRefreshing = false;
                  onRefreshed(newTokens.access_token);

                  headers.set('Authorization', `Bearer ${newTokens.access_token}`);
                  return request<T>(endpoint, { ...options, headers }, false);
                }
              }

              // Refresh failed or returned invalid tokens
              clearStoredAuth();
              isRefreshing = false;
              const refreshError: ApiError = {
                message: 'Session expired. Please sign in again.',
                error_code: 'SESSION_EXPIRED',
                statusCode: 401,
              };
              onRefreshFailed(refreshError);
            } catch (refreshErr) {
              clearStoredAuth();
              isRefreshing = false;
              onRefreshFailed(refreshErr);
            }
          } else {
            // Queue ongoing concurrent request to wait for in-flight refresh
            return new Promise<T>((resolve, reject) => {
              subscribeTokenRefresh(
                (newToken) => {
                  headers.set('Authorization', `Bearer ${newToken}`);
                  request<T>(endpoint, { ...options, headers }, false)
                    .then(resolve)
                    .catch(reject);
                },
                (err) => reject(err)
              );
            });
          }
        }
      }

      const rawData = await res.json().catch(() => null);

      if (!res.ok) {
        const error: ApiError = {
          message:
            rawData?.message ||
            rawData?.error ||
            `Request failed with status ${res.status}`,
          error_code:
            rawData?.error_code ||
            (rawData?.statusCode ? `HTTP_${rawData.statusCode}` : `HTTP_${res.status}`),
          statusCode: res.status,
          timestamp: rawData?.timestamp,
          path: rawData?.path,
          details: rawData?.details || rawData,
        };
        throw error;
      }

      // Unpack NestJS response envelope if present { success: true, data: T }
      if (
        rawData &&
        typeof rawData === 'object' &&
        'data' in rawData &&
        rawData.data !== undefined
      ) {
        return rawData.data as T;
      }

      return rawData as T;
    } catch (err: any) {
      if (err.statusCode) {
        throw err;
      }
      const networkError: ApiError = {
        message:
          err.message || 'Network connection failed. Please check backend server status.',
        error_code: 'NETWORK_ERROR',
        statusCode: 0,
        details: err,
      };
      throw networkError;
    }
  }

  return {
    request,
    getAccessToken,
    getRefreshToken,
    getStoredUser,
    storeTokens,
    storeUser,
    clearTokens,
    clearStoredAuth,
    get: <T>(endpoint: string, options?: RequestOptions) =>
      request<T>(endpoint, { ...options, method: 'GET' }),
    post: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
      request<T>(endpoint, {
        ...options,
        method: 'POST',
        body: body instanceof FormData ? body : JSON.stringify(body),
      }),
    put: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
      request<T>(endpoint, {
        ...options,
        method: 'PUT',
        body: body instanceof FormData ? body : JSON.stringify(body),
      }),
    patch: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
      request<T>(endpoint, {
        ...options,
        method: 'PATCH',
        body: body instanceof FormData ? body : JSON.stringify(body),
      }),
    delete: <T>(endpoint: string, bodyOrOptions?: any, options?: RequestOptions) => {
      const isOptionsOnly =
        bodyOrOptions &&
        (bodyOrOptions.headers || bodyOrOptions.skipAuth || bodyOrOptions.academicYearId || bodyOrOptions.method);
      if (isOptionsOnly && !options) {
        return request<T>(endpoint, { ...bodyOrOptions, method: 'DELETE' });
      }
      return request<T>(endpoint, {
        ...options,
        method: 'DELETE',
        body: bodyOrOptions
          ? bodyOrOptions instanceof FormData
            ? bodyOrOptions
            : JSON.stringify(bodyOrOptions)
          : undefined,
      });
    },
  };
}

export const defaultApiClient = createApiClient();
