import { ApiError, Tokens } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';

// Key names for storage
const ACCESS_TOKEN_KEY = 'omar_admin_access_token';
const REFRESH_TOKEN_KEY = 'omar_admin_refresh_token';
const DEVICE_UUID_KEY = 'omar_device_uuid';
const USER_KEY = 'omar_admin_user';

export function getOrCreateDeviceUuid(): string {
  if (typeof window === 'undefined') {
    return '00000000-0000-0000-0000-000000000001';
  }
  let uuid = localStorage.getItem(DEVICE_UUID_KEY);
  if (!uuid) {
    // Generate standard v4 UUID
    uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    localStorage.setItem(DEVICE_UUID_KEY, uuid);
  }
  return uuid;
}

export function getStoredAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function storeTokens(tokens: Tokens): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
}

export function clearStoredAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
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
  const url = `${API_BASE_URL}${cleanEndpoint}`;

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
      if (refreshToken) {
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
              const newTokens: Tokens = data.data?.tokens || data.tokens;
              if (newTokens) {
                storeTokens(newTokens);
                isRefreshing = false;
                onRefreshed(newTokens.access_token);
                // Retry with new token
                headers.set('Authorization', `Bearer ${newTokens.access_token}`);
                return request<T>(endpoint, { ...options, headers }, false);
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
