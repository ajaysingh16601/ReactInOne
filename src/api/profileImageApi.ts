// src/api/profileImageApi.ts
import { api } from './index';

export interface ProfileUpdateRequest {
  firstname?: string;
  lastname?: string;
  bio?: string;
  s3Key?: string;
  contentType?: string;
}

export interface ProfileUpdateResponse {
  success: boolean;
  message: string;
  user?: {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
    bio?: string;
    profileImageUrl?: string;
    profileImageS3Key?: string;
    username?: string;
    role?: string;
    createdAt?: string;
  };
}

export const profileImageApi = {
  /**
   * Direct upload to S3 via server (file sent to server, then to S3)
   * Server handles all S3 interactions - simpler and more secure
   */
  async uploadProfileImageDirect(file: File): Promise<ProfileUpdateResponse> {
    try {
      const formData = new FormData();
      formData.append('profileImage', file);

      // Create a custom request without encryption for file upload
      const response = await api.post<ProfileUpdateResponse>(
        '/profile/profile-image/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-encrypted': 'false',
          },
        }
      );
      console.log('response.data: =====', response.data);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
      console.error('Error uploading profile image:', error);
      throw new Error(errorMessage);
    }
  },

  /**
   * Delete profile image
   */
  async deleteProfileImage(): Promise<ProfileUpdateResponse> {
    try {
      const response = await api.delete<ProfileUpdateResponse>(
        '/profile/profile-image'
      );
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete image';
      console.error('Error deleting profile image:', error);
      throw new Error(errorMessage);
    }
  },

  /**
   * Get user profile with presigned image URL
   */
  async getUserProfile(userId: string): Promise<ProfileUpdateResponse> {
    try {
      const response = await api.get<ProfileUpdateResponse>(
        `/profile/profile/${userId}`
      );
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch user profile';
      console.error('Error fetching user profile:', error);
      throw new Error(errorMessage);
    }
  },

  /**
   * Update user profile with optional image
   */
  async updateProfile(data: ProfileUpdateRequest): Promise<ProfileUpdateResponse> {
    try {
      const response = await api.put<ProfileUpdateResponse>(
        '/profile/profile/update',
        data
      );
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update profile';
      console.error('Error updating profile:', error);
      throw new Error(errorMessage);
    }
  },
};
