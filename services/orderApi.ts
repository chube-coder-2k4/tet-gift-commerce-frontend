import { fetchWithAuth, ApiResponse } from './api';

// Types
export interface CreateOrderRequest {
  addressId: number;
  discountCode?: string;
  vatCompanyName?: string;
  vatTaxCode?: string;
  vatPhone?: string;
  vatAddress?: string;
}

export interface OrderItem {
  id: number;
  itemType: 'PRODUCT' | 'BUNDLE';
  itemName: string;
  priceSnapshot: number;
  quantity: number;
  subtotal: number;
  isCustomCombo?: boolean;
  customComboData?: string;
}

export interface OrderResponse {
  id: number;
  status: OrderStatus;
  totalAmount: number;
  subtotalBeforeDiscount?: number;
  tierDiscountPercent?: number;
  tierDiscountAmount?: number;
  customerName?: string;
  customerEmail?: string;
  receiverName?: string;
  receiverPhone?: string;
  shippingAddress?: string;
  discountCode?: string;
  discountAmount?: number;
  vatCompanyName?: string;
  vatTaxCode?: string;
  vatPhone?: string;
  vatAddress?: string;
  items: OrderItem[];
  createdAt: string;
}

export type OrderStatus =
  | 'CREATED'
  | 'WAITING_PAYMENT'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface PageResponse<T> {
  pageNo: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  data: T[];
}

// Order API (auth required)
export const orderApi = {
  // POST /orders — Tạo đơn hàng từ giỏ hàng
  create: async (request: CreateOrderRequest): Promise<ApiResponse<OrderResponse>> => {
    return fetchWithAuth<OrderResponse>('/orders', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  // GET /orders/my-orders?page=0&size=10 — Đơn hàng của tôi
  getMyOrders: async (page = 0, size = 10): Promise<ApiResponse<PageResponse<OrderResponse>>> => {
    return fetchWithAuth<PageResponse<OrderResponse>>(`/orders/my-orders?page=${page}&size=${size}`);
  },

  // GET /orders/{id} — Chi tiết đơn hàng
  getById: async (id: number): Promise<ApiResponse<OrderResponse>> => {
    return fetchWithAuth<OrderResponse>(`/orders/${id}`);
  },

  // PUT /orders/{id}/cancel — Hủy đơn hàng
  cancel: async (id: number): Promise<ApiResponse<OrderResponse>> => {
    return fetchWithAuth<OrderResponse>(`/orders/${id}/cancel`, {
      method: 'PUT',
    });
  },
};
