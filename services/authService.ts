import api from '../lib/axios';
import {
    ResponseData,
    LoginRequest,
    LoginResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ChangePasswordRequest,
    VerifyRequest,
    ResendOtpRequest
} from '../types/api';

export const authService = {
    // Login
    login: async (request: LoginRequest): Promise<LoginResponse> => {
        const response = await api.post<ResponseData<LoginResponse>>('/auth/login', request);
        return response.data.data;
    },

    // Refresh Token
    refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
        // Usually sent as header or body. Controller says: "HTTP request containing x-refresh-token header"
        // We will simulate passing it, interceptor might handle it or we pass explicit config
        const response = await api.post<ResponseData<LoginResponse>>('/auth/refresh-token', {}, {
            headers: {
                'x-refresh-token': refreshToken
            }
        });
        return response.data.data;
    },

    // Forgot Password
    forgotPassword: async (request: ForgotPasswordRequest): Promise<string> => {
        const response = await api.post<ResponseData<string>>('/auth/forgot-password', request);
        return response.data.data;
    },

    // Reset Password
    resetPassword: async (request: ResetPasswordRequest): Promise<string> => {
        const response = await api.post<ResponseData<string>>('/auth/reset-password', request);
        return response.data.data;
    },

    // Change Password
    changePassword: async (request: ChangePasswordRequest): Promise<string> => {
        const response = await api.post<ResponseData<string>>('/auth/change-password', request);
        return response.data.data;
    },

    // Verify OTP
    verifyOtp: async (request: VerifyRequest): Promise<string> => {
        const response = await api.post<ResponseData<string>>('/auth/verify-otp', request);
        // Since data is null in controller, we return the message from response
        return response.data.message;
    },

    // Resend OTP
    resendOtp: async (request: ResendOtpRequest): Promise<string> => {
        const response = await api.post<ResponseData<string>>('/auth/resend-otp', request);
        return response.data.message;
    }
};
