import {
  createApiClient,
  defaultApiClient,
  RequestOptions,
} from './client';
import {
  BookItem,
  BookQueryOptions,
  PaginatedBooksResponse,
  CreateBookPayload,
  UpdateBookPayload,
  AdjustInventoryPayload,
  InventoryLedgerItem,
  PaginatedInventoryLedgerResponse,
} from '../types/book';

export function createBooksApi(client = defaultApiClient) {
  return {
    async listBooks(
      query: BookQueryOptions = {},
      academicYearId?: string
    ): Promise<PaginatedBooksResponse> {
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
      if (query.academic_year_id) {
        params.set('academic_year_id', query.academic_year_id);
      }

      const queryString = params.toString();
      const endpoint = queryString ? `/books?${queryString}` : '/books';

      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }

      return client.get<PaginatedBooksResponse>(endpoint, options);
    },

    async getBookById(
      id: string,
      academicYearId?: string
    ): Promise<BookItem> {
      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }
      return client.get<BookItem>(`/books/${id}`, options);
    },

    async createBook(
      payload: CreateBookPayload,
      academicYearId?: string
    ): Promise<BookItem> {
      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }
      return client.post<BookItem>('/books', payload, options);
    },

    async updateBook(
      id: string,
      payload: UpdateBookPayload,
      academicYearId?: string
    ): Promise<BookItem> {
      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }
      return client.put<BookItem>(`/books/${id}`, payload, options);
    },

    async publishBook(
      id: string,
      academicYearId?: string
    ): Promise<BookItem> {
      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }
      return client.post<BookItem>(`/books/${id}/publish`, {}, options);
    },

    async unpublishBook(
      id: string,
      academicYearId?: string
    ): Promise<BookItem> {
      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }
      return client.post<BookItem>(`/books/${id}/unpublish`, {}, options);
    },

    async adjustInventory(
      id: string,
      payload: AdjustInventoryPayload,
      academicYearId?: string
    ): Promise<InventoryLedgerItem> {
      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }
      return client.post<InventoryLedgerItem>(`/books/${id}/inventory/adjust`, payload, options);
    },

    async getInventoryLedger(
      id: string,
      query: { page?: number; limit?: number } = {},
      academicYearId?: string
    ): Promise<PaginatedInventoryLedgerResponse> {
      const params = new URLSearchParams();
      if (query.page && query.page > 0) {
        params.set('page', String(query.page));
      }
      if (query.limit && query.limit > 0) {
        params.set('limit', String(query.limit));
      }

      const queryString = params.toString();
      const endpoint = queryString
        ? `/books/${id}/inventory/ledger?${queryString}`
        : `/books/${id}/inventory/ledger`;

      const options: RequestOptions = {};
      if (academicYearId) {
        options.academicYearId = academicYearId;
      }

      return client.get<PaginatedInventoryLedgerResponse>(endpoint, options);
    },
  };
}

export const defaultBooksApi = createBooksApi(defaultApiClient);
