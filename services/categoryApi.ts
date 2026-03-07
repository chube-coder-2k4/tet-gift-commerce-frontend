// Category API Service
import { fetchWithAuth, ApiResponse } from './api';

// Types
export interface CategoryResponse {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}

// Category API (public endpoints)
export const categoryApi = {
  // Lấy tất cả danh mục (active)
  getAll: async (): Promise<ApiResponse<CategoryResponse[]>> => {
    return fetchWithAuth<CategoryResponse[]>('/categories', {
      method: 'GET',
    });
  },

  // Lấy danh mục theo ID
  getById: async (id: number): Promise<ApiResponse<CategoryResponse>> => {
    return fetchWithAuth<CategoryResponse>(`/categories/${id}`, {
      method: 'GET',
    });
  },
};
