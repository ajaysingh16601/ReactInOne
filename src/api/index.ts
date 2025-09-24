// src/api/index.ts
import axios from "axios";
import { config } from "../config/config";

export const api = axios.create({
  baseURL: config.API_URL,
  withCredentials: true,
});

// Attach tokens automatically
api.interceptors.request.use((req) => {
  const token = localStorage.getItem("accessToken");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Handle refresh later if needed...