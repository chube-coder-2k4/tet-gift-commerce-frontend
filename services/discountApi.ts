import { fetchWithAuth, ApiResponse } from './api';

// Types
export interface DiscountResponse {
  id: number;
  code: string;
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

// Discount API (auth required)
export const discountApi = {
  // POST /discounts/validate?code=TET2026 — Kiểm tra mã giảm giá
  validate: async (code: string): Promise<ApiResponse<DiscountResponse>> => {
    return fetchWithAuth<DiscountResponse>(`/discounts/validate?code=${encodeURIComponent(code)}`, {
      method: 'POST',
    });
  },
};
