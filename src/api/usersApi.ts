// src/api/usersApi.ts
import { api } from './index';
import type { User } from '../types';

export interface UsersResponse {
  ok: boolean;
  users?: User[];
  error?: string;
}

export interface UserResponse {
  ok: boolean;
  user?: User;
  error?: string;
}

export interface UserSearchParams {
  search?: string;
  limit?: number;
  exclude?: string[]; // Exclude current user or already added users
}

export const usersApi = {
  // Get all users - matches /api/v1/users/list from backend
  async getAllUsers(params?: UserSearchParams): Promise<User[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.search) {
      queryParams.append('search', params.search);
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params?.exclude && params.exclude.length > 0) {
      queryParams.append('exclude', params.exclude.join(','));
    }

    const url = `/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get<UsersResponse>(url);
      return response.data?.users || [];
  },

  // Get user by ID - Note: Backend only provides profile endpoint for current user
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getUserById(_userId: string): Promise<User | null> {
    try {
      // Backend limitation: can only get current user's profile
      const response = await api.get<UserResponse>(`/users/profile`);
        return response.data?.user || null;
      } catch (error) {
        console.error('Error fetching user by ID:', error);
        return null;
    }
  },

  // Search users by name or email
  async searchUsers(query: string, limit = 10, exclude: string[] = []): Promise<User[]> {
    return this.getAllUsers({ 
      search: query, 
      limit, 
      exclude 
    });
  },

  // Get current user profile - matches /api/v1/users/profile from backend
  async getCurrentUser(): Promise<User | null> {
    try {
    const response = await api.get<UserResponse>(`/users/profile`);
      // API response handled
      return response.data?.user || null;
    } catch (error) {
      console.error('Error fetching current user profile:', error);
      // API error
      return null;
    }
  },
};