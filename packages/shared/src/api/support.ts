import { defaultApiClient, createApiClient } from './client';

export interface SupportTicket {
  id: string;
  ticket_number: string;
  student_id: string;
  subject: string;
  category: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_STUDENT' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  assigned_to?: string;
  assigned_to_name?: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  student_name?: string;
  student_phone?: string;
  student_email?: string;
  academic_year_name?: string;
  last_message?: string;
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_type: 'STUDENT' | 'STAFF';
  sender_name?: string;
  message: string;
  attachments?: Array<{
    file_name: string;
    file_url: string;
    file_size?: number;
    mime_type?: string;
  }>;
  created_at: string;
}

export interface TicketDetailsResponse extends SupportTicket {
  messages: SupportMessage[];
}

export interface SupportTicketsListResponse {
  data: SupportTicket[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function createSupportApi(client = defaultApiClient) {
  return {
    // Staff endpoints
    getStaffTickets: async (params?: {
      status?: string;
      category?: string;
      search?: string;
      page?: number;
      limit?: number;
    }): Promise<SupportTicketsListResponse> => {
      const q = new URLSearchParams();
      if (params?.status) q.set('status', params.status);
      if (params?.category) q.set('category', params.category);
      if (params?.search) q.set('search', params.search);
      if (params?.page) q.set('page', String(params.page));
      if (params?.limit) q.set('limit', String(params.limit));
      const url = q.toString() ? `/admin/support/tickets?${q.toString()}` : '/admin/support/tickets';
      return client.get<SupportTicketsListResponse>(url);
    },

    getStaffTicketDetails: async (id: string): Promise<TicketDetailsResponse> => {
      return client.get<TicketDetailsResponse>(`/admin/support/tickets/${id}`);
    },

    sendStaffReply: async (
      id: string,
      data: { message: string; attachments?: any[] }
    ): Promise<SupportMessage> => {
      return client.post<SupportMessage>(`/admin/support/tickets/${id}/replies`, data);
    },

    updateTicketStatus: async (
      id: string,
      data: { status: string; assigned_to?: string }
    ): Promise<SupportTicket> => {
      return client.patch<SupportTicket>(`/admin/support/tickets/${id}/status`, data);
    },

    // Student endpoints
    createStudentTicket: async (data: {
      subject: string;
      category?: string;
      message: string;
      attachments?: any[];
    }): Promise<TicketDetailsResponse> => {
      return client.post<TicketDetailsResponse>('/support/tickets', data);
    },

    getStudentTickets: async (params?: {
      status?: string;
      page?: number;
      limit?: number;
    }): Promise<SupportTicketsListResponse> => {
      const q = new URLSearchParams();
      if (params?.status) q.set('status', params.status);
      if (params?.page) q.set('page', String(params.page));
      if (params?.limit) q.set('limit', String(params.limit));
      const url = q.toString() ? `/support/tickets?${q.toString()}` : '/support/tickets';
      return client.get<SupportTicketsListResponse>(url);
    },

    getStudentTicketDetails: async (id: string): Promise<TicketDetailsResponse> => {
      return client.get<TicketDetailsResponse>(`/support/tickets/${id}`);
    },

    sendStudentReply: async (
      id: string,
      data: { message: string; attachments?: any[] }
    ): Promise<SupportMessage> => {
      return client.post<SupportMessage>(`/support/tickets/${id}/replies`, data);
    },

    uploadAttachment: async (file: File): Promise<{
      file_name: string;
      file_url: string;
      file_size: number;
      mime_type: string;
    }> => {
      const formData = new FormData();
      formData.append('file', file);
      return client.post('/support/attachments/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },

    // Public contact settings
    getPublicContact: async (): Promise<{
      facebook_url: string;
      youtube_url: string;
      instagram_url: string;
      x_url: string;
      whatsapp_number: string;
      phone_number: string;
      email: string;
      phone_secondary?: string;
    }> => {
      return client.get('/public/contact');
    },
  };
}
