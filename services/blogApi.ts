import { fetchWithAuth, ApiResponse } from './api';

// Types
export interface BlogTopic {
  id: number;
  name: string;
}

export interface BlogPostResponse {
  id: number;
  title: string;
  content: string;
  image?: string;
  topicName: string;
  topicId: number;
  createdAt: string;
}

export interface PageResponse<T> {
  pageNo: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  data: T[];
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}

// Blog Topics API (public)
export const blogTopicApi = {
  // GET /blog-topics
  getAll: async (): Promise<ApiResponse<BlogTopic[]>> => {
    return fetchWithAuth<BlogTopic[]>('/blog-topics');
  },
};

// Blog Posts API (public)
export const blogApi = {
  // GET /blogs?page=0&size=10
  getAll: async (params?: PaginationParams): Promise<ApiResponse<PageResponse<BlogPostResponse>>> => {
    const searchParams = new URLSearchParams();
    if (params?.page !== undefined) searchParams.set('page', params.page.toString());
    if (params?.size !== undefined) searchParams.set('size', params.size.toString());
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortDir) searchParams.set('sortDir', params.sortDir);

    const query = searchParams.toString();
    return fetchWithAuth<PageResponse<BlogPostResponse>>(`/blogs${query ? `?${query}` : ''}`);
  },

  // GET /blogs/{id}
  getById: async (id: number): Promise<ApiResponse<BlogPostResponse>> => {
    return fetchWithAuth<BlogPostResponse>(`/blogs/${id}`);
  },
};
