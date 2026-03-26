// Cart API Service
import { fetchWithAuth, ApiResponse } from './api';

// Types
export interface CartItem {
  id: number;
  itemType: 'PRODUCT' | 'BUNDLE';
  itemId: number;
  itemName: string;
  itemImage?: string;
  imageUrl?: string;
  image?: string;
  primaryImage?: string;
  itemPrice: number;
  quantity: number;
  subtotal: number;
  isCustomCombo?: boolean;
  customComboData?: string;
}

export interface CartResponse {
  id: number;
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
}

export interface AddToCartRequest {
  itemType: 'PRODUCT' | 'BUNDLE';
  productId?: number;
  bundleId?: number;
  quantity: number;
  isCustomCombo?: boolean;
  customComboData?: string;
}

// Cart API (auth required)
export const cartApi = {
  // Lấy giỏ hàng
  getCart: async (): Promise<ApiResponse<CartResponse>> => {
    return fetchWithAuth<CartResponse>('/cart', {
      method: 'GET',
    });
  },

  // Thêm item vào giỏ
  addItem: async (request: AddToCartRequest): Promise<ApiResponse<CartResponse>> => {
    return fetchWithAuth<CartResponse>('/cart/items', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  // Cập nhật số lượng item
  updateQuantity: async (itemId: number, quantity: number): Promise<ApiResponse<CartResponse>> => {
    return fetchWithAuth<CartResponse>(`/cart/items/${itemId}?quantity=${quantity}`, {
      method: 'PUT',
    });
  },

  // Xóa item khỏi giỏ
  removeItem: async (itemId: number): Promise<ApiResponse<CartResponse>> => {
    return fetchWithAuth<CartResponse>(`/cart/items/${itemId}`, {
      method: 'DELETE',
    });
  },

  // Xóa toàn bộ giỏ hàng
  clearCart: async (): Promise<ApiResponse<void>> => {
    return fetchWithAuth<void>('/cart', {
      method: 'DELETE',
    });
  },
};
