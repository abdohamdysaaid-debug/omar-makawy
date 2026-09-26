import { createApiClient, getOrCreateDeviceUuid, DEFAULT_STORAGE_KEYS } from './client';
import {
  LoginPayload,
  LoginResponse,
  AuthSuccessResponse,
  TwoFactorVerifyChallengePayload,
  TwoFactorSecretResponse,
  TwoFactorEnablePayload,
  TwoFactorDisablePayload,
  User,
} from '../types';

export function createAuthApi(apiClient = createApiClient()) {
  return {
    async login(credentials: Omit<LoginPayload, 'device_uuid'> & { device_uuid?: string }): Promise<LoginResponse> {
      const deviceUuid = credentials.device_uuid || getOrCreateDeviceUuid(DEFAULT_STORAGE_KEYS.DEVICE_UUID);
      return apiClient.post<LoginResponse>(
        '/auth/login',
        {
          phone: credentials.phone,
          password: credentials.password,
          device_uuid: deviceUuid,
          device_type: credentials.device_type || 'WEB',
          os_info: credentials.os_info || (typeof navigator !== 'undefined' ? navigator.platform : 'Desktop'),
          browser_info:
            credentials.browser_info ||
            (typeof navigator !== 'undefined' ? navigator.userAgent.split(' ')[0] : 'Browser'),
          model_name: credentials.model_name || 'Staff Portal',
          two_factor_code: credentials.two_factor_code,
        },
        { skipAuth: true }
      );
    },

    async verifyTwoFactorChallenge(payload: Omit<TwoFactorVerifyChallengePayload, 'device_uuid'> & { device_uuid?: string }): Promise<AuthSuccessResponse> {
      const deviceUuid = payload.device_uuid || getOrCreateDeviceUuid(DEFAULT_STORAGE_KEYS.DEVICE_UUID);
      return apiClient.post<AuthSuccessResponse>(
        '/auth/2fa/verify-challenge',
        {
          challenge_token: payload.challenge_token,
          code: payload.code,
          device_uuid: deviceUuid,
        },
        { skipAuth: true }
      );
    },

    async refreshToken(refreshToken: string, deviceUuid?: string): Promise<AuthSuccessResponse> {
      const uuid = deviceUuid || getOrCreateDeviceUuid(DEFAULT_STORAGE_KEYS.DEVICE_UUID);
      return apiClient.post<AuthSuccessResponse>(
        '/auth/refresh',
        {
          refresh_token: refreshToken,
          device_uuid: uuid,
        },
        { skipAuth: true }
      );
    },

    async logout(): Promise<{ success: boolean; message: string }> {
      return apiClient.post<{ success: boolean; message: string }>('/auth/logout');
    },

    async getMe(): Promise<User> {
      return apiClient.get<User>('/auth/me');
    },

    async generateTwoFactorSecret(): Promise<TwoFactorSecretResponse> {
      return apiClient.post<TwoFactorSecretResponse>('/auth/2fa/generate');
    },

    async enableTwoFactor(dto: TwoFactorEnablePayload): Promise<{ success: boolean; message: string }> {
      return apiClient.post<{ success: boolean; message: string }>('/auth/2fa/enable', dto);
    },

    async disableTwoFactor(dto: TwoFactorDisablePayload): Promise<{ success: boolean; message: string }> {
      return apiClient.post<{ success: boolean; message: string }>('/auth/2fa/disable', dto);
    },
  };
}

export const defaultAuthApi = createAuthApi();
