import { fetchWithAuth, ApiResponse } from './api';

// Types
export interface ReviewResponse {
  id: number;
  productId: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CreateReviewRequest {
  rating: number;
  comment: string;
}

export interface UpdateReviewRequest {
  rating: number;
  comment: string;
}

export interface PageResponse<T> {
  pageNo: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  data: T[];
}

// Review API
export const reviewApi = {
  // GET /products/{productId}/reviews?page=0&size=10 (public)
  getByProduct: async (
    productId: number,
    page = 0,
    size = 10
  ): Promise<ApiResponse<PageResponse<ReviewResponse>>> => {
    return fetchWithAuth<PageResponse<ReviewResponse>>(
      `/products/${productId}/reviews?page=${page}&size=${size}`
    );
  },

  // POST /products/{productId}/reviews (auth required)
  create: async (
    productId: number,
    request: CreateReviewRequest
  ): Promise<ApiResponse<ReviewResponse>> => {
    return fetchWithAuth<ReviewResponse>(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  // PUT /reviews/{reviewId} (auth required, owner only)
  update: async (
    reviewId: number,
    request: UpdateReviewRequest
  ): Promise<ApiResponse<ReviewResponse>> => {
    return fetchWithAuth<ReviewResponse>(`/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  },

  // DELETE /reviews/{reviewId} (auth required, owner only)
  delete: async (reviewId: number): Promise<ApiResponse<void>> => {
    return fetchWithAuth<void>(`/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  },
};
