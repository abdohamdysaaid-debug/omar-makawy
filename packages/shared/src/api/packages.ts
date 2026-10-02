import {
  createApiClient,
  defaultApiClient,
  RequestOptions,
} from './client';
import {
  PackagesListQuery,
  PackagesListResponse,
  PackageDetail,
  CreatePackagePayload,
  UpdatePackagePayload,
  DeletePackageResponse,
} from '../types/package';

export function createPackagesApi(client = defaultApiClient) {
  return {
    async listPackages(
      query: PackagesListQuery = {},
      academicYearId?: string
    ): Promise<PackagesListResponse> {
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
      const endpoint = queryString ? `/packages?${queryString}` : '/packages';

      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }

      return client.get<PackagesListResponse>(endpoint, options);
    },

    async listPublicPackages(
      query: PackagesListQuery = {}
    ): Promise<PackagesListResponse> {
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
      const endpoint = queryString ? `/packages/public?${queryString}` : '/packages/public';

      return client.get<PackagesListResponse>(endpoint);
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

      return client.post<{ url: string }>('/packages/upload-thumbnail', formData, options);
    },

    async getPackageById(
      id: string,
      academicYearId?: string
    ): Promise<PackageDetail> {
      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }
      return client.get<PackageDetail>(`/packages/${id}`, options);
    },

    async createPackage(
      payload: CreatePackagePayload,
      academicYearId?: string
    ): Promise<PackageDetail> {
      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }
      return client.post<PackageDetail>('/packages', payload, options);
    },

    async updatePackage(
      id: string,
      payload: UpdatePackagePayload,
      academicYearId?: string
    ): Promise<PackageDetail> {
      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }
      return client.patch<PackageDetail>(`/packages/${id}`, payload, options);
    },

    async deletePackage(
      id: string,
      academicYearId?: string
    ): Promise<DeletePackageResponse> {
      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }
      return client.delete<DeletePackageResponse>(`/packages/${id}`, options);
    },

    async attachCourses(
      id: string,
      courseIds: string[],
      academicYearId?: string
    ): Promise<{ message: string }> {
      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }
      return client.post<{ message: string }>(`/packages/${id}/courses`, { course_ids: courseIds }, options);
    },

    async removeCourse(
      id: string,
      courseId: string,
      academicYearId?: string
    ): Promise<{ message: string }> {
      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }
      return client.delete<{ message: string }>(`/packages/${id}/courses/${courseId}`, options);
    },
  };
}

export const defaultPackagesApi = createPackagesApi(defaultApiClient);
