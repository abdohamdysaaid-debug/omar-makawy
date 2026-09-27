import { UserRole } from './auth';

export interface SupervisorPermissionItem {
  id: string;
  code: string;
  name_ar: string;
  name_en: string;
  module: string;
}

export interface SupervisorAcademicYearItem {
  id: string;
  name_ar: string;
  name_en: string;
  code: string;
}

export interface SupervisorItem {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  phone_number?: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'SUSPENDED';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  permissions?: SupervisorPermissionItem[];
  academic_years?: SupervisorAcademicYearItem[];
}

export interface SupervisorsListResponse {
  data: SupervisorItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface SupervisorsListQuery {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
}

export interface CreateSupervisorPayload {
  full_name: string;
  email: string;
  phone_number: string;
  password: string;
  role?: 'SUPERVISOR' | 'TEACHER';
  permissions?: string[];
  academic_year_ids?: string[];
}

export interface UpdateSupervisorPayload {
  full_name?: string;
  email?: string;
  phone_number?: string;
  password?: string;
  is_active?: boolean;
  role?: 'SUPERVISOR' | 'TEACHER';
}
