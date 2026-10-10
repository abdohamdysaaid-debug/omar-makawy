export type PackageStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | string;
export type PackageType = 'MONTHLY' | 'TERM';

export interface PackageCourse {
  course_id: string;
  title_ar: string;
  title_en: string;
  slug?: string;
  price?: number;
}

export interface PackageItem {
  id: string;
  academic_year_id: string;
  title_ar: string;
  title_en: string;
  package_type?: PackageType;
  target_video_count?: number;
  grace_period_days?: number;
  description_ar?: string | null;
  description_en?: string | null;
  thumbnail_url?: string | null;
  price: number;
  discount_price?: number | null;
  duration_days?: number | null;
  is_published: boolean;
  is_public?: boolean;
  is_featured?: boolean;
  status?: PackageStatus;
  created_at: string;
  updated_at: string;
  academic_year_name_ar?: string | null;
  academic_year_name_en?: string | null;
  courses?: PackageCourse[];
  lecture_count?: number;
  lectures_count?: number;
  student_count?: number;
  students_count?: number;
}

export type PackageDetail = PackageItem;

export interface PackagesListQuery {
  page?: number;
  limit?: number;
  search?: string;
  package_type?: PackageType;
  is_published?: boolean;
  is_public?: boolean;
  is_featured?: boolean;
  academic_year_id?: string;
}

export interface PackagesListResponse {
  data: PackageItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreatePackagePayload {
  academic_year_id: string;
  title_ar: string;
  title_en?: string;
  package_type?: PackageType;
  target_video_count?: number;
  grace_period_days?: number;
  description_ar?: string;
  description_en?: string;
  thumbnail_url?: string;
  price: number;
  discount_price?: number;
  duration_days?: number;
  is_published?: boolean;
  is_public?: boolean;
  is_featured?: boolean;
  status?: string;
  course_ids?: string[];
}

export interface UpdatePackagePayload {
  title_ar?: string;
  title_en?: string;
  package_type?: PackageType;
  target_video_count?: number;
  grace_period_days?: number;
  description_ar?: string;
  description_en?: string;
  thumbnail_url?: string;
  price?: number;
  discount_price?: number;
  duration_days?: number;
  is_published?: boolean;
  is_public?: boolean;
  is_featured?: boolean;
  status?: string;
}

export interface DeletePackageResponse {
  success: boolean;
  message: string;
}
