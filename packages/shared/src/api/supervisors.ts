import {
  createApiClient,
  defaultApiClient,
  RequestOptions,
} from './client';
import {
  SupervisorsListQuery,
  SupervisorsListResponse,
  SupervisorItem,
  CreateSupervisorPayload,
  UpdateSupervisorPayload,
} from '../types/supervisor';
import { PermissionDefinition } from '../types/permissions';

export function createSupervisorsApi(client = defaultApiClient) {
  return {
    async getPermissionsCatalog(): Promise<PermissionDefinition[]> {
      return client.get<PermissionDefinition[]>('/admin/supervisors/permissions-catalog');
    },

    async listSupervisors(
      query: SupervisorsListQuery = {},
      academicYearId?: string
    ): Promise<SupervisorsListResponse> {
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
      if (query.is_active !== undefined) {
        params.set('is_active', String(query.is_active));
      }

      const queryString = params.toString();
      const endpoint = queryString
        ? `/admin/supervisors?${queryString}`
        : '/admin/supervisors';

      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }

      return client.get<SupervisorsListResponse>(endpoint, options);
    },

    async getSupervisorById(
      id: string,
      academicYearId?: string
    ): Promise<SupervisorItem> {
      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }
      return client.get<SupervisorItem>(`/admin/supervisors/${id}`, options);
    },

    async createSupervisor(
      payload: CreateSupervisorPayload,
      academicYearId?: string
    ): Promise<SupervisorItem> {
      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }
      return client.post<SupervisorItem>('/admin/supervisors', payload, options);
    },

    async updateSupervisor(
      id: string,
      payload: UpdateSupervisorPayload,
      academicYearId?: string
    ): Promise<SupervisorItem> {
      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }
      return client.put<SupervisorItem>(`/admin/supervisors/${id}`, payload, options);
    },

    async assignPermissions(
      id: string,
      permissions: string[],
      academicYearId?: string
    ): Promise<{ message: string; permissions: string[] }> {
      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }
      return client.put<{ message: string; permissions: string[] }>(
        `/admin/supervisors/${id}/permissions`,
        { permissions },
        options
      );
    },

    async assignAcademicYears(
      id: string,
      academicYearIds: string[],
      academicYearId?: string
    ): Promise<{ message: string; academic_year_ids: string[] }> {
      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }
      return client.put<{ message: string; academic_year_ids: string[] }>(
        `/admin/supervisors/${id}/academic-years`,
        { academic_year_ids: academicYearIds },
        options
      );
    },

    async deleteSupervisor(
      id: string,
      academicYearId?: string
    ): Promise<{ message: string }> {
      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }
      return client.delete<{ message: string }>(`/admin/supervisors/${id}`, options);
    },
  };
}

export const defaultSupervisorsApi = createSupervisorsApi();
