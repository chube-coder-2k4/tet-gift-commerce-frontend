import { fetchWithAuth, ApiResponse } from './api';

// Types
export type PaymentMethod = 'COD' | 'VN_PAY';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'EXPIRED';

export interface CreatePaymentRequest {
  orderId: number;
  method: PaymentMethod;
}

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

// Payment API (auth required)
export const paymentApi = {
  // POST /payments/create — Tạo thanh toán cho đơn hàng
  create: async (request: CreatePaymentRequest): Promise<ApiResponse<PaymentResponse>> => {
    return fetchWithAuth<PaymentResponse>('/payments/create', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  // GET /payments/{orderId} — Lấy thông tin thanh toán theo order ID
  getByOrderId: async (orderId: number): Promise<ApiResponse<PaymentResponse>> => {
    return fetchWithAuth<PaymentResponse>(`/payments/${orderId}`);
  },
};
