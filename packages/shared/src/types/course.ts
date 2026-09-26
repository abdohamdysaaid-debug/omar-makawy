export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | string;

export interface CourseItem {
  id: string;
  academic_year_id: string;
  title_ar: string;
  title_en: string;
  slug: string;
  description_ar?: string | null;
  description_en?: string | null;
  thumbnail_url?: string | null;
  price: number;
  discount_price?: number | null;
  is_published: boolean;
  status: CourseStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
  academic_year_name_ar?: string | null;
  academic_year_name_en?: string | null;
  academic_year_code?: string | null;
}

export type CourseDetail = CourseItem;

export interface CoursesListQuery {
  page?: number;
  limit?: number;
  search?: string;
  is_published?: boolean;
  academic_year_id?: string;
}

export interface CoursesListResponse {
  data: CourseItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateCoursePayload {
  academic_year_id: string;
  title_ar: string;
  title_en: string;
  slug?: string;
  description_ar?: string;
  description_en?: string;
  thumbnail_url?: string;
  price?: number;
  discount_price?: number;
  is_published?: boolean;
  status?: string;
  sort_order?: number;
}

export interface UpdateCoursePayload {
  title_ar?: string;
  title_en?: string;
  slug?: string;
  description_ar?: string;
  description_en?: string;
  thumbnail_url?: string;
  price?: number;
  discount_price?: number;
  is_published?: boolean;
  status?: string;
  sort_order?: number;
}

export interface DeleteCourseResponse {
  success: boolean;
  message: string;
}
