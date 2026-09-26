export interface LectureChapterItem {
  id: string;
  lecture_id: string;
  timestamp_seconds: number;
  title_ar: string;
  title_en: string;
  sequence_order: number;
  created_at?: string;
}

export interface CreateChapterPayload {
  title_ar: string;
  title_en: string;
  timestamp_seconds: number;
  sequence_order?: number;
}

export interface DeleteChapterResponse {
  success: boolean;
  message: string;
}
