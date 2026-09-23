import axios from "axios";
import { auth } from "../config/firebase";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Axios Request Interceptor: Attach Firebase Bearer Token dynamically
api.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // Fallback check if user is stored in localStorage
        const savedUserStr = localStorage.getItem("replate_current_user");
        if (savedUserStr) {
          const savedUser = JSON.parse(savedUserStr);
          config.headers.Authorization = `Bearer ${savedUser.uid || "dev-user-firebase-uid-123"}`;
        }
      }
    } catch (error) {
      console.warn(
        "Axios Auth Interceptor token fetch warning:",
        error.message,
      );
      const savedUserStr = localStorage.getItem("replate_current_user");
      if (savedUserStr) {
        try {
          const savedUser = JSON.parse(savedUserStr);
          config.headers.Authorization = `Bearer ${savedUser.uid || "dev-user-firebase-uid-123"}`;
        } catch (e) {}
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Axios Response Interceptor: Uniform error handling across API modules
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;

    if (status === 401) {
      console.warn(
        "API Unauthorized (401): Authentication session expired or missing token.",
      );
    } else if (status === 403) {
      console.warn(
        "API Forbidden (403): Role permissions insufficient for this action.",
      );
    } else if (status === 404) {
      console.warn("API Not Found (404): Requested resource unavailable.");
    } else if (status >= 500) {
      console.error("API Server Error (500): Internal server error occurred.");
    }

    return Promise.reject(error);
  },
);

// Helper User Sync Functions (Backwards Compatibility)
export const syncUserProfile = async (userData = {}) => {
  const response = await api.post("/users/sync", userData);
  return response.data;
};

export const getCurrentUserProfile = async () => {
  const response = await api.get("/users/me");
  return response.data;
};

export default api;
