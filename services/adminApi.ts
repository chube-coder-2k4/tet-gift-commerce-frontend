// Admin API Service — All CRUD endpoints for admin panel
import { fetchWithAuth, ApiResponse, UserResponse, tokenStorage } from './api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.quanghuycoder.id.vn/api/v1';

// ===== Shared =====
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

function buildQuery(params?: PaginationParams): string {
  if (!params) return '';
  const sp = new URLSearchParams();
  if (params.page !== undefined) sp.set('page', params.page.toString());
  if (params.size !== undefined) sp.set('size', params.size.toString());
  if (params.sortBy) sp.set('sortBy', params.sortBy);
  if (params.sortDir) sp.set('sortDir', params.sortDir);
  const q = sp.toString();
  return q ? `?${q}` : '';
}

// ===== Role =====
export interface RoleResponse {
  id: number;
  name: string;
  description: string;
}

export interface RoleRequest {
  name: string;
  description: string;
}

export const adminRoleApi = {
  getAll: async (): Promise<ApiResponse<RoleResponse[]>> =>
    fetchWithAuth<RoleResponse[]>('/role'),

  getById: async (id: number): Promise<ApiResponse<RoleResponse>> =>
    fetchWithAuth<RoleResponse>(`/role/${id}`),

  create: async (data: RoleRequest): Promise<ApiResponse<RoleResponse>> =>
    fetchWithAuth<RoleResponse>('/role', { method: 'POST', body: JSON.stringify(data) }),

  update: async (id: number, data: RoleRequest): Promise<ApiResponse<RoleResponse>> =>
    fetchWithAuth<RoleResponse>(`/role?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: async (id: number): Promise<ApiResponse<string>> =>
    fetchWithAuth<string>(`/role?id=${id}`, { method: 'DELETE' }),
};

// ===== User (Admin) =====
export const adminUserApi = {
  getAll: async (params?: PaginationParams): Promise<ApiResponse<PageResponse<UserResponse>>> =>
    fetchWithAuth<PageResponse<UserResponse>>(`/user${buildQuery(params)}`),

  getById: async (id: number): Promise<ApiResponse<UserResponse>> =>
    fetchWithAuth<UserResponse>(`/user/${id}`),

  update: async (id: number, data: { fullName?: string; phone?: string }): Promise<ApiResponse<number>> =>
    fetchWithAuth<number>(`/user/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: async (id: number): Promise<ApiResponse<string>> =>
    fetchWithAuth<string>(`/user/${id}`, { method: 'DELETE' }),
};

// ===== Category (Admin) =====
export interface CategoryRequest {
  name: string;
  description?: string;
}

export interface CategoryResponse {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}

export const adminCategoryApi = {
  getAll: async (): Promise<ApiResponse<CategoryResponse[]>> =>
    fetchWithAuth<CategoryResponse[]>('/categories'),

  getById: async (id: number): Promise<ApiResponse<CategoryResponse>> =>
    fetchWithAuth<CategoryResponse>(`/categories/${id}`),

  create: async (data: CategoryRequest): Promise<ApiResponse<CategoryResponse>> =>
    fetchWithAuth<CategoryResponse>('/categories', { method: 'POST', body: JSON.stringify(data) }),

  update: async (id: number, data: CategoryRequest): Promise<ApiResponse<CategoryResponse>> =>
    fetchWithAuth<CategoryResponse>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: async (id: number): Promise<ApiResponse<string>> =>
    fetchWithAuth<string>(`/categories/${id}`, { method: 'DELETE' }),
};

// ===== Product (Admin) =====
export interface ProductImageRequest {
  imageUrl: string;
  imageType: string;
  publicId: string;
  isPrimary: boolean;
}

export interface ProductRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number;
  manufactureDate?: string;
  expDate?: string;
  images?: ProductImageRequest[];
}

export interface ProductImageResponse {
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
  primaryImage?: string;
  image?: string;
  categoryName: string;
  categoryId: number;
  isActive: boolean;
  manufactureDate?: string;
  expDate?: string;
  images: ProductImageResponse[];
}

