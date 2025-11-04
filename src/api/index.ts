// src/api/index.ts
import axios from "axios";
import { config } from "../config/config";
import { decrypt, encrypt } from "./encryption";

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
  if (req.data) {
    const encryptedData = encrypt(req.data);
    req.data = { data: encryptedData };
  }

  const token = localStorage.getItem("accessToken");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (response.data?.data) {
      const decryptedData = decrypt(response.data.data);
      response.data = decryptedData;
    }
    return response;
  },
  (error) => {
    if (error.response?.data?.data) {
      try {
        const decryptedErrorData = decrypt(error.response.data.data);
        error.response.data = decryptedErrorData;
      } catch (decryptError) {
        console.error('Failed to decrypt error response:', decryptError);
      }
    }
    return Promise.reject(error);
  }
);
