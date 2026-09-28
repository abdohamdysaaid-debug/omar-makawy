import { apiClient, getOrCreateDeviceUuid } from './client';
import { LoginResponse, AuthSuccessResponse, User } from './types';

export interface LoginCredentials {
  phone: string;
  password: string;
  device_type?: string;
  os_info?: string;
  browser_info?: string;
  model_name?: string;
  two_factor_code?: string;
}

export interface RegisterPayload {
  full_name: string;
  phone: string;
  whatsapp_phone: string;
  parent_phone: string;
  email: string;
  governorate_id: string;
  gender: string;
  password: string;
  education_type: string;
  study_type: string;
  academic_year_id: string;
  section?: string;
  school_name?: string;
  device_uuid?: string;
  device_type?: string;
  os_info?: string;
  browser_info?: string;
  model_name?: string;
}

export interface Governorate {
  id: string;
  code: string;
  name_ar: string;
  name_en: string;
}

export const authApi = {
  async register(data: RegisterPayload): Promise<AuthSuccessResponse> {
    const deviceUuid = getOrCreateDeviceUuid();
    return apiClient.post<AuthSuccessResponse>('/auth/register', {
      ...data,
      device_uuid: deviceUuid,
      device_type: data.device_type || 'WEB',
      os_info: data.os_info || (typeof navigator !== 'undefined' ? navigator.platform : 'Desktop'),
      browser_info: data.browser_info || (typeof navigator !== 'undefined' ? navigator.userAgent.split(' ')[0] : 'Browser'),
      model_name: data.model_name || 'Web Dashboard',
    });
  },

  async getGovernorates(): Promise<Governorate[]> {
    return apiClient.get<Governorate[]>('/auth/governorates').catch(() => []);
  },

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const deviceUuid = getOrCreateDeviceUuid();
    return apiClient.post<LoginResponse>('/auth/login', {
      phone: credentials.phone,
      password: credentials.password,
      device_uuid: deviceUuid,
      device_type: credentials.device_type || 'WEB',
      os_info: credentials.os_info || (typeof navigator !== 'undefined' ? navigator.platform : 'Desktop'),
      browser_info: credentials.browser_info || (typeof navigator !== 'undefined' ? navigator.userAgent.split(' ')[0] : 'Browser'),
      model_name: credentials.model_name || 'Web Dashboard',
      two_factor_code: credentials.two_factor_code,
    });
  },

  async verifyTwoFactorChallenge(challengeToken: string, code: string): Promise<AuthSuccessResponse> {
    const deviceUuid = getOrCreateDeviceUuid();
    return apiClient.post<AuthSuccessResponse>('/auth/2fa/verify-challenge', {
      challenge_token: challengeToken,
      code,
      device_uuid: deviceUuid,
    });
  },

  async refreshToken(refreshToken: string): Promise<AuthSuccessResponse> {
    const deviceUuid = getOrCreateDeviceUuid();
    return apiClient.post<AuthSuccessResponse>('/auth/refresh', {
      refresh_token: refreshToken,
      device_uuid: deviceUuid,
    });
  },

  async logout(): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>('/auth/logout');
  },

  async getMe(): Promise<User> {
    return apiClient.get<User>('/auth/me');
  },
};
