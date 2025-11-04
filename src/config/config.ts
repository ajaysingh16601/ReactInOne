// src/config/config.ts
const API_URL = import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || "http://localhost:5000/api/v1";
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173";

// Extract backend base URL (remove /api/v1)
const getBackendBaseUrl = (url: string): string => {
    try {
        const urlObj = new URL(url);
        return `${urlObj.protocol}//${urlObj.host}`;
    } catch {
        // Fallback for localhost default
        return "http://localhost:5000";
    }
};

export const config = {
    API_URL,
    FRONTEND_URL,
    BACKEND_BASE_URL: getBackendBaseUrl(API_URL),
};