const PRODUCTION_API_URL = 'https://api.omarmeckawy.com/api/v1';

class MobileApiClient {
  private baseUrl: string = PRODUCTION_API_URL;
  private token: string | null = null;

  private formatUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.baseUrl}${cleanEndpoint}`;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
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
