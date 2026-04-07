// src/components/ProfileEditForm.tsx
import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../hooks';
import { useProfileImage } from '../hooks/useProfileImage';

interface ProfileEditFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { user } = useAppSelector((state) => state.auth);
  const { uploading, error, success, updateProfile } = useProfileImage();

  const [formData, setFormData] = useState({
    firstname: user?.firstname || '',
    lastname: user?.lastname || '',
    bio: user?.bio || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Handle success
  useEffect(() => {
    if (success) {
      setTimeout(() => {
        onSuccess?.();
      }, 1500);
    }
  }, [success, onSuccess]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.firstname.trim()) {
      errors.firstname = 'First name is required';
    }

    if (!formData.lastname.trim()) {
      errors.lastname = 'Last name is required';
    }

    if (formData.firstname.length > 50) {
      errors.firstname = 'First name must be less than 50 characters';
    }

    if (formData.lastname.length > 50) {
      errors.lastname = 'Last name must be less than 50 characters';
    }

    if (formData.bio.length > 200) {
      errors.bio = 'Bio must be less than 200 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfile(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-sm text-red-800 dark:text-red-200 font-semibold">
            ❌ {error}
          </p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
          <p className="text-sm text-green-800 dark:text-green-200 font-semibold">
            ✓ Profile updated successfully!
          </p>
        </div>
      )}

      {/* First Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          First Name
        </label>
        <input
          type="text"
          name="firstname"
          value={formData.firstname}
          onChange={handleChange}
          disabled={uploading || isSubmitting}
          className={`w-full px-4 py-2.5 border rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 disabled:opacity-50 disabled:cursor-not-allowed ${
            validationErrors.firstname
              ? 'border-red-500 dark:border-red-400'
              : 'border-gray-200 dark:border-gray-700'
          }`}
          placeholder="Enter your first name"
        />
        {validationErrors.firstname && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {validationErrors.firstname}
          </p>
        )}
      </div>

      {/* Last Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Last Name
        </label>
        <input
          type="text"
          name="lastname"
          value={formData.lastname}
          onChange={handleChange}
          disabled={uploading || isSubmitting}
          className={`w-full px-4 py-2.5 border rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 disabled:opacity-50 disabled:cursor-not-allowed ${
            validationErrors.lastname
              ? 'border-red-500 dark:border-red-400'
              : 'border-gray-200 dark:border-gray-700'
          }`}
          placeholder="Enter your last name"
        />
        {validationErrors.lastname && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {validationErrors.lastname}
          </p>
        )}
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Bio
        </label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          disabled={uploading || isSubmitting}
          rows={4}
          maxLength={200}
          className={`w-full px-4 py-2.5 border rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 disabled:opacity-50 disabled:cursor-not-allowed resize-none ${
            validationErrors.bio
              ? 'border-red-500 dark:border-red-400'
              : 'border-gray-200 dark:border-gray-700'
          }`}
          placeholder="Tell us about yourself (max 200 characters)"
        />
        <div className="mt-1 flex justify-between items-center">
          {validationErrors.bio && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {validationErrors.bio}
            </p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
            {formData.bio.length}/200
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={uploading || isSubmitting}
          className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting || uploading ? (
            <>
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
              Saving...
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
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
              Save Changes
            </>
          )}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={uploading || isSubmitting}
            className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default ProfileEditForm;
