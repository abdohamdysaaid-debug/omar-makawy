import {
  createApiClient,
  defaultApiClient,
  RequestOptions,
} from './client';
import {
  LectureItem,
  LectureDetail,
  CreateLecturePayload,
  UpdateLecturePayload,
  LecturesListQuery,
  PaginatedLecturesResponse,
  DeleteLectureResponse,
} from '../types/lecture';
import {
  LectureChapterItem,
  CreateChapterPayload,
  DeleteChapterResponse,
} from '../types/lectureChapter';

export function createLecturesApi(client = defaultApiClient) {
  return {
    async listLectures(
      query?: LecturesListQuery,
      academicYearId?: string
    ): Promise<PaginatedLecturesResponse> {
      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }

      const params = new URLSearchParams();
      if (query?.page) params.append('page', String(query.page));
      if (query?.limit) params.append('limit', String(query.limit));
      if (query?.search) params.append('search', query.search);
      if (query?.academic_year_id) params.append('academic_year_id', query.academic_year_id);
      if (query?.status) params.append('status', query.status);
      if (query?.visibility) params.append('visibility', query.visibility);
      if (query?.course_id) params.append('course_id', query.course_id);
      if (query?.package_id) params.append('package_id', query.package_id);
      if (query?.is_published !== undefined) params.append('is_published', String(query.is_published));

      const queryString = params.toString();
      const endpoint = queryString ? `/lectures?${queryString}` : `/lectures`;
      return client.get<PaginatedLecturesResponse>(endpoint, options);
    },

    async listCourseLectures(
      courseId: string,
      academicYearId?: string
    ): Promise<LectureItem[]> {
      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }
      return client.get<LectureItem[]>(`/courses/${courseId}/lectures`, options);
    },

    async getMyLectures(academicYearId?: string): Promise<LectureItem[]> {
      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }
      return client.get<LectureItem[]>(`/lectures/my-lectures`, options);
    },

    async getLectureById(
      id: string,
      academicYearId?: string
    ): Promise<LectureDetail> {
      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }
      return client.get<LectureDetail>(`/lectures/${id}`, options);
    },

    async uploadThumbnail(
      file: File,
      academicYearId?: string
    ): Promise<{ url: string }> {
      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }
      const formData = new FormData();
      formData.append('file', file);
      if (academicYearId) {
        formData.append('academic_year_id', academicYearId);
      }
      return client.post<{ url: string }>(`/lectures/upload-thumbnail`, formData, options);
    },

    async createLecture(
      payload: CreateLecturePayload,
      academicYearId?: string
    ): Promise<LectureItem> {
      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }
      return client.post<LectureItem>(`/lectures`, payload, options);
    },

    async updateLecture(
      id: string,
      payload: UpdateLecturePayload,
      academicYearId?: string
    ): Promise<LectureItem> {
      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }
      return client.patch<LectureItem>(`/lectures/${id}`, payload, options);
    },

    async deleteLecture(
      id: string,
      academicYearId?: string
    ): Promise<DeleteLectureResponse> {
      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }
      return client.delete<DeleteLectureResponse>(`/lectures/${id}`, options);
    },

    // --- Chapters / Index ---
    async addChapter(
      lectureId: string,
      payload: CreateChapterPayload,
      academicYearId?: string
    ): Promise<LectureChapterItem> {
      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }
      return client.post<LectureChapterItem>(`/lectures/${lectureId}/chapters`, payload, options);
    },

    async deleteChapter(
      lectureId: string,
      chapterId: string,
      academicYearId?: string
    ): Promise<DeleteChapterResponse> {
      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }
      return client.delete<DeleteChapterResponse>(
        `/lectures/${lectureId}/chapters/${chapterId}`,
        options
      );
    },
  };
}

export const defaultLecturesApi = createLecturesApi(defaultApiClient);
