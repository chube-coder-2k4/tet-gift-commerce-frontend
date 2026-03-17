import { fetchWithAuth, ApiResponse } from './api';

// Types
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
  discountType: 'FIXED' | 'PERCENTAGE';
  maxDiscountAmount?: number;
  actualDiscountAmount?: number; // Số tiền giảm thực tế (ví dụ: 80000)
  displayValue?: string;        // Chuỗi hiển thị (ví dụ: "25%")
}

// Discount API (auth required)
export const discountApi = {
  // POST /discounts/validate?code=TET2026&orderAmount=2000000 — Kiểm tra mã giảm giá
  validate: async (code: string, orderAmount: number): Promise<ApiResponse<DiscountResponse>> => {
    return fetchWithAuth<DiscountResponse>(`/discounts/validate?code=${encodeURIComponent(code)}&orderAmount=${orderAmount}`, {
      method: 'POST',
    });
  },
};
