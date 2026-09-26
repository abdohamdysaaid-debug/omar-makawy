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
  DeleteLectureResponse,
} from '../types/lecture';
import {
  LectureChapterItem,
  CreateChapterPayload,
  DeleteChapterResponse,
} from '../types/lectureChapter';

export function createLecturesApi(client = defaultApiClient) {
  return {
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

    async createLecture(
      courseId: string,
      payload: CreateLecturePayload,
      academicYearId?: string
    ): Promise<LectureItem> {
      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }
      return client.post<LectureItem>(`/courses/${courseId}/lectures`, payload, options);
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

