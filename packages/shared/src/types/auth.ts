export type UserRole = 'TEACHER' | 'SUPERVISOR' | 'STUDENT';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'SUSPENDED';

export interface StudentProfile {
  academic_year_id: string;
  parent_phone?: string;
  governorate_id?: string;
  school_name?: string;
  gender?: 'MALE' | 'FEMALE';
}

export interface User {
  id: string;
  phone: string;
  email?: string;
  full_name: string;
  role: UserRole;
  status: UserStatus;
  two_factor_enabled: boolean;
  is_phone_verified: boolean;
  is_email_verified?: boolean;
  academic_year_id?: string;
  permissions?: string[];
  assigned_academic_years?: string[];
  student_profile?: StudentProfile;
  created_at?: string;
  updated_at?: string;
}

export interface Tokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginPayload {
  phone: string;
  password: string;
  device_uuid: string;
  device_type?: 'WEB' | 'ANDROID' | 'IOS' | 'DESKTOP';
  os_info?: string;
  browser_info?: string;
  model_name?: string;
  two_factor_code?: string;
}

export interface AuthSuccessResponse {
  user: User;
  tokens: Tokens;
}

export interface TwoFactorChallengeResponse {
  two_factor_required: true;
  challenge_token: string;
  expires_in: number;
  message: string;
}

export type LoginResponse = AuthSuccessResponse | TwoFactorChallengeResponse;

export interface TwoFactorVerifyChallengePayload {
  challenge_token: string;
  code: string;
  device_uuid: string;
}

export interface TwoFactorSecretResponse {
  secret: string;
  qr_code: string;
  otpauth_url: string;
}

export interface TwoFactorEnablePayload {
  code: string;
}

export interface TwoFactorDisablePayload {
  password?: string;
  code?: string;
}

export interface RefreshTokenPayload {
  refresh_token: string;
  device_uuid: string;
}
