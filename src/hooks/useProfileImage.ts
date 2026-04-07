// src/hooks/useProfileImage.ts
import { useState, useCallback } from 'react';
import { profileImageApi } from '../api/profileImageApi';
import { useAppDispatch } from './index';
import { setUser } from '../feature/auth/authSlice';

export interface UseProfileImageReturn {
  uploading: boolean;
  error: string | null;
  success: boolean;
  uploadProgress: number;
  uploadImage: (file: File) => Promise<void>;
  deleteImage: () => Promise<void>;
  updateProfile: (data: {
    firstname?: string;
    lastname?: string;
    bio?: string;
  }) => Promise<void>;
}

export const useProfileImage = (): UseProfileImageReturn => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const dispatch = useAppDispatch();

  const resetState = useCallback(() => {
    setError(null);
    setSuccess(false);
    setUploadProgress(0);
  }, []);

  /**
   * Upload image directly to server
   * Server handles S3 upload - simpler and more secure
   */
  const uploadImage = useCallback(
    async (file: File) => {
      resetState();
      setUploading(true);

      try {
        // Validate file
        if (!file.type.startsWith('image/')) {
          throw new Error('Only image files are allowed');
        }

        if (file.size > 5 * 1024 * 1024) {
          throw new Error('File size must be less than 5MB');
        }

        setUploadProgress(20);

        const response = await profileImageApi.uploadProfileImageDirect(file);

        if (response.success && response.user) {
          dispatch(setUser(response.user));
          setSuccess(true);
          setUploadProgress(100);
        } else {
          throw new Error('Upload failed');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('Image upload failed:', err);
      } finally {
        setUploading(false);
      }
    },
    [dispatch, resetState]
  );

  /**
   * Delete profile image
   */
  const deleteImage = useCallback(async () => {
    resetState();
    setUploading(true);

    try {
      const response = await profileImageApi.deleteProfileImage();

      if (response.success && response.user) {
        dispatch(setUser(response.user));
        setSuccess(true);
      } else {
        throw new Error('Failed to delete image');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Delete image failed:', err);
    } finally {
      setUploading(false);
    }
  }, [dispatch, resetState]);

  /**
   * Update profile information
   */
  const updateProfile = useCallback(
    async (data: {
      firstname?: string;
      lastname?: string;
      bio?: string;
    }) => {
      resetState();
      setUploading(true);

      try {
        const response = await profileImageApi.updateProfile(data);

        if (response.success && response.user) {
          dispatch(setUser(response.user));
          setSuccess(true);
        } else {
          throw new Error('Failed to update profile');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('Profile update failed:', err);
      } finally {
        setUploading(false);
      }
    },
    [dispatch, resetState]
  );

  return {
    uploading,
    error,
    success,
    uploadProgress,
    uploadImage,
    deleteImage,
    updateProfile,
  };
};
