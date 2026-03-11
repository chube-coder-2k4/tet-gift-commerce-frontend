// Address API Service
import { fetchWithAuth, ApiResponse } from './api';

// Types
export interface AddressResponse {
  id: number;
  receiverName: string;
  phone: string;
  addressDetail: string;
  isDefault: boolean;
}

export interface AddressRequest {
  receiverName: string;
  phone: string;
  addressDetail: string;
  isDefault?: boolean;
}

// Address API
export const addressApi = {
  // Lấy danh sách địa chỉ của user hiện tại
  getAll: async (): Promise<ApiResponse<AddressResponse[]>> => {
    return fetchWithAuth<AddressResponse[]>('/addresses', {
      method: 'GET',
    });
  },

  // Lấy chi tiết 1 địa chỉ
  getById: async (id: number): Promise<ApiResponse<AddressResponse>> => {
    return fetchWithAuth<AddressResponse>(`/addresses/${id}`, {
      method: 'GET',
    });
  },

  // Tạo địa chỉ mới
  create: async (request: AddressRequest): Promise<ApiResponse<AddressResponse>> => {
    return fetchWithAuth<AddressResponse>('/addresses', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  // Cập nhật địa chỉ
  update: async (id: number, request: AddressRequest): Promise<ApiResponse<AddressResponse>> => {
    return fetchWithAuth<AddressResponse>(`/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  },

  // Xóa địa chỉ
  delete: async (id: number): Promise<ApiResponse<void>> => {
    return fetchWithAuth<void>(`/addresses/${id}`, {
      method: 'DELETE',
    });
  },

  // Đặt làm địa chỉ mặc định
  setDefault: async (id: number): Promise<ApiResponse<AddressResponse>> => {
    return fetchWithAuth<AddressResponse>(`/addresses/${id}/default`, {
      method: 'PUT',
    });
  },
};
