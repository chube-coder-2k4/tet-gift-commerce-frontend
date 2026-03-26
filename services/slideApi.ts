import { fetchWithAuth, ApiResponse } from './api';

export interface HomeSlideResponse {
  id: number;
  image: string;
  title?: string;
  subtitle?: string;
  cta?: string;
  link?: string;
  slideOrder: number;
  isActive: boolean;
}

export interface HomeSlideRequest {
  image: string;
  title?: string;
  subtitle?: string;
  cta?: string;
  link?: string;
  slideOrder?: number;
  isActive?: boolean;
}

export const slideApi = {
  // Public: Lấy danh sách slide đang hoạt động
  getActiveSlides: async (): Promise<ApiResponse<HomeSlideResponse[]>> => {
    const res = await fetch(`${import.meta.env.VITE_API_URL || '/api/v1'}/slides`, {
      method: 'GET',
    });
    if (!res.ok) throw new Error('Failed to fetch active slides');
    return res.json();
  },

  // Admin: Lấy tất cả slide
  getAllSlidesAdmin: async (): Promise<ApiResponse<HomeSlideResponse[]>> => {
    return fetchWithAuth<HomeSlideResponse[]>('/slides/admin', {
      method: 'GET',
    });
  },

  // Admin: Tạo slide mới
  createSlide: async (request: HomeSlideRequest): Promise<ApiResponse<HomeSlideResponse>> => {
    return fetchWithAuth<HomeSlideResponse>('/slides', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  // Admin: Cập nhật slide
  updateSlide: async (id: number, request: HomeSlideRequest): Promise<ApiResponse<HomeSlideResponse>> => {
    return fetchWithAuth<HomeSlideResponse>(`/slides/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  },

  // Admin: Xóa slide
  deleteSlide: async (id: number): Promise<ApiResponse<void>> => {
    return fetchWithAuth<void>(`/slides/${id}`, {
      method: 'DELETE',
    });
  },
};
