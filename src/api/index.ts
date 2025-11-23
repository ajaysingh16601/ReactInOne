// src/api/index.ts
import axios from "axios";
import { config } from "../config/config";
import { decrypt, encrypt } from "./encryption";

// API configuration loaded

export const api = axios.create({
  baseURL: config.API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'x-encrypted': 'true',
  },
});

// Attach tokens automatically
api.interceptors.request.use((req) => {
  // Request prepared

  // Only encrypt if there's data to encrypt
  if (req.data !== null && req.data !== undefined) {
    try {
      const encryptedData = encrypt(req.data);
      req.data = { data: encryptedData };
    } catch (encryptError) {
      // encryption failed - proceed without encrypted payload
    }
  }

  const token = localStorage.getItem("accessToken");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Response received

    // Only decrypt if response has encrypted data format
    if (response.data?.data && typeof response.data.data === 'string') {
      // Check if it looks like encrypted data (contains colon separator)
      if (response.data.data.includes(':')) {
          try {
            const decryptedData = decrypt(response.data.data);
            response.data = decryptedData;
          } catch (decryptError) {
            console.error("Failed to decrypt response data", decryptError);
          }
      } else {
        response.data = response.data.data;
      }
    }
    // If response.data doesn't have nested data property, return as-is
    return response;
  },
  (error) => {
    // API error

    // Handle error responses
    if (error.response?.data) {
      if (error.response.data?.data && typeof error.response.data.data === 'string') {
        if (error.response.data.data.includes(':')) {
          // Try to decrypt if it looks encrypted
          try {
            const decryptedErrorData = decrypt(error.response.data.data);
            error.response.data = decryptedErrorData;
          } catch (decryptError) {
            console.error("Failed to decrypt error response data", decryptError);
            // failed to decrypt error response - leave as-is
            error.response.data = error.response.data.data || error.response.data;
          }
        } else {
          // Non-encrypted nested data
          error.response.data = error.response.data.data;
        }
      }
    }
    return Promise.reject(error);
  }
);
