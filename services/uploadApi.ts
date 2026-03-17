// Upload API Service
import { ApiResponse, tokenStorage } from './api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.quanghuycoder.id.vn/api/v1';

// Upload API (auth required)
export const uploadApi = {
  // POST /upload/image — Upload image to Cloudinary
  uploadImage: async (file: File): Promise<ApiResponse<string>> => {
    const formData = new FormData();
    formData.append('file', file);

    const accessToken = tokenStorage.getAccessToken();

    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      // NOTE: Do NOT set Content-Type header — browser sets it automatically with boundary for multipart
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }

    return data;
  },
};
