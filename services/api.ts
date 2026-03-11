// API Configuration & Base Service
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
const OAUTH_BASE_URL = import.meta.env.VITE_OAUTH_URL || 'http://localhost:8080';

// Types
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
}

export interface RegisterRequest {
  fullName: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
}

export interface UserResponse {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  username?: string;
  roleName?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

// Token Management
const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_ID_KEY = 'userId';

export const tokenStorage = {
  getAccessToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  getRefreshToken: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),
  getUserId: (): number | null => {
    const id = localStorage.getItem(USER_ID_KEY);
    return id ? parseInt(id) : null;
  },
  setTokens: (accessToken: string, refreshToken: string, userId: number) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(USER_ID_KEY, userId.toString());
  },
  clearTokens: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem('user');
  },
};

// API Error class
export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// Base fetch wrapper with auth headers
export async function fetchWithAuth<T>(
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

// Auth API
export const authApi = {
  // Normal login with username/email and password
  login: async (request: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await fetchWithAuth<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    
    // Store tokens on successful login
    if (response.data) {
      tokenStorage.setTokens(
        response.data.accessToken,
        response.data.refreshToken,
        response.data.userId
      );
    }
    
    return response;
  },

  // Refresh access token
  refreshToken: async (): Promise<ApiResponse<LoginResponse>> => {
    const refreshToken = tokenStorage.getRefreshToken();
    
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-refresh-token': refreshToken || '',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      tokenStorage.clearTokens();
      throw new ApiError(data.message || 'Token refresh failed', response.status);
    }

    // Update tokens
    if (data.data) {
      tokenStorage.setTokens(
        data.data.accessToken,
        data.data.refreshToken,
        data.data.userId
      );
    }

    return data;
  },

  // Logout (gọi API để invalidate refresh token ở server)
  logout: async (): Promise<void> => {
    try {
      const refreshToken = tokenStorage.getRefreshToken();
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenStorage.getAccessToken() || ''}`,
          'x-refresh-token': refreshToken || '',
        },
      });
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      tokenStorage.clearTokens();
    }
  },

  // Forgot password - gửi email reset
  forgotPassword: async (email: string): Promise<ApiResponse<string>> => {
    return fetchWithAuth<string>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Reset password bằng token
  resetPassword: async (request: ResetPasswordRequest): Promise<ApiResponse<string>> => {
    return fetchWithAuth<string>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  // Change password (cần đăng nhập)
  changePassword: async (request: ChangePasswordRequest): Promise<ApiResponse<string>> => {
    return fetchWithAuth<string>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  // Verify OTP sau khi đăng ký
  verifyOtp: async (request: VerifyOtpRequest): Promise<ApiResponse<void>> => {
    return fetchWithAuth<void>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  // Resend OTP
  resendOtp: async (email: string): Promise<ApiResponse<void>> => {
    return fetchWithAuth<void>('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // OAuth2 URLs
  getGoogleLoginUrl: (): string => {
    return `${OAUTH_BASE_URL}/oauth2/authorization/google`;
  },

  getGithubLoginUrl: (): string => {
    return `${OAUTH_BASE_URL}/oauth2/authorization/github`;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!tokenStorage.getAccessToken();
  },
};

// User API
export const userApi = {
  // Register new user (returns user ID)
  register: async (request: RegisterRequest): Promise<ApiResponse<number>> => {
    return fetchWithAuth<number>('/user/register', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  // Get current user profile
  getProfile: async (userId: number): Promise<ApiResponse<UserResponse>> => {
    return fetchWithAuth<UserResponse>(`/user/${userId}`, {
      method: 'GET',
    });
  },

  // Update user profile
  updateProfile: async (userId: number, data: { fullName?: string; phone?: string }): Promise<ApiResponse<number>> => {
    return fetchWithAuth<number>(`/user/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

export default {
  auth: authApi,
  user: userApi,
};
