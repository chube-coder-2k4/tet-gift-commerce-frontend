// Product API Service
import { fetchWithAuth, ApiResponse } from './api';

// Types
export interface ProductImage {
  id: number;
  imageUrl: string;
  imageType: string;
  publicId: string;
  isPrimary: boolean;
}

export interface ProductResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: string;
  categoryName: string;
  categoryId: number;
  isActive: boolean;
  manufactureDate?: string;
  expDate?: string;
  images: ProductImage[];
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
  sortDir?: 'asc' | 'desc';
}

// Product API (public endpoints)
export const productApi = {
  // Lấy danh sách sản phẩm (có phân trang)
  getAll: async (params?: PaginationParams): Promise<ApiResponse<PageResponse<ProductResponse>>> => {
    const searchParams = new URLSearchParams();
    if (params?.page !== undefined) searchParams.append('page', params.page.toString());
    if (params?.size !== undefined) searchParams.append('size', params.size.toString());
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortDir) searchParams.append('sortDir', params.sortDir);

    const query = searchParams.toString();
    return fetchWithAuth<PageResponse<ProductResponse>>(`/products${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  },

  // Lấy chi tiết sản phẩm theo ID
  getById: async (id: number): Promise<ApiResponse<ProductResponse>> => {
    return fetchWithAuth<ProductResponse>(`/products/${id}`, {
      method: 'GET',
    });
  },
};
