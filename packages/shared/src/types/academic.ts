export interface AcademicYear {
  id: string;
  name_ar: string;
  name_en: string;
  code: string;
  order_index?: number;
  is_active?: boolean;
  created_at?: string;
}

export interface Governorate {
  id: string;
  name_ar: string;
  name_en: string;
  shipping_cost: number;
  is_active: boolean;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
