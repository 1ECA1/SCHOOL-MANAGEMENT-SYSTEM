
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// =====================================================
// ATTACH ACCESS TOKEN TO EVERY REQUEST
// =====================================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // IMPORTANT:
    // Do NOT force Content-Type here.
    //
    // Axios will automatically use:
    // - application/json for normal objects
    // - multipart/form-data for FormData
    //
    // This is required for school logo uploads.

    return config;
  },
  (error) => Promise.reject(error),
);

// =====================================================
// AUTO REFRESH ACCESS TOKEN ON 401
// =====================================================

let isRefreshing = false;
let refreshQueue = [];

// =====================================================
// PROCESS QUEUED REQUESTS
// =====================================================

const processQueue = (error, token = null) => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  refreshQueue = [];
};

// =====================================================
// RESPONSE INTERCEPTOR
// =====================================================

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 errors
    if (
      error.response?.status !== 401 ||
      originalRequest?._retry
    ) {
      return Promise.reject(error);
    }

    const refreshToken =
      localStorage.getItem("refresh_token");

    // No refresh token
    if (!refreshToken) {
      localStorage.clear();
      window.location.href = "/login";

      return Promise.reject(error);
    }

    // ===================================================
    // IF ANOTHER REQUEST IS ALREADY REFRESHING
    // ===================================================

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve,
          reject,
        });
      }).then((token) => {
        originalRequest.headers.Authorization =
          `Bearer ${token}`;

        return api(originalRequest);
      });
    }

    // ===================================================
    // START TOKEN REFRESH
    // ===================================================

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/token/refresh/`,
        {
          refresh: refreshToken,
        },
      );

      const newAccessToken = data.access;

      // Save new access token
      localStorage.setItem(
        "access_token",
        newAccessToken,
      );

      // Resolve queued requests
      processQueue(null, newAccessToken);

      // Retry original request
      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      // Reject queued requests
      processQueue(refreshError, null);

      // Clear authentication
      localStorage.clear();

      // Return to login
      window.location.href = "/login";

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
