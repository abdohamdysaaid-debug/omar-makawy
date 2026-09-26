import {
  createApiClient,
  defaultApiClient,
  RequestOptions,
} from './client';
import {
  StudentsListQuery,
  StudentsListResponse,
  StudentDetail,
  StudentDevice,
  UpdateStudentStatusPayload,
  UpdateStudentStatusResponse,
} from '../types/student';

export function createStudentsApi(client = defaultApiClient) {
  return {
    async listStudents(
      query: StudentsListQuery = {},
      academicYearId?: string
    ): Promise<StudentsListResponse> {
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
      if (query.status) {
        params.set('status', query.status);
      }
      if (query.academic_year_id) {
        params.set('academic_year_id', query.academic_year_id);
      }
      if (query.governorate_id) {
        params.set('governorate_id', query.governorate_id);
      }

      const queryString = params.toString();
      const endpoint = queryString
        ? `/admin/students?${queryString}`
        : '/admin/students';

      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }

      return client.get<StudentsListResponse>(endpoint, options);
    },

    async getStudentById(
      id: string,
      academicYearId?: string
    ): Promise<StudentDetail> {
      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }
      return client.get<StudentDetail>(`/admin/students/${id}`, options);
    },

    async updateStudentStatus(
      id: string,
      payload: UpdateStudentStatusPayload,
      academicYearId?: string
    ): Promise<UpdateStudentStatusResponse> {
      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }
      return client.patch<UpdateStudentStatusResponse>(
        `/admin/students/${id}/status`,
        payload,
        options
      );
    },

    async getStudentDevices(
      id: string,
      academicYearId?: string
    ): Promise<StudentDevice[]> {
      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }
      return client.get<StudentDevice[]>(`/admin/students/${id}/devices`, options);
    },

    async unbindStudentDevice(
      studentId: string,
      deviceId: string,
      academicYearId?: string
    ): Promise<{ success: boolean; message: string }> {
      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }
      return client.delete<{ success: boolean; message: string }>(
        `/admin/students/${studentId}/devices/${deviceId}`,
        options
      );
    },
  };
}

export const defaultStudentsApi = createStudentsApi();
