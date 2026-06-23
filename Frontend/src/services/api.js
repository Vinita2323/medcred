import axios from 'axios';
import { STORAGE_KEYS, ENDPOINTS, API_BASE_URL } from './types.js';

const BASE_URL = API_BASE_URL;

// Create Axios Instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper functions for storage
const getAccessToken = () => localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
const getRefreshToken = () => localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
const setTokens = (access, refresh) => {
  if (access) localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access);
  if (refresh) localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh);
};
const clearAuth = () => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER_DATA);
};

// ── Request Interceptor ─────────────────────────────────────────
// Attach Access Token to every request automatically
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ────────────────────────────────────────
// Handle 401 Unauthorized (Expired Access Token) and auto-refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and it's not the refresh token route itself
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== ENDPOINTS.AUTH_REFRESH) {
      if (isRefreshing) {
        // If already refreshing, queue the request until refresh is done
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearAuth();
        window.location.href = '/login'; // Redirect to login
        return Promise.reject(error);
      }

      try {
        // Call the refresh endpoint
        const res = await axios.post(`${BASE_URL}${ENDPOINTS.AUTH_REFRESH}`, {
          refreshToken,
        });

        const newAccessToken = res.data.data.accessToken;
        
        // Save new access token
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
        
        // Update header and retry original request
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token expired or invalid
        processQueue(refreshError, null);
        clearAuth();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ── API Export ──────────────────────────────────────────────────
export default api;
