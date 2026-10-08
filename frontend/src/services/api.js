// import axios from "axios";

// const API_BASE_URL =`r`n  import.meta.env.VITE_API_BASE_URL ||`r`n  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

// const api = axios.create({
//   baseURL: API_BASE_URL,
// });

// // =====================================================
// // ATTACH ACCESS TOKEN TO EVERY REQUEST
// // =====================================================

// api.interceptors.request.use(
//   (config) => {
//     const requestUrl = config.url || "";

//     // Do NOT send an existing access token with authentication requests
//     const isAuthRequest =
//       requestUrl.includes("/login/") ||
//       requestUrl.includes("/register/") ||
//       requestUrl.includes("/token/") ||
//       requestUrl.includes("/sign-in/");

//     if (isAuthRequest) {
//       return config;
//     }

//     const token = sessionStorage.getItem("access_token");

//     if (token) {
//       config.headers = config.headers || {};
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     return config;
//   },
//   (error) => Promise.reject(error),
// );
// // =====================================================
// // TOKEN REFRESH STATE
// // =====================================================

// let isRefreshing = false;
// let refreshQueue = [];

// // =====================================================
// // PROCESS QUEUED REQUESTS
// // =====================================================

// const processQueue = (error, token = null) => {
//   refreshQueue.forEach(({ resolve, reject }) => {
//     if (error) {
//       reject(error);
//     } else {
//       resolve(token);
//     }
//   });

//   refreshQueue = [];
// };

// // =====================================================
// // RESPONSE INTERCEPTOR
// // =====================================================

// api.interceptors.response.use(
//   (response) => response,

//   async (error) => {
//     const originalRequest = error.config;

//     if (!originalRequest) {
//       return Promise.reject(error);
//     }

//     // Only handle 401 Unauthorized
//     if (error.response?.status !== 401) {
//       return Promise.reject(error);
//     }

//     // Prevent infinite retry loop
//     if (originalRequest._retry) {
//       return Promise.reject(error);
//     }

//     const requestUrl = originalRequest.url || "";

//     // Do not refresh authentication endpoints
//     if (
//       requestUrl.includes("/token/") ||
//       requestUrl.includes("/login/") ||
//       requestUrl.includes("/sign-in/")
//     ) {
//       return Promise.reject(error);
//     }

//     // Get refresh token from THIS browser tab
//     const refreshToken =
//       sessionStorage.getItem("refresh_token");

//     // No refresh token available
//     if (!refreshToken) {
//       return Promise.reject(error);
//     }

//     // =================================================
//     // REFRESH ALREADY IN PROGRESS
//     // =================================================

//     if (isRefreshing) {
//       return new Promise((resolve, reject) => {
//         refreshQueue.push({
//           resolve,
//           reject,
//         });
//       }).then((newToken) => {
//         originalRequest.headers =
//           originalRequest.headers || {};

//         originalRequest.headers.Authorization =
//           `Bearer ${newToken}`;

//         return api(originalRequest);
//       });
//     }

//     // =================================================
//     // START TOKEN REFRESH
//     // =================================================

//     originalRequest._retry = true;
//     isRefreshing = true;

//     try {
//       const response = await axios.post(
//         `${API_BASE_URL}/token/refresh/`,
//         {
//           refresh: refreshToken,
//         },
//       );

//       const newAccessToken =
//         response.data?.access;

//       if (!newAccessToken) {
//         throw new Error(
//           "Token refresh succeeded but no access token was returned.",
//         );
//       }

//       // =================================================
//       // SAVE NEW ACCESS TOKEN TO THIS TAB ONLY
//       // =================================================

//       sessionStorage.setItem(
//         "access_token",
//         newAccessToken,
//       );

//       // Resolve queued requests
//       processQueue(null, newAccessToken);

//       // =================================================
//       // RETRY ORIGINAL REQUEST
//       // =================================================

//       originalRequest.headers =
//         originalRequest.headers || {};

//       originalRequest.headers.Authorization =
//         `Bearer ${newAccessToken}`;

//       return api(originalRequest);

//     } catch (refreshError) {
//       // Reject queued requests
//       processQueue(refreshError, null);

//       return Promise.reject(refreshError);

//     } finally {
//       isRefreshing = false;
//     }
//   },
// );

// // =====================================================
// // EXPORT API INSTANCE
// // =====================================================

// export default api;





import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api";
const api = axios.create({
  baseURL: API_BASE_URL,
});
// =====================================================
// ATTACH ACCESS TOKEN TO EVERY REQUEST
// =====================================================

api.interceptors.request.use(
  (config) => {
    const requestUrl = config.url || "";

    // Do NOT send an existing access token with
    // authentication requests.
    const isAuthRequest =
      requestUrl.includes("/login/") ||
      requestUrl.includes("/register/") ||
      requestUrl.includes("/token/") ||
      requestUrl.includes("/sign-in/");

    if (isAuthRequest) {
      return config;
    }

    const token = sessionStorage.getItem("access_token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// =====================================================
// TOKEN REFRESH STATE
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
// CLEAR AUTH SESSION
// =====================================================

const clearAuthSession = () => {
  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("refresh_token");
  sessionStorage.removeItem("user");
};

// =====================================================
// RESPONSE INTERCEPTOR
// =====================================================

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Only handle 401 Unauthorized
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Prevent infinite retry loop
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest.url || "";

    // Do not refresh authentication endpoints
    if (
      requestUrl.includes("/token/") ||
      requestUrl.includes("/login/") ||
      requestUrl.includes("/sign-in/")
    ) {
      return Promise.reject(error);
    }

    const refreshToken =
      sessionStorage.getItem("refresh_token");

    // No refresh token available
    if (!refreshToken) {
      return Promise.reject(error);
    }

    // =================================================
    // REFRESH ALREADY IN PROGRESS
    // =================================================

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve,
          reject,
        });
      }).then((newToken) => {
        originalRequest.headers =
          originalRequest.headers || {};

        originalRequest.headers.Authorization =
          `Bearer ${newToken}`;

        return api(originalRequest);
      });
    }

    // =================================================
    // START TOKEN REFRESH
    // =================================================

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/token/refresh/`,
        {
          refresh: refreshToken,
        },
      );

      const newAccessToken =
        response.data?.access;

      if (!newAccessToken) {
        throw new Error(
          "Token refresh succeeded but no access token was returned.",
        );
      }

      // =================================================
      // SAVE NEW ACCESS TOKEN
      // =================================================

      sessionStorage.setItem(
        "access_token",
        newAccessToken,
      );

      // Resolve queued requests
      processQueue(null, newAccessToken);

      // =================================================
      // RETRY ORIGINAL REQUEST
      // =================================================

      originalRequest.headers =
        originalRequest.headers || {};

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      // Reject queued requests
      processQueue(refreshError, null);

      /*
       * IMPORTANT:
       *
       * Only clear the session because the refresh token
       * itself has failed.
       *
       * We do NOT call logout() here.
       * We do NOT redirect here.
       *
       * This keeps the API layer independent from React
       * authentication/navigation.
       */

      clearAuthSession();

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

// =====================================================
// EXPORT API INSTANCE
// =====================================================

export default api;
