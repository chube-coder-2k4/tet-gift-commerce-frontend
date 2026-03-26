import { fetchWithAuth, ApiResponse } from './api';

// Types
export interface ProductMinimalImage {
  id: number;
  imageUrl: string;
  imageType: string;
  publicId: string;
  primary: boolean;
}

export interface BundleProduct {
  id: number;
  productId: number;
  productName: string;
  productPrice: number;
  quantity: number;
  images: ProductMinimalImage[];
}

export interface BundleResponse {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  custom: boolean;
  active: boolean;
  products: BundleProduct[];
}

export interface BundleProductRequest {
  productId: number;
  quantity: number;
}

export interface BundleRequest {
  name: string;
  price: number;
  isCustom: boolean;
  description?: string;
  products: BundleProductRequest[];
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

  // POST /bundles
  create: async (data: BundleRequest): Promise<ApiResponse<number>> => {
    return fetchWithAuth<number>('/bundles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
