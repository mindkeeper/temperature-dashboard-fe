interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
export interface PaginatedResponse<T> {
  message: string;
  data: T[];
  meta: {
    pagination: Pagination;
  };
}

export type ApiResponse<T> = {
  message: string;
} & T;
