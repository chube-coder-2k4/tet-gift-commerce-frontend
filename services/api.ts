// API Configuration & Base Service
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.shophuypro.store/api/v1';
const OAUTH_BASE_URL = import.meta.env.VITE_OAUTH_URL || 'https://api.shophuypro.store';

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
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  active: boolean;
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

  // Logout
  logout: () => {
    tokenStorage.clearTokens();
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
  // Register new user
  register: async (request: RegisterRequest): Promise<ApiResponse<UserResponse>> => {
    return fetchWithAuth<UserResponse>('/user/register', {
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
  updateProfile: async (userId: number, data: Partial<UserResponse>): Promise<ApiResponse<UserResponse>> => {
    return fetchWithAuth<UserResponse>(`/user/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

export default {
  auth: authApi,
  user: userApi,
};
