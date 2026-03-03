// Admin API Services
import { 
  AdminUser, 
  AdminProduct, 
  AdminCategory, 
  AdminOrder, 
  AdminPayment, 
  AdminRole,
  PageResponse,
  DashboardStats
} from '../types';
import { tokenStorage, ApiError } from './api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

// Types
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

// Base fetch wrapper with auth headers
async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const accessToken = tokenStorage.getAccessToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(data.message || 'An error occurred', response.status);
  }

  return data;
}

// ==================== USER API ====================
export const adminUserApi = {
  getAll: async (page: number = 0, size: number = 10, sortBy: string = 'id', sortDir: string = 'desc'): Promise<ApiResponse<PageResponse<AdminUser>>> => {
    // Backend has sortBy/sortDir swapped in implementation, so we swap them here
    // Also backend expects 1-based page numbers
    const response = await fetchWithAuth<any>(`/user?page=${page + 1}&size=${size}&sortBy=${sortDir}&sortDir=${sortBy}`);
    // Map backend response format to our PageResponse format
    return {
      ...response,
      data: {
        content: response.data?.data || [],
        totalElements: response.data?.totalItems || 0,
        totalPages: response.data?.totalPages || 0,
        size: response.data?.pageSize || size,
        number: (response.data?.pageNo || 1) - 1,
      }
    };
  },

  getById: async (id: number): Promise<ApiResponse<AdminUser>> => {
    return fetchWithAuth<AdminUser>(`/user/${id}`);
  },

  create: async (data: Partial<AdminUser> & { password: string }): Promise<ApiResponse<number>> => {
    return fetchWithAuth<number>('/user/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<AdminUser>): Promise<ApiResponse<number>> => {
    return fetchWithAuth<number>(`/user/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<ApiResponse<string>> => {
    return fetchWithAuth<string>(`/user/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== ROLE API ====================
export const adminRoleApi = {
  getAll: async (): Promise<ApiResponse<AdminRole[]>> => {
    return fetchWithAuth<AdminRole[]>('/role');
  },

  getById: async (id: number): Promise<ApiResponse<AdminRole>> => {
    return fetchWithAuth<AdminRole>(`/role/${id}`);
  },

  create: async (data: Partial<AdminRole>): Promise<ApiResponse<AdminRole>> => {
    return fetchWithAuth<AdminRole>('/role', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<AdminRole>): Promise<ApiResponse<AdminRole>> => {
    return fetchWithAuth<AdminRole>(`/role?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    return fetchWithAuth<void>(`/role?id=${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== PRODUCT API ====================
export const adminProductApi = {
  getAll: async (page: number = 0, size: number = 10, sortBy: string = 'createdAt', sortDir: string = 'desc'): Promise<ApiResponse<PageResponse<AdminProduct>>> => {
    const response = await fetchWithAuth<any>(`/products?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
    // Map backend response format to our PageResponse format
    return {
      ...response,
      data: {
        content: response.data?.data || [],
        totalElements: response.data?.totalItems || 0,
        totalPages: response.data?.totalPages || 0,
        size: response.data?.pageSize || size,
        number: response.data?.pageNo || 0,
      }
    };
  },

  getById: async (id: number): Promise<ApiResponse<AdminProduct>> => {
    return fetchWithAuth<AdminProduct>(`/products/${id}`);
  },

  create: async (data: {
    name: string;
    description?: string;
    price: number;
    originalPrice?: number;
    inventory?: { stockQuantity: number; isInStock: boolean };
    images?: { imageUrl: string; isThumbnail: boolean; sortOrder: number }[];
    badgeIds?: number[];
    categoryIds?: number[];
  }): Promise<ApiResponse<number>> => {
    return fetchWithAuth<number>('/products/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: {
    name: string;
    description?: string;
    price: number;
    originalPrice?: number;
    inventory?: { stockQuantity: number; isInStock: boolean };
    images?: { imageUrl: string; isThumbnail: boolean; sortOrder: number }[];
    badgeIds?: number[];
    categoryIds?: number[];
  }): Promise<ApiResponse<number>> => {
    return fetchWithAuth<number>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<ApiResponse<string>> => {
    return fetchWithAuth<string>(`/products/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== CATEGORY API ====================
export const adminCategoryApi = {
  getAll: async (): Promise<ApiResponse<AdminCategory[]>> => {
    return fetchWithAuth<AdminCategory[]>('/cate');
  },

  getById: async (id: number): Promise<ApiResponse<AdminCategory>> => {
    return fetchWithAuth<AdminCategory>(`/cate/${id}`);
  },

  create: async (data: Partial<AdminCategory>): Promise<ApiResponse<AdminCategory>> => {
    return fetchWithAuth<AdminCategory>('/cate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<AdminCategory>): Promise<ApiResponse<AdminCategory>> => {
    return fetchWithAuth<AdminCategory>(`/cate?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    return fetchWithAuth<void>(`/cate?id=${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== ORDER API (MOCK) ====================
// Mock data for orders since API not available
const mockOrders: AdminOrder[] = [
  {
    id: 1,
    orderNumber: 'ORD-2026-001',
    customer: { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@email.com', phone: '0901234567' },
    items: [
      { id: 1, productId: 1, productName: 'Hộp Quà Phú Quý', productImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgHcnHgGvA8mCEWpq-ap5oelP7Kn0BHJ7lOhEaaSURbcRn5xMNj4vaytN2pS6KbaDveIbBVuNYD6xWFOCoQUNd9hZ35AGkiYhAl2fjwkaa25d2wLYxNUWU-Z-cZ8VvVdvqOhnxyEKjEZaV7j5Om0hJj-3pH5EuzaDP5aKbzI9By3Pjsbh3vI0yT8R_FLMEcp8THrUNM6tXZa4-B8DyPUf2s3ZrQNhBddfXrZ9Ucnw4KmQbhX2Vx1dvhOQq9Tf70yC3aPJqPI9T9bU', quantity: 2, price: 1250000, subtotal: 2500000 },
    ],
    totalAmount: 2500000,
    status: 'PENDING',
    paymentStatus: 'PENDING',
    paymentMethod: 'VNPAY',
    shippingAddress: '123 Nguyễn Huệ, Q1, TP.HCM',
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 2,
    orderNumber: 'ORD-2026-002',
    customer: { id: 2, name: 'Trần Thị B', email: 'tranthib@email.com', phone: '0912345678' },
    items: [
      { id: 2, productId: 2, productName: 'Giỏ Quà Tài Lộc', productImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqQAJ-wYiQSJyhVsfmKxGPDjHO5R0TU90kPgjZM0cnOIBJthk605iSwF8WjPJ_KyqSHlGzQPqSSD4H_8kVDjQn1QDdGsXIZbHw2ECx3Ws_uFsIz0ja3J_C7ZnPcQrylsVIdVkY01f9eIq3uDiSoeC4VD7HWKHp3P1u4XEuJS_5REpncuAcVrpm5nsnO5j2PpZ0_J7Cat9GfjasI6IenITjJiRsMrgDDlEbvG_s19Cc7576vSpfBU3KKLpAwLcKbtJw3ao2Gwf8NmI', quantity: 1, price: 850000, subtotal: 850000 },
      { id: 3, productId: 3, productName: 'Rượu Vang Premium', productImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRLA-CNP5rr4aesuvK68qWvEOxSVP5aaRGVLh036XeVn8bdqNNHDV--GqIf18K7Kag9kKQ6L9ZSiXAY6Zn2-ss8N33hlnzDu_DXbK3PNKTj8VIDvbAGL8ZptxbgJxls-dQyQqbDvrIu2Hv4ZhIxqOAVzmKwuUilkPkQFIR0UqUPfH4fBhpDGj_8aVuAyXkmOWH14xkqU9EYP3VH6ezIGNOh12WDttR4I-xReFA4p8_lov8qo_yJsjGFCHYjWULoY06IzlrjrOP-54', quantity: 1, price: 2100000, subtotal: 2100000 },
    ],
    totalAmount: 2950000,
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    paymentMethod: 'VNPAY',
    shippingAddress: '456 Lê Lợi, Q3, TP.HCM',
    createdAt: '2026-03-02T14:30:00Z',
    updatedAt: '2026-03-02T15:00:00Z',
  },
  {
    id: 3,
    orderNumber: 'ORD-2026-003',
    customer: { id: 3, name: 'Lê Văn C', email: 'levanc@email.com', phone: '0923456789' },
    items: [
      { id: 4, productId: 4, productName: 'Set Hạt Dinh Dưỡng', productImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-m8NKucgzcxvH9rmSZyoN-JmE6l2KRyTblP2TvKYJIr4AARqQ-b6M_GdcZuradtDA-yT4DgNL1NtrJArGgfmyavV9psWpJHEfXB6jXaJJgXfI9fCgEvKMiXn-yrV-e0C5XbfMrR-jR1hGHB1TpZOKapM8cNKFo-g_Z5IGp08d47avkgudHQ7fNFu4sZXnZWFONEYANppmFGsXysGAWq-QXnqxmXutNQqtYaH8IC2PXYWvPzwRHawkgtt06DMVHAmWqOOO-paek-I', quantity: 3, price: 550000, subtotal: 1650000 },
    ],
    totalAmount: 1650000,
    status: 'SHIPPED',
    paymentStatus: 'PAID',
    paymentMethod: 'COD',
    shippingAddress: '789 Hai Bà Trưng, Q1, TP.HCM',
    createdAt: '2026-02-28T09:00:00Z',
    updatedAt: '2026-03-01T11:00:00Z',
  },
  {
    id: 4,
    orderNumber: 'ORD-2026-004',
    customer: { id: 4, name: 'Phạm Thị D', email: 'phamthid@email.com', phone: '0934567890' },
    items: [
      { id: 5, productId: 5, productName: 'Set Trà An Khang', productImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6plfdsvdSGMBRfOiUqU7x3qo_AXr2WOwcXxa70ww5zRXdSsXcxQ41zGhGsmWPBTaoeEViXjvYVD56nVFbu2SiXkh5c9nPVJEjtFwscen7wH8TCDPrC4xxwEM2txu1V49yCi_15BkZ5ROI3O2e_Q9JSLVxy7nI0G-hUjHfkvS2h4CAHxDRXoprE_Ggy_me0B7rLPRcfef4FxIWLn8hn7bqnurOkzWyyouY3dxBZ-n7-PPxqQo45I4PR-DCjhL0D36LfJkmAu0RoMc', quantity: 1, price: 450000, subtotal: 450000 },
    ],
    totalAmount: 450000,
    status: 'DELIVERED',
    paymentStatus: 'PAID',
    paymentMethod: 'BANK_TRANSFER',
    shippingAddress: '321 Võ Văn Tần, Q3, TP.HCM',
    createdAt: '2026-02-25T16:00:00Z',
    updatedAt: '2026-02-27T10:00:00Z',
  },
  {
    id: 5,
    orderNumber: 'ORD-2026-005',
    customer: { id: 5, name: 'Hoàng Văn E', email: 'hoangvane@email.com', phone: '0945678901' },
    items: [
      { id: 6, productId: 6, productName: 'Giỏ Trái Cây Nhập Khẩu', productImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmzlhDzep4CDU4qjmW9bYVURGUaSLxk78Viia7wpPVecpAdNYJx_S2bQmgSCDYMMZIFCIuO9MXyEQWpmttwfvMrRE8ZhA0jPe8aKS3WkwNgsIkdNSTYFcJ7xWSTeBf3ogEUqua8_Ehv_RGQkxm2tVS1y32hBhVHY-piBh-t6V_e2EI_IAqbf2CvlFhOEpCwi-pggTesji1kx7VpQXlmlWXS6y6aHH1AlHl15KYyfSQI55Q23XBMUWgKvrzuXHfQxhp3jADDH8tqL4', quantity: 2, price: 1500000, subtotal: 3000000 },
    ],
    totalAmount: 3000000,
    status: 'CANCELLED',
    paymentStatus: 'REFUNDED',
    paymentMethod: 'VNPAY',
    shippingAddress: '555 Điện Biên Phủ, Bình Thạnh, TP.HCM',
    note: 'Khách hủy do thay đổi kế hoạch',
    createdAt: '2026-02-20T12:00:00Z',
    updatedAt: '2026-02-21T08:00:00Z',
  },
];

export const adminOrderApi = {
  getAll: async (page: number = 0, size: number = 10): Promise<ApiResponse<PageResponse<AdminOrder>>> => {
    // Mock implementation
    const start = page * size;
    const end = start + size;
    const paginatedOrders = mockOrders.slice(start, end);
    
    return Promise.resolve({
      status: 200,
      message: 'Orders fetched successfully',
      data: {
        content: paginatedOrders,
        totalElements: mockOrders.length,
        totalPages: Math.ceil(mockOrders.length / size),
        size: size,
        number: page,
      },
    });
  },

  getById: async (id: number): Promise<ApiResponse<AdminOrder>> => {
    const order = mockOrders.find(o => o.id === id);
    if (!order) {
      throw new ApiError('Order not found', 404);
    }
    return Promise.resolve({
      status: 200,
      message: 'Order fetched successfully',
      data: order,
    });
  },

  updateStatus: async (id: number, status: AdminOrder['status']): Promise<ApiResponse<AdminOrder>> => {
    const orderIndex = mockOrders.findIndex(o => o.id === id);
    if (orderIndex === -1) {
      throw new ApiError('Order not found', 404);
    }
    mockOrders[orderIndex].status = status;
    mockOrders[orderIndex].updatedAt = new Date().toISOString();
    
    return Promise.resolve({
      status: 200,
      message: 'Order status updated successfully',
      data: mockOrders[orderIndex],
    });
  },
};

// ==================== PAYMENT API (MOCK) ====================
const mockPayments: AdminPayment[] = [
  {
    id: 1,
    orderId: 2,
    orderNumber: 'ORD-2026-002',
    amount: 2950000,
    method: 'VNPAY',
    status: 'COMPLETED',
    transactionId: 'VNP14009823456',
    paidAt: '2026-03-02T14:35:00Z',
    createdAt: '2026-03-02T14:30:00Z',
  },
  {
    id: 2,
    orderId: 3,
    orderNumber: 'ORD-2026-003',
    amount: 1650000,
    method: 'COD',
    status: 'COMPLETED',
    paidAt: '2026-03-01T11:00:00Z',
    createdAt: '2026-02-28T09:00:00Z',
  },
  {
    id: 3,
    orderId: 4,
    orderNumber: 'ORD-2026-004',
    amount: 450000,
    method: 'BANK_TRANSFER',
    status: 'COMPLETED',
    transactionId: 'MB20260225161234',
    paidAt: '2026-02-25T16:15:00Z',
    createdAt: '2026-02-25T16:00:00Z',
  },
  {
    id: 4,
    orderId: 5,
    orderNumber: 'ORD-2026-005',
    amount: 3000000,
    method: 'VNPAY',
    status: 'REFUNDED',
    transactionId: 'VNP14009812345',
    paidAt: '2026-02-20T12:05:00Z',
    createdAt: '2026-02-20T12:00:00Z',
  },
  {
    id: 5,
    orderId: 1,
    orderNumber: 'ORD-2026-001',
    amount: 2500000,
    method: 'VNPAY',
    status: 'PENDING',
    createdAt: '2026-03-01T10:00:00Z',
  },
];

export const adminPaymentApi = {
  getAll: async (page: number = 0, size: number = 10): Promise<ApiResponse<PageResponse<AdminPayment>>> => {
    const start = page * size;
    const end = start + size;
    const paginatedPayments = mockPayments.slice(start, end);
    
    return Promise.resolve({
      status: 200,
      message: 'Payments fetched successfully',
      data: {
        content: paginatedPayments,
        totalElements: mockPayments.length,
        totalPages: Math.ceil(mockPayments.length / size),
        size: size,
        number: page,
      },
    });
  },

  getById: async (id: number): Promise<ApiResponse<AdminPayment>> => {
    const payment = mockPayments.find(p => p.id === id);
    if (!payment) {
      throw new ApiError('Payment not found', 404);
    }
    return Promise.resolve({
      status: 200,
      message: 'Payment fetched successfully',
      data: payment,
    });
  },
};

// ==================== DASHBOARD API (MOCK + Real) ====================
export const adminDashboardApi = {
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    // Try to get real counts from APIs, fall back to mock
    let totalUsers = 0;
    let totalProducts = 0;
    
    try {
      const usersResponse = await adminUserApi.getAll(0, 1);
      totalUsers = usersResponse.data.totalElements;
    } catch {
      totalUsers = 156; // Mock fallback
    }
    
    try {
      const productsResponse = await adminProductApi.getAll(0, 1);
      totalProducts = productsResponse.data.totalElements;
    } catch {
      totalProducts = 48; // Mock fallback
    }
    
    return Promise.resolve({
      status: 200,
      message: 'Dashboard stats fetched successfully',
      data: {
        totalUsers,
        totalProducts,
        totalOrders: mockOrders.length,
        totalRevenue: mockOrders
          .filter(o => o.paymentStatus === 'PAID')
          .reduce((sum, o) => sum + o.totalAmount, 0),
        recentOrders: mockOrders.slice(0, 5),
        topProducts: [
          { product: { id: 1, name: 'Hộp Quà Phú Quý', price: 1250000 } as AdminProduct, soldCount: 45 },
          { product: { id: 2, name: 'Giỏ Quà Tài Lộc', price: 850000 } as AdminProduct, soldCount: 38 },
          { product: { id: 3, name: 'Rượu Vang Premium', price: 2100000 } as AdminProduct, soldCount: 28 },
          { product: { id: 4, name: 'Set Hạt Dinh Dưỡng', price: 550000 } as AdminProduct, soldCount: 25 },
        ],
        ordersByStatus: [
          { status: 'PENDING', count: 12 },
          { status: 'CONFIRMED', count: 8 },
          { status: 'PROCESSING', count: 5 },
          { status: 'SHIPPED', count: 15 },
          { status: 'DELIVERED', count: 89 },
          { status: 'CANCELLED', count: 6 },
        ],
        revenueByMonth: [
          { month: 'T10/2025', revenue: 45000000 },
          { month: 'T11/2025', revenue: 52000000 },
          { month: 'T12/2025', revenue: 78000000 },
          { month: 'T1/2026', revenue: 125000000 },
          { month: 'T2/2026', revenue: 98000000 },
          { month: 'T3/2026', revenue: 35000000 },
        ],
      },
    });
  },
};

export default {
  users: adminUserApi,
  roles: adminRoleApi,
  products: adminProductApi,
  categories: adminCategoryApi,
  orders: adminOrderApi,
  payments: adminPaymentApi,
  dashboard: adminDashboardApi,
};
