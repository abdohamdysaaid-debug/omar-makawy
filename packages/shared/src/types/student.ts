export type StudentAccountStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BLOCKED';

export interface StudentItem {
  id: string;
  phone: string;
  email: string | null;
  full_name: string;
  role: 'STUDENT' | string;
  status: StudentAccountStatus;
  is_active: boolean;
  is_phone_verified: boolean;
  is_email_verified: boolean;
  avatar_url: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  profile_id: string | null;
  academic_year_id: string | null;
  academic_year_code: string | null;
  academic_year_name_ar: string | null;
  academic_year_name_en: string | null;
  parent_phone: string | null;
  governorate_id: string | null;
  governorate_code: string | null;
  governorate_name_ar: string | null;
  governorate_name_en: string | null;
  school_name: string | null;
  gender: 'MALE' | 'FEMALE' | string;
  address: string | null;
}

export type StudentDetail = StudentItem;

export interface StudentDevice {
  id: string;
  user_id: string;
  device_uuid: string;
  device_type: string;
  os_info: string | null;
  browser_info: string | null;
  model_name: string | null;
  status: string;
  is_active: boolean;
  registered_at: string;
  last_active_at: string;
}

export interface StudentsListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: StudentAccountStatus;
  academic_year_id?: string;
  governorate_id?: string;
}

export interface StudentsListResponse {
  items: StudentItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateStudentStatusPayload {
  status: StudentAccountStatus;
  reason?: string;
}

export interface UpdateStudentStatusResponse {
  id: string;
  previous_status: StudentAccountStatus;
  status: StudentAccountStatus;
  is_active: boolean;
  reason: string | null;
  updated_at: string;
}
