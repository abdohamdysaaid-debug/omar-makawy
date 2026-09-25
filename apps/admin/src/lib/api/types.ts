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

export interface AnalyticsOverview {
  kpis: {
    total_students: number;
    active_students: number;
    published_courses: number;
    total_lectures: number;
    total_books: number;
    total_revenue_egp: number;
    wallet_balance_egp: number;
    pending_orders: number;
  };
  academic_years: Array<{
    id: string;
    name_ar: string;
    name_en: string;
    code: string;
    student_count: number;
    course_count: number;
  }>;
  recent_activity: Array<{
    id: string;
    type: string;
    description_ar: string;
    description_en: string;
    timestamp: string;
    actor_name: string;
    metadata?: any;
  }>;
}

export interface AnalyticsStudents {
  total: number;
  active: number;
  blocked: number;
  by_academic_year: Array<{
    academic_year_id: string;
    academic_year_name_ar: string;
    academic_year_name_en: string;
    count: number;
  }>;
  registrations_over_time: Array<{
    date: string;
    count: number;
  }>;
}

export interface AnalyticsFinancial {
  total_revenue_piasters: number;
  total_revenue_egp: number;
  total_invoices: number;
  wallet_total_balance_egp: number;
  revenue_by_month: Array<{
    month: string;
    revenue_egp: number;
    invoices_count: number;
  }>;
}

export interface AnalyticsCourses {
  total_courses: number;
  total_lectures: number;
  total_subscriptions: number;
  courses_breakdown: Array<{
    course_id: string;
    title_ar: string;
    title_en: string;
    academic_year_name_ar: string;
    subscriptions_count: number;
    lectures_count: number;
  }>;
}
