// src/components/ProfileImageUpload.tsx
import React, { useRef, useState, useEffect } from 'react';
import { useProfileImage } from '../hooks/useProfileImage';

interface ProfileImageUploadProps {
  currentImageUrl?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  currentImageUrl,
  onSuccess,
  onError,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [isDragging, setIsDragging] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    uploading,
    error,
    success,
    uploadProgress,
    uploadImage,
    deleteImage,
  } = useProfileImage();

  // Update preview when prop changes
  useEffect(() => {
    if (currentImageUrl) {
      setPreview(currentImageUrl);
    }
  }, [currentImageUrl]);

  // Update preview when upload succeeds
  useEffect(() => {
    if (success && currentImageUrl) {
      setPreview(currentImageUrl);
    }
  }, [success, currentImageUrl]);

  // Handle success
  useEffect(() => {
    if (success) {
      onSuccess?.();
      setTimeout(() => {
        setShowDeleteConfirm(false);
      }, 1500);
    }
  }, [success, onSuccess]);

  // Handle error
  useEffect(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);

  const handleFileSelect = async (file: File) => {
    // Validate file
    if (!file.type.startsWith('image/')) {
      onError?.('Only image files are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      onError?.('File size must be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    await uploadImage(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDeleteClick = async () => {
    await deleteImage();
    setPreview(null);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Image Preview & Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative group cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 ${
          isDragging
            ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20'
            : 'bg-gray-100 dark:bg-gray-800'
        }`}
      >
        {/* Current Image or Placeholder */}
        <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
          {preview ? (
            <>
              <img
                src={preview}
                alt="Profile"
                className="w-full h-full object-cover"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <div className="text-center">
                  <svg
                    className="w-8 h-8 text-white mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-white font-semibold">Change Photo</p>
                </div>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <svg
                  className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-gray-500 dark:text-gray-400 font-semibold">
                  Add Photo
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Upload Progress */}
        {uploading && uploadProgress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        {/* Click to upload or drag */}
        {!uploading && (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={uploading}
          />
        )}
      </div>

      {/* Error Message - Below Image */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-red-800 dark:text-red-200 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Success Message - Below Image */}
      {success && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <p className="text-sm text-green-800 dark:text-green-200 font-medium">Uploaded successfully!</p>
          </div>
        </div>
      )}

      {/* Upload Info */}
      <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>Click or drag to upload</p>
        <p className="text-xs mt-1">Max 5MB • JPEG, PNG, WebP</p>
      </div>

      {/* Upload Button (Alternative) */}
      {!preview && (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Uploading... {uploadProgress}%
            </span>
          ) : (
            'Upload Photo'
          )}
        </button>
      )}

      {/* Delete Button */}
      {preview && (
        <div className="mt-4 space-y-2">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={uploading}
            className="w-full px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Processing...' : 'Remove Photo'}
          </button>

          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm text-red-800 dark:text-red-200 font-semibold mb-3">
                Are you sure you want to remove your profile photo?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteClick}
                  disabled={uploading}
                  className="flex-1 px-3 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all duration-200 disabled:opacity-50"
                >
                  {uploading ? 'Removing...' : 'Remove'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={uploading}
                  className="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileImageUpload;
