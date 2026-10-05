import { ApiError, Tokens } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';

// Key names for student portal storage
const ACCESS_TOKEN_KEY = 'omar_student_access_token';
const REFRESH_TOKEN_KEY = 'omar_student_refresh_token';
const DEVICE_UUID_KEY = 'omar_device_uuid';
const USER_KEY = 'omar_student_user';

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

export function getOrCreateDeviceUuid(): string {
  if (typeof window === 'undefined') {
    return generateSecureDeviceUuid();
  }
  let uuid = localStorage.getItem(DEVICE_UUID_KEY);
  if (!uuid) {
    uuid = generateSecureDeviceUuid();
    localStorage.setItem(DEVICE_UUID_KEY, uuid);
  }
  return uuid;
}

export function getStoredAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem('omar_admin_access_token');
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY) || localStorage.getItem('omar_admin_refresh_token');
}

export function storeTokens(tokens: Tokens): void {
  if (typeof window === 'undefined') return;
  if (!tokens || !tokens.access_token) return;
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
  if (tokens.refresh_token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
  }
}

export function clearStoredAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('omar_student_auth');
  localStorage.removeItem('omar_student_data');
}

export function getStoredUser(): any | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function storeUser(user: any): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(newToken: string) {
  refreshSubscribers.map((cb) => cb(newToken));
  refreshSubscribers = [];
}

export async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  let normalizedPath = cleanEndpoint;
  if (API_BASE_URL.endsWith('/api/v1') && normalizedPath.startsWith('/api/v1/')) {
    normalizedPath = normalizedPath.slice('/api/v1'.length);
  } else if (API_BASE_URL.endsWith('/api/v1') && normalizedPath === '/api/v1') {
    normalizedPath = '';
  }
  const url = `${API_BASE_URL}${normalizedPath}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  const token = getStoredAccessToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const deviceUuid = getOrCreateDeviceUuid();
  if (!headers.has('x-device-id')) {
    headers.set('x-device-id', deviceUuid);
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (res.status === 401 && retry) {
      const refreshToken = getStoredRefreshToken();
      if (refreshToken && refreshToken.trim().length > 0) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'x-device-id': deviceUuid,
              },
              body: JSON.stringify({ refresh_token: refreshToken }),
            });

            if (refreshRes.ok) {
              const data = await refreshRes.json();
              const newTokens: Tokens = data.data?.tokens || data.tokens || data.data || data;
              if (newTokens && newTokens.access_token) {
                storeTokens(newTokens);
                isRefreshing = false;
                onRefreshed(newTokens.access_token);
                // Retry with new token
                headers.set('Authorization', `Bearer ${newTokens.access_token}`);
                return request<T>(endpoint, { ...options, headers }, false);
              } else {
                clearStoredAuth();
                isRefreshing = false;
              }
            } else {
              // Refresh failed, clear credentials
              clearStoredAuth();
              isRefreshing = false;
            }
          } catch {
            clearStoredAuth();
            isRefreshing = false;
          }
        } else {
          // Wait for the active refresh to finish
          return new Promise<T>((resolve, reject) => {
            subscribeTokenRefresh((newToken) => {
              headers.set('Authorization', `Bearer ${newToken}`);
              request<T>(endpoint, { ...options, headers }, false)
                .then(resolve)
                .catch(reject);
            });
          });
        }
      } else {
        // No refresh token available, clear credentials immediately
        clearStoredAuth();
      }
    }

    const rawData = await res.json().catch(() => null);

    if (!res.ok) {
      const error: ApiError = {
        message: rawData?.message || rawData?.error || `Request failed with status ${res.status}`,
        error_code: rawData?.error_code || rawData?.statusCode?.toString(),
        statusCode: res.status,
        details: rawData,
      };
      throw error;
    }

    // Unpack NestJS response wrapper if present { success: true, data: ... }
    if (rawData && typeof rawData === 'object' && 'data' in rawData && rawData.data !== undefined) {
      return rawData.data as T;
    }

    return rawData as T;
  } catch (err: any) {
    if (err.statusCode) {
      throw err;
    }
    const networkError: ApiError = {
      message: err.message || 'Network connection failed. Please check backend server status.',
      error_code: 'NETWORK_ERROR',
      statusCode: 0,
      details: err,
    };
    throw networkError;
  }
}

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
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    (typeof window !== 'undefined' && window.location.hostname.includes('omarmeckawy.com')
      ? 'https://api.omarmeckawy.com/api/v1'
      : 'http://localhost:3000/api/v1');
  const base = apiBase.replace(/\/api\/v1\/?$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${base}${cleanPath}`;
}

export const apiClient = {
  get: <T>(endpoint: string, headers?: HeadersInit) =>
    request<T>(endpoint, { method: 'GET', headers }),
  post: <T>(endpoint: string, body?: any, headers?: HeadersInit) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
      headers,
    }),
  put: <T>(endpoint: string, body?: any, headers?: HeadersInit) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
      headers,
    }),
  patch: <T>(endpoint: string, body?: any, headers?: HeadersInit) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
      headers,
    }),
  delete: <T>(endpoint: string, headers?: HeadersInit) =>
    request<T>(endpoint, { method: 'DELETE', headers }),
};
