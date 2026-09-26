import {
  createApiClient,
  defaultApiClient,
  RequestOptions,
} from './client';
import {
  VideoItem,
  VideoType,
  AttachVideoPayload,
  VideoAuthorizationResponse,
  LectureProgressResponse,
} from '../types/video';

export function createVideosApi(client = defaultApiClient) {
  return {
    async getLectureVideos(
      lectureId: string,
      academicYearId?: string
    ): Promise<VideoItem[]> {
      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }
      return client.get<VideoItem[]>(`/lectures/${lectureId}/videos`, options);
    },

    async attachVideo(
      lectureId: string,
      payload: AttachVideoPayload,
      academicYearId?: string
    ): Promise<VideoItem> {
      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }
      return client.post<VideoItem>(`/lectures/${lectureId}/videos`, payload, options);
    },

    async authorizeVideo(
      lectureId: string,
      videoType: VideoType,
      academicYearId?: string
    ): Promise<VideoAuthorizationResponse> {
      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }
      return client.post<VideoAuthorizationResponse>(
        `/lectures/${lectureId}/videos/${videoType}/authorize`,
        {},
        options
      );
    },

    async getLectureProgress(
      lectureId: string,
      studentId?: string,
      academicYearId?: string
    ): Promise<LectureProgressResponse> {
      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }
      const endpoint = studentId
        ? `/lectures/${lectureId}/progress?student_id=${studentId}`
        : `/lectures/${lectureId}/progress`;
      return client.get<LectureProgressResponse>(endpoint, options);
    },
  };
}

export const defaultVideosApi = createVideosApi(defaultApiClient);

/**
 * Helper to extract YouTube 11-char Video ID and construct privacy-enhanced embed URL
 * matching backend YouTubeVideoProvider implementation.
 */
export function extractYouTubeVideoId(input: string): string | null {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();

  // 1. Direct 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // 2. Parse URL
  try {
    const url = new URL(trimmed);
    const hostname = url.hostname.toLowerCase();
    const isYouTube =
      hostname === 'youtube.com' || hostname.endsWith('.youtube.com') || hostname === 'youtu.be';

    if (!isYouTube) return null;

    if (hostname === 'youtu.be') {
      const parts = url.pathname.split('/').filter(Boolean);
      return parts[0] && /^[a-zA-Z0-9_-]{11}$/.test(parts[0]) ? parts[0] : null;
    } else if (url.pathname === '/watch') {
      const v = url.searchParams.get('v');
      return v && /^[a-zA-Z0-9_-]{11}$/.test(v) ? v : null;
    } else if (url.pathname.startsWith('/embed/')) {
      const parts = url.pathname.split('/').filter(Boolean);
      return parts[1] && /^[a-zA-Z0-9_-]{11}$/.test(parts[1]) ? parts[1] : null;
    } else if (url.pathname.startsWith('/v/')) {
      const parts = url.pathname.split('/').filter(Boolean);
      return parts[1] && /^[a-zA-Z0-9_-]{11}$/.test(parts[1]) ? parts[1] : null;
    }
  } catch {
    return null;
  }

  return null;
}

export function buildYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?controls=1&rel=0&playsinline=1&modestbranding=1&enablejsapi=1`;
}
