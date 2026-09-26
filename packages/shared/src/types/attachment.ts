export interface AttachmentItem {
  id: string;
  lecture_id: string;
  title_ar: string;
  title_en: string;
  storage_provider?: string;
  storage_file_id?: string;
  original_filename?: string;
  file_url?: string;
  file_type?: string;
  mime_type?: string;
  file_size_bytes?: number;
  status?: string;
  order_index?: number;
  download_allowed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UploadAttachmentPayload {
  title_ar: string;
  title_en: string;
  file: File | Blob;
  download_allowed?: boolean;
  order_index?: number;
}

export interface UpdateAttachmentPayload {
  title_ar?: string;
  title_en?: string;
  download_allowed?: boolean;
  order_index?: number;
  file?: File | Blob;
}

export interface DeleteAttachmentResponse {
  success: boolean;
  message: string;
}
