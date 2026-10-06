import {
  createApiClient,
  defaultApiClient,
  RequestOptions,
} from './client';
import {
  CoursesListQuery,
  CoursesListResponse,
  CourseDetail,
  CreateCoursePayload,
  UpdateCoursePayload,
  DeleteCourseResponse,
} from '../types/course';

export function createCoursesApi(client = defaultApiClient) {
  return {
    async listPublicCourses(
      query: CoursesListQuery = {}
    ): Promise<CoursesListResponse> {
      const params = new URLSearchParams();

      if (query.page && query.page > 0) {
        params.set('page', String(query.page));
      }
      if (query.limit && query.limit > 0) {
        params.set('limit', String(query.limit));
      }
      if (query.search && query.search.trim().length > 0) {
        params.set('search', query.search.trim());
      }
      if (query.is_featured !== undefined) {
        params.set('is_featured', String(query.is_featured));
      }
      if (query.academic_year_id) {
        params.set('academic_year_id', query.academic_year_id);
      }

      const queryString = params.toString();
      const endpoint = queryString ? `/courses/public?${queryString}` : '/courses/public';

      return client.get<CoursesListResponse>(endpoint);
    },

    async listCourses(
      query: CoursesListQuery = {},
      academicYearId?: string
    ): Promise<CoursesListResponse> {
      const params = new URLSearchParams();

      if (query.page && query.page > 0) {
        params.set('page', String(query.page));
      }
      if (query.limit && query.limit > 0) {
        params.set('limit', String(query.limit));
      }
      if (query.search && query.search.trim().length > 0) {
        params.set('search', query.search.trim());
      }
      if (query.is_published !== undefined) {
        params.set('is_published', String(query.is_published));
      }
      if (query.is_public !== undefined) {
        params.set('is_public', String(query.is_public));
      }
      if (query.is_featured !== undefined) {
        params.set('is_featured', String(query.is_featured));
      }
      if (query.academic_year_id) {
        params.set('academic_year_id', query.academic_year_id);
      }

      const queryString = params.toString();
      const endpoint = queryString ? `/courses?${queryString}` : '/courses';

      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }

      return client.get<CoursesListResponse>(endpoint, options);
    },

    async uploadThumbnail(
      file: File,
      academicYearId?: string
    ): Promise<{ url: string }> {
      const formData = new FormData();
      formData.append('file', file);

      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }

      return client.post<{ url: string }>('/courses/upload-thumbnail', formData, options);
    },

    async getCourseById(
      id: string,
      academicYearId?: string
    ): Promise<CourseDetail> {
      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }
      return client.get<CourseDetail>(`/courses/${id}`, options);
    },

    async createCourse(
      payload: CreateCoursePayload,
      academicYearId?: string
    ): Promise<CourseDetail> {
      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }
      return client.post<CourseDetail>('/courses', payload, options);
    },

    async updateCourse(
      id: string,
      payload: UpdateCoursePayload,
      academicYearId?: string
    ): Promise<CourseDetail> {
      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }
      return client.patch<CourseDetail>(`/courses/${id}`, payload, options);
    },

    async deleteCourse(
      id: string,
      academicYearId?: string
    ): Promise<DeleteCourseResponse> {
      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }
      return client.delete<DeleteCourseResponse>(`/courses/${id}`, options);
    },

    getThumbnailUrl(courseId: string): string {
      return `/courses/${courseId}/thumbnail`;
    },
  };
}

export function resolveCourseThumbnailUrl(
  course: { id?: string; thumbnail_url?: string | null },
  apiBaseUrl?: string
): string | null {
  if (!course) return null;
  const raw = course.thumbnail_url?.trim();
  if (!raw) return null;

  // 1. Direct blob or data URLs (preview in memory)
  if (raw.startsWith('blob:') || raw.startsWith('data:')) {
    return raw;
  }

  // 2. Direct HTTP/HTTPS public CDN/Storage URLs
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw;
  }

  // 3. Absolute relative path: e.g. /api/v1/courses/... -> prefix API domain
  const apiBase = (
    apiBaseUrl ||
    (typeof process !== 'undefined' && (process.env?.NEXT_PUBLIC_API_URL || process.env?.NEXT_PUBLIC_API_BASE_URL)) ||
    (typeof window !== 'undefined' && window.location?.hostname && typeof window.location.hostname === 'string' && window.location.hostname.includes('omarmeckawy.com')
      ? 'https://api.omarmeckawy.com/api/v1'
      : 'https://api.omarmeckawy.com/api/v1')
  ).replace(/\/+$/, '');

  const serverBase = apiBase.replace(/\/api\/v1\/?$/, '');

  if (raw.startsWith('/api/v1/')) {
    return `${serverBase}${raw}`;
  }

  if (raw.startsWith('/')) {
    return `${serverBase}${raw}`;
  }

  // 4. If course has id, fallback to API proxy route
  if (course.id) {
    return `${apiBase}/courses/${course.id}/thumbnail`;
  }

  return raw;
}

export const defaultCoursesApi = createCoursesApi(defaultApiClient);

