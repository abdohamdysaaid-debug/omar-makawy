export interface User {
  id: string;
  phone: string;
  email?: string;
  full_name: string;
  role: 'TEACHER' | 'SUPERVISOR' | 'STUDENT';
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'SUSPENDED';
  two_factor_enabled: boolean;
  is_phone_verified: boolean;
  academic_year_id?: string;
  permissions?: string[];
  assigned_academic_years?: string[];
  student_profile?: any;
}

export interface Tokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
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

export interface ApiError {
  message: string;
  error_code?: string;
  statusCode?: number;
  details?: any;
}

export interface AcademicYear {
  id: string;
  name_ar: string;
  name_en: string;
  code: string;
  order_index?: number;
  is_active?: boolean;
}
