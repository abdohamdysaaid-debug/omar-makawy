export interface BookItem {
  id: string;
  academic_year_id: string;
  title_ar: string;
  title_en: string;
  description_ar?: string | null;
  description_en?: string | null;
  sku: string;
  price: number | string;
  discount_price?: number | string | null;
  stock_quantity: number;
  low_stock_threshold: number;
  cover_image_url?: string | null;
  weight_kg: number | string;
  is_active: boolean;
  type?: 'BOOK' | 'NOTE' | string;
  is_featured?: boolean;
  is_public?: boolean;
  pdf_file_url?: string | null;
  is_pdf_downloadable?: boolean;
  pdf_file_name?: string | null;
  pdf_file_size_bytes?: number | string | null;
  created_at: string;
  updated_at: string;
  academic_year_name_ar?: string;
  academic_year_name_en?: string;
}

export interface BookQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
  academic_year_id?: string;
}

export interface PaginatedBooksResponse {
  data: BookItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateBookPayload {
  academic_year_id: string;
  title_ar: string;
  title_en?: string;
  sku: string;
  price: number;
  discount_price?: number | null;
  description_ar?: string;
  description_en?: string;
  weight_kg?: number;
  cover_image_url?: string;
  is_active?: boolean;
  type?: string;
  is_featured?: boolean;
  is_public?: boolean;
  stock_quantity?: number;
  pdf_file_url?: string;
  is_pdf_downloadable?: boolean;
  pdf_file_name?: string;
  pdf_file_size_bytes?: number;
}

export interface UpdateBookPayload {
  academic_year_id?: string;
  sku?: string;
  title_ar?: string;
  title_en?: string;
  description_ar?: string;
  description_en?: string;
  price?: number;
  discount_price?: number | null;
  weight_kg?: number;
  cover_image_url?: string;
  is_active?: boolean;
  type?: string;
  is_featured?: boolean;
  is_public?: boolean;
  stock_quantity?: number;
  pdf_file_url?: string;
  is_pdf_downloadable?: boolean;
  pdf_file_name?: string;
  pdf_file_size_bytes?: number;
}

export type InventoryLedgerType =
  | 'INITIAL_STOCK'
  | 'RESTOCK'
  | 'SALE'
  | 'ADJUSTMENT_IN'
  | 'ADJUSTMENT_OUT'
  | 'RETURN'
  | 'CANCELLATION_RELEASE';

export interface AdjustInventoryPayload {
  quantity: number;
  type: InventoryLedgerType;
  reason: string;
  idempotency_key?: string;
}

export interface InventoryLedgerItem {
  id: string;
  book_id: string;
  quantity_before: number;
  change_amount: number;
  quantity_after: number;
  type: InventoryLedgerType | string;
  reference_type?: string | null;
  reference_id?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface PaginatedInventoryLedgerResponse {
  data: InventoryLedgerItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
