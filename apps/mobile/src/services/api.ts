const PRODUCTION_API_URL = 'https://api.omarmeckawy.com/api/v1';
const TOKEN_STORAGE_KEY = 'omar_mobile_token';

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
  const baseUrl = PRODUCTION_API_URL.replace(/\/api\/v1\/?$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${cleanPath}`;
}

class MobileApiClient {
  private baseUrl: string = PRODUCTION_API_URL;
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved =
          localStorage.getItem(TOKEN_STORAGE_KEY) ||
          localStorage.getItem('omar_student_access_token') ||
          localStorage.getItem('omar_staff_access_token') ||
          localStorage.getItem('omar_access_token');
        if (saved) {
          this.token = saved;
        }
      } catch {}
    }
  }

  private formatUrl(endpoint: string): string {
    let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    if (this.baseUrl.endsWith('/api/v1') && (cleanEndpoint === '/api/v1' || cleanEndpoint.startsWith('/api/v1/'))) {
      cleanEndpoint = cleanEndpoint.replace(/^\/api\/v1/, '') || '/';
    }
    return `${this.baseUrl}${cleanEndpoint}`;
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        if (token) {
          localStorage.setItem(TOKEN_STORAGE_KEY, token);
        } else {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
        }
      } catch {}
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined' && window.localStorage) {
      try {
        this.token =
          localStorage.getItem(TOKEN_STORAGE_KEY) ||
          localStorage.getItem('omar_student_access_token') ||
          localStorage.getItem('omar_staff_access_token') ||
          localStorage.getItem('omar_access_token');
      } catch {}
    }
    return this.token;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async get<T = any>(endpoint: string): Promise<T> {
    const res = await fetch(this.formatUrl(endpoint), {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'حدث خطأ في الاتصال بالخادم' }));
      throw new Error(err.message || 'فشل الاتصال بالخادم');
    }

    return res.json();
  }

  async post<T = any>(endpoint: string, body?: any): Promise<T> {
    const res = await fetch(this.formatUrl(endpoint), {
      method: 'POST',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'حدث خطأ أثناء إجراء العملية' }));
      throw new Error(err.message || 'فشل إجراء العملية');
    }

    return res.json();
  }

  async patch<T = any>(endpoint: string, body?: any): Promise<T> {
    const res = await fetch(this.formatUrl(endpoint), {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'حدث خطأ أثناء تحديث البيانات' }));
      throw new Error(err.message || 'فشل تحديث البيانات');
    }

    return res.json();
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    const res = await fetch(this.formatUrl(endpoint), {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'حدث خطأ أثناء الحذف' }));
      throw new Error(err.message || 'فشل الحذف');
    }

    return res.json();
  }
}

export const mobileApiClient = new MobileApiClient();
