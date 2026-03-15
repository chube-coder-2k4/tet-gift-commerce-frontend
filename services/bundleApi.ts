import { fetchWithAuth, ApiResponse } from './api';

// Types
export interface BundleProduct {
  id: number;
  productId: number;
  productName: string;
  productPrice: number;
  quantity: number;
}

export interface BundleResponse {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  isCustom: boolean;
  isActive: boolean;
  products: BundleProduct[];
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}

export interface PageResponse<T> {
  pageNo: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  data: T[];
}

// Bundle API (public endpoints)
export const bundleApi = {
  // GET /bundles?page=0&size=10&sortBy=createdAt&sortDir=desc
  getAll: async (params?: PaginationParams): Promise<ApiResponse<PageResponse<BundleResponse>>> => {
    const searchParams = new URLSearchParams();
    if (params?.page !== undefined) searchParams.set('page', params.page.toString());
    if (params?.size !== undefined) searchParams.set('size', params.size.toString());
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortDir) searchParams.set('sortDir', params.sortDir);

    const query = searchParams.toString();
    return fetchWithAuth<PageResponse<BundleResponse>>(`/bundles${query ? `?${query}` : ''}`);
  },

  // GET /bundles/{id}
  getById: async (id: number): Promise<ApiResponse<BundleResponse>> => {
    return fetchWithAuth<BundleResponse>(`/bundles/${id}`);
  },
};
