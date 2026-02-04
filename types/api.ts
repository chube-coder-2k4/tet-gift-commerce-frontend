import { User, Address } from '../types';

export interface ResponseData<T> {
    status: number;
    message: string;
    data: T;
}

export interface PageResponse<T> {
    content: T[];
    pageNo: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

export interface UserRequest {
    fullName: string;
    email: string;
    password?: string; // Optional because validation might handle it, but usually required for register
    phone?: string;
    username: string;
}

export interface UserUpdateRequest {
    name?: string;
    email?: string;
    phone?: string;
    addresses?: Address[];
}

// Inherit from User or redefine if backend response is different
// Assuming UserResponse is compatible with User for now
export type UserResponse = User;

export interface LoginRequest {
    usernameOrEmail: string;
    password?: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    tokenType?: string;
    user?: UserResponse; // Optional, depends on backend
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    newPassword?: string;
    confirmPassword?: string;
    password?: string; // Matching backend likely uses 'password' or 'newPassword'
}

export interface ChangePasswordRequest {
    currentPassword?: string;
    newPassword: string;
    confirmationPassword?: string;
}

export interface VerifyRequest {
    email: string;
    otp: string;
}

export interface ResendOtpRequest {
    email: string;
}
