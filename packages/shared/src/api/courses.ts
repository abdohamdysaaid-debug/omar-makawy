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
  };
}

export const defaultCoursesApi = createCoursesApi(defaultApiClient);
