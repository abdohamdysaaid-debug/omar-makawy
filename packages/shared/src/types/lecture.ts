import { LectureChapterItem } from './lectureChapter';
import { AttachmentItem } from './attachment';

export type LectureStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | string;
export type LectureAccessType = 'FREE' | 'ALL' | 'ENROLLED_ONLY' | 'PURCHASED_ONLY' | string;

export interface LectureItem {
  id: string;
  course_id: string;
  academic_year_id: string;
  title_ar: string;
  title_en: string;
  description_ar?: string | null;
  description_en?: string | null;
  sequence_order: number;
  is_free: boolean;
  is_published: boolean;
  status: LectureStatus;
  duration_seconds: number;
  access_type: LectureAccessType;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
  videos?: any[];
  chapters?: LectureChapterItem[];
  attachments?: AttachmentItem[];
}

export type LectureDetail = LectureItem;

export interface CreateLecturePayload {
  title_ar: string;
  title_en: string;
  description_ar?: string;
  description_en?: string;
  sequence_order?: number;
  is_free?: boolean;
  is_published?: boolean;
  status?: string;
  access_type?: string;
  duration_seconds?: number;
}

export interface UpdateLecturePayload {
  title_ar?: string;
  title_en?: string;
  description_ar?: string;
  description_en?: string;
  sequence_order?: number;
  is_free?: boolean;
  is_published?: boolean;
  status?: string;
  access_type?: string;
  duration_seconds?: number;
}

export interface DeleteLectureResponse {
  success: boolean;
  message: string;
}
