import {
  createApiClient,
  defaultApiClient,
  RequestOptions,
  DEFAULT_API_BASE_URL,
  DEFAULT_STORAGE_KEYS,
  getOrCreateDeviceUuid,
} from './client';
import {
  AttachmentItem,
  UploadAttachmentPayload,
  UpdateAttachmentPayload,
  DeleteAttachmentResponse,
} from '../types/attachment';
import { ApiError } from '../types/errors';

export function createAttachmentsApi(client = defaultApiClient) {
  return {
    async uploadAttachment(
      lectureId: string,
      payload: UploadAttachmentPayload,
      academicYearId?: string
    ): Promise<AttachmentItem> {
      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }

      const formData = new FormData();
      formData.append('file', payload.file);
      formData.append('title_ar', payload.title_ar);
      formData.append('title_en', payload.title_en);
      if (payload.download_allowed !== undefined) {
        formData.append('download_allowed', String(Boolean(payload.download_allowed)));
      }
      if (payload.order_index !== undefined) {
        formData.append('order_index', String(payload.order_index));
      }

      return client.post<AttachmentItem>(
        `/lectures/${lectureId}/attachments`,
        formData,
        options
      );
    },

    async getAttachmentById(
      id: string,
      academicYearId?: string
    ): Promise<AttachmentItem> {
      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }
      return client.get<AttachmentItem>(`/attachments/${id}`, options);
    },

    async updateAttachment(
      id: string,
      payload: UpdateAttachmentPayload,
      academicYearId?: string
    ): Promise<AttachmentItem> {
      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }

      if (payload.file) {
        const formData = new FormData();
        formData.append('file', payload.file);
        if (payload.title_ar !== undefined) formData.append('title_ar', payload.title_ar);
        if (payload.title_en !== undefined) formData.append('title_en', payload.title_en);
        if (payload.download_allowed !== undefined) {
          formData.append('download_allowed', String(Boolean(payload.download_allowed)));
        }
        if (payload.order_index !== undefined) {
          formData.append('order_index', String(payload.order_index));
        }
        return client.patch<AttachmentItem>(`/attachments/${id}`, formData, options);
      }

      return client.patch<AttachmentItem>(`/attachments/${id}`, payload, options);
    },

    async deleteAttachment(
      id: string,
      academicYearId?: string
    ): Promise<DeleteAttachmentResponse> {
      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }
      return client.delete<DeleteAttachmentResponse>(`/attachments/${id}`, options);
    },

    /**
     * Securely fetches attachment binary stream as a Blob with authorization headers.
     * Never exposes raw Google Drive links or credentials.
     */
    async fetchAttachmentBlob(
      id: string,
      asDownload = false,
      academicYearId?: string
    ): Promise<{ blob: Blob; filename: string; contentType: string }> {
      const token = client.getAccessToken();
      const deviceUuid = getOrCreateDeviceUuid();

      const headers: Record<string, string> = {
        'x-device-id': deviceUuid,
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      if (academicYearId) {
        headers['x-academic-year-id'] = academicYearId;
      }

      const url = `${DEFAULT_API_BASE_URL}/attachments/${id}/access?download=${asDownload ? 'true' : 'false'}`;
      const res = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!res.ok) {
        let errJson: any = null;
        try {
          errJson = await res.json();
        } catch {
          // ignore
        }
        const error: ApiError = {
          message: errJson?.message || `Failed to access attachment (status ${res.status})`,
          error_code: errJson?.error_code || `HTTP_${res.status}`,
          statusCode: res.status,
        };
        throw error;
      }

      const contentType = res.headers.get('content-type') || 'application/pdf';
      const disposition = res.headers.get('content-disposition') || '';
      let filename = `attachment-${id}.pdf`;

      // Extract filename from disposition header
      const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (match && match[1]) {
        filename = decodeURIComponent(match[1].replace(/['"]/g, ''));
      }

      const blob = await res.blob();
      return { blob, filename, contentType };
    },
  };
}

export const defaultAttachmentsApi = createAttachmentsApi(defaultApiClient);