export const adminProductApi = {
  getAll: async (params?: PaginationParams): Promise<ApiResponse<PageResponse<ProductResponse>>> =>
    fetchWithAuth<PageResponse<ProductResponse>>(`/products${buildQuery(params)}`),

  getById: async (id: number): Promise<ApiResponse<ProductResponse>> =>
    fetchWithAuth<ProductResponse>(`/products/${id}`),

  // JSON-only create (no file upload)
  create: async (data: ProductRequest): Promise<ApiResponse<number>> =>
    fetchWithAuth<number>('/products/register', { method: 'POST', body: JSON.stringify(data) }),

  // Multipart create (with file upload — multi images)
  createWithImages: async (data: ProductRequest, imageFiles?: File[]): Promise<ApiResponse<number>> => {
    const formData = new FormData();
    formData.append('request', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach(file => {
        formData.append('images', file);
      });
    }
    const accessToken = tokenStorage.getAccessToken();
    const response = await fetch(`${API_BASE_URL}/products/register`, {
      method: 'POST',
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: formData,
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Tạo sản phẩm thất bại');
    return result;
  },

  // JSON-only update (no file upload)
  update: async (id: number, data: ProductRequest): Promise<ApiResponse<number>> =>
    fetchWithAuth<number>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Multipart update (with file upload — multi images)
  updateWithImages: async (id: number, data: ProductRequest, imageFiles?: File[]): Promise<ApiResponse<number>> => {
    const formData = new FormData();
    formData.append('request', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach(file => {
        formData.append('images', file);
      });
    }
    const accessToken = tokenStorage.getAccessToken();
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: formData,
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Cập nhật sản phẩm thất bại');
    return result;
  },

  delete: async (id: number): Promise<ApiResponse<string>> =>
    fetchWithAuth<string>(`/products/${id}`, { method: 'DELETE' }),
};

// ===== Bundle (Admin) =====
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

export interface BundleProductResponse {
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
  products: BundleProductResponse[];
}

export const adminBundleApi = {
  getAll: async (params?: PaginationParams): Promise<ApiResponse<PageResponse<BundleResponse>>> =>
    fetchWithAuth<PageResponse<BundleResponse>>(`/bundles${buildQuery(params)}`),

  getById: async (id: number): Promise<ApiResponse<BundleResponse>> =>
    fetchWithAuth<BundleResponse>(`/bundles/${id}`),

  create: async (data: BundleRequest): Promise<ApiResponse<number>> =>
    fetchWithAuth<number>('/bundles', { method: 'POST', body: JSON.stringify(data) }),

  createWithImage: async (data: BundleRequest, imageFile?: File): Promise<ApiResponse<number>> => {
    const formData = new FormData();
    formData.append('request', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (imageFile) formData.append('image', imageFile);
    const accessToken = tokenStorage.getAccessToken();
    const response = await fetch(`${API_BASE_URL}/bundles`, {
      method: 'POST',
      headers: { ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
      body: formData,
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Tạo combo thất bại');
    return result;
  },

  update: async (id: number, data: BundleRequest): Promise<ApiResponse<number>> =>
    fetchWithAuth<number>(`/bundles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  updateWithImage: async (id: number, data: BundleRequest, imageFile?: File): Promise<ApiResponse<number>> => {
    const formData = new FormData();
    formData.append('request', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (imageFile) formData.append('image', imageFile);
    const accessToken = tokenStorage.getAccessToken();
    const response = await fetch(`${API_BASE_URL}/bundles/${id}`, {
      method: 'PUT',
      headers: { ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
      body: formData,
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Cập nhật combo thất bại');
    return result;
  },

  delete: async (id: number): Promise<ApiResponse<string>> =>
    fetchWithAuth<string>(`/bundles/${id}`, { method: 'DELETE' }),
};

// ===== Order (Admin) =====
export type OrderStatus = 'CREATED' | 'WAITING_PAYMENT' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';

export interface OrderItem {
  id: number;
  itemType: 'PRODUCT' | 'BUNDLE';
  itemName: string;
  priceSnapshot: number;
  quantity: number;
  subtotal: number;
}

export interface OrderResponse {
  id: number;
  status: OrderStatus;
  totalAmount: number;
  customerName?: string;
  customerEmail?: string;
  receiverName?: string;
  receiverPhone?: string;
  shippingAddress?: string;
  discountCode?: string;
  discountAmount?: number;
  userId?: number;
  vatCompanyName?: string;
  vatTaxCode?: string;
  vatPhone?: string;
  vatAddress?: string;
  items: OrderItem[];
  createdAt: string;
}

export const adminOrderApi = {
  getAll: async (params?: PaginationParams): Promise<ApiResponse<PageResponse<OrderResponse>>> =>
    fetchWithAuth<PageResponse<OrderResponse>>(`/orders/all${buildQuery(params)}`),

  getById: async (id: number): Promise<ApiResponse<OrderResponse>> =>
    fetchWithAuth<OrderResponse>(`/orders/${id}`),

  updateStatus: async (id: number, status: OrderStatus): Promise<ApiResponse<OrderResponse>> =>
    fetchWithAuth<OrderResponse>(`/orders/${id}/status?status=${status}`, { method: 'PUT' }),

  cancel: async (id: number): Promise<ApiResponse<OrderResponse>> =>
    fetchWithAuth<OrderResponse>(`/orders/${id}/cancel`, { method: 'PUT' }),
};

// ===== Discount (Admin) =====
export interface DiscountRequest {
  code: string;
  discountValue: number;
  minOrderAmount?: number;
  usageLimit?: number;
  startDate: string;
  endDate: string;
}

export interface DiscountResponse {
  id: number;
  code: string;
  discountValue: number;
  minOrderAmount?: number;
  usageLimit?: number;
  usageCount?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export const adminDiscountApi = {
  getAll: async (): Promise<ApiResponse<DiscountResponse[]>> =>
    fetchWithAuth<DiscountResponse[]>('/discounts'),

  getById: async (id: number): Promise<ApiResponse<DiscountResponse>> =>
    fetchWithAuth<DiscountResponse>(`/discounts/${id}`),

  create: async (data: DiscountRequest): Promise<ApiResponse<DiscountResponse>> =>
    fetchWithAuth<DiscountResponse>('/discounts', { method: 'POST', body: JSON.stringify(data) }),

  update: async (id: number, data: DiscountRequest): Promise<ApiResponse<DiscountResponse>> =>
    fetchWithAuth<DiscountResponse>(`/discounts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: async (id: number): Promise<ApiResponse<string>> =>
    fetchWithAuth<string>(`/discounts/${id}`, { method: 'DELETE' }),
};

// ===== Blog Topics (Admin) =====
export interface BlogTopicRequest {
  name: string;
}

export interface BlogTopicResponse {
  id: number;
  name: string;
}

export const adminBlogTopicApi = {
  getAll: async (): Promise<ApiResponse<BlogTopicResponse[]>> =>
    fetchWithAuth<BlogTopicResponse[]>('/blog-topics'),

  create: async (data: BlogTopicRequest): Promise<ApiResponse<BlogTopicResponse>> =>
    fetchWithAuth<BlogTopicResponse>('/blog-topics', { method: 'POST', body: JSON.stringify(data) }),

  update: async (id: number, data: BlogTopicRequest): Promise<ApiResponse<BlogTopicResponse>> =>
    fetchWithAuth<BlogTopicResponse>(`/blog-topics/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: async (id: number): Promise<ApiResponse<string>> =>
    fetchWithAuth<string>(`/blog-topics/${id}`, { method: 'DELETE' }),
};

// ===== Blog Posts (Admin) =====
export interface BlogPostRequest {
  title: string;
  content: string;
  topicId: number;
}

export interface BlogPostResponse {
  id: number;
  title: string;
  content: string;
  image?: string;
  topicName: string;
  topicId: number;
  authorName?: string;
  createdAt: string;
}

export const adminBlogApi = {
  getAll: async (params?: PaginationParams): Promise<ApiResponse<PageResponse<BlogPostResponse>>> =>
    fetchWithAuth<PageResponse<BlogPostResponse>>(`/blogs${buildQuery(params)}`),

  getById: async (id: number): Promise<ApiResponse<BlogPostResponse>> =>
    fetchWithAuth<BlogPostResponse>(`/blogs/${id}`),

  create: async (data: BlogPostRequest): Promise<ApiResponse<BlogPostResponse>> =>
    fetchWithAuth<BlogPostResponse>('/blogs', { method: 'POST', body: JSON.stringify(data) }),

  createWithImage: async (data: BlogPostRequest, imageFile?: File): Promise<ApiResponse<BlogPostResponse>> => {
    const formData = new FormData();
    formData.append('request', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (imageFile) formData.append('image', imageFile);
    const accessToken = tokenStorage.getAccessToken();
    const response = await fetch(`${API_BASE_URL}/blogs`, {
      method: 'POST',
      headers: { ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
      body: formData,
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Tạo bài viết thất bại');
    return result;
  },

  update: async (id: number, data: BlogPostRequest): Promise<ApiResponse<BlogPostResponse>> =>
    fetchWithAuth<BlogPostResponse>(`/blogs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  updateWithImage: async (id: number, data: BlogPostRequest, imageFile?: File): Promise<ApiResponse<BlogPostResponse>> => {
    const formData = new FormData();
    formData.append('request', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (imageFile) formData.append('image', imageFile);
    const accessToken = tokenStorage.getAccessToken();
    const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
      method: 'PUT',
      headers: { ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
      body: formData,
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Cập nhật bài viết thất bại');
    return result;
  },

  delete: async (id: number): Promise<ApiResponse<string>> =>
    fetchWithAuth<string>(`/blogs/${id}`, { method: 'DELETE' }),
};

// ===== Payment (Admin — read-only) =====
export type PaymentMethod = 'COD' | 'VN_PAY';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'EXPIRED';

export interface PaymentResponse {
  id: number;
  orderId: number;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  transactionId: string | null;
  paidAt: string | null;
  paymentUrl: string | null;
}

export const adminPaymentApi = {
  getByOrderId: async (orderId: number): Promise<ApiResponse<PaymentResponse>> =>
    fetchWithAuth<PaymentResponse>(`/payments/${orderId}`),
};
