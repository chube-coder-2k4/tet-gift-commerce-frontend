import api from '../lib/axios';
import { UserRequest, UserResponse, ResponseData, PageResponse, UserUpdateRequest } from '../types/api';

export const userService = {
    // Register a new user
    registerUser: async (user: UserRequest): Promise<number> => {
        const response = await api.post<ResponseData<number>>('/user/register', user);
        return response.data.data;
    },

    // Get all users (paginated)
    getUsers: async (page = 0, size = 10, sortBy = 'id', sortDir = 'asc'): Promise<PageResponse<UserResponse>> => {
        const response = await api.get<ResponseData<PageResponse<UserResponse>>>('/user', {
            params: { page, size, sortBy, sortDir }
        });
        return response.data.data;
    },

    // Update user
    updateUser: async (id: number, user: UserUpdateRequest): Promise<number> => {
        const response = await api.put<ResponseData<number>>(`/user/${id}`, user);
        return response.data.data;
    },

    // Delete user
    deleteUser: async (id: number): Promise<string> => {
        const response = await api.delete<ResponseData<string>>(`/user/${id}`);
        return response.data.data;
    },

    // Get user by ID
    getUserById: async (id: number): Promise<UserResponse> => {
        const response = await api.get<ResponseData<UserResponse>>(`/user/${id}`);
        return response.data.data;
    }
};
