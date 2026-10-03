import { LectureChapterItem } from './lectureChapter';
import { AttachmentItem } from './attachment';
import { VideoItem } from './video';

export type LectureStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | string;
export type LectureVisibility = 'FREE' | 'SUBSCRIBER_ONLY' | 'SCHEDULED' | 'DRAFT' | 'ARCHIVED' | string;
export type LectureAccessType = 'FREE' | 'PAID' | 'ALL' | 'ENROLLED_ONLY' | 'PURCHASED_ONLY' | string;

export interface LectureCourseRelationItem {
  id: string;
  title_ar: string;
  title_en: string;
  slug?: string;
  sort_order: number;
}

export interface LecturePackageRelationItem {
  id: string;
  title_ar: string;
  title_en: string;
  sort_order: number;
}

export interface LectureItem {
  id: string;
  course_id?: string | null;
  academic_year_id: string;
  title_ar: string;
  title_en: string;
  description_ar?: string | null;
  description_en?: string | null;
  sequence_order: number;
  sort_order?: number;
  thumbnail_url?: string | null;
  scheduled_at?: string | null;
  visibility?: LectureVisibility;
  is_free: boolean;
  is_published: boolean;
  status: LectureStatus;
  duration_seconds: number;
  access_type: LectureAccessType;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
  course_ids?: string[];
  package_ids?: string[];
  courses?: LectureCourseRelationItem[];
  packages?: LecturePackageRelationItem[];
  videos?: VideoItem[];
  chapters?: LectureChapterItem[];
  attachments?: AttachmentItem[];
  chapters_count?: number;
  attachments_count?: number;
  academic_year_code?: string;
  academic_year_name_ar?: string;
  academic_year_name_en?: string;
}

export interface LectureCourseRelation {
  lecture_id: string;
  course_id: string;
  sort_order: number;
  created_at: string;
}

export interface LecturePackageRelation {
  lecture_id: string;
  package_id: string;
  sort_order: number;
  created_at: string;
}

export type LectureDetail = LectureItem;

export interface CreateLecturePayload {
  academic_year_id?: string;
  title_ar: string;
  title_en?: string;
  description_ar?: string;
  description_en?: string;
  thumbnail_url?: string;
  sequence_order?: number;
  sort_order?: number;
  scheduled_at?: string | Date | null;
  visibility?: LectureVisibility;
  is_free?: boolean;
  is_published?: boolean;
  status?: string;
  access_type?: string;
  duration_seconds?: number;
  course_ids?: string[];
  package_ids?: string[];
  main_video_url?: string;
  solution_video_url?: string;
}

export interface UpdateLecturePayload {
  academic_year_id?: string;
  title_ar?: string;
  title_en?: string;
  description_ar?: string;
  description_en?: string;
  thumbnail_url?: string;
  sequence_order?: number;
  sort_order?: number;
  scheduled_at?: string | Date | null;
  visibility?: LectureVisibility;
  is_free?: boolean;
  is_published?: boolean;
  status?: string;
  access_type?: string;
  duration_seconds?: number;
  course_ids?: string[];
  package_ids?: string[];
  main_video_url?: string;
  solution_video_url?: string;
}

export interface LecturesListQuery {
  page?: number;
  limit?: number;
  search?: string;
  academic_year_id?: string;
  status?: string;
  visibility?: string;
  course_id?: string;
  package_id?: string;
  is_published?: boolean;
}

export interface PaginatedLecturesResponse {
  items: LectureItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface DeleteLectureResponse {
  success: boolean;
  message: string;
}

/**
 * Resolves thumbnail URL for a lecture with fallback handling.
 */
export function resolveLectureThumbnailUrl(
  lecture?: Partial<LectureItem> | null
): string | null {
  if (!lecture) return null;
  if (lecture.thumbnail_url && lecture.thumbnail_url.trim()) {
    return lecture.thumbnail_url.trim();
  }
  // If main video exists, use its thumbnail
  if (lecture.videos && Array.isArray(lecture.videos)) {
    const mainVideo = lecture.videos.find((v) => v.video_type === 'MAIN');
    if (mainVideo?.thumbnail_url) {
      return mainVideo.thumbnail_url;
    }
    if (mainVideo?.provider_video_id) {
      return `https://img.youtube.com/vi/${mainVideo.provider_video_id}/hqdefault.jpg`;
    }
  }
  return null;
}
