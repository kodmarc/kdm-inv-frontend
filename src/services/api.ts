import axios from 'axios';

// Single shared Axios instance — all API calls go through this.
// withCredentials sends the HttpOnly JWT cookies cross-origin.
// xsrf config aligns with Django's cookie name/header name for CSRF.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
});

// Intercept 401 responses and attempt a silent token refresh before failing.
// Auth endpoints are excluded — a 401 from login/signup is a real failure, not an expiry.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthRequest = originalRequest.url?.includes('/auth/login-org') ||
                          originalRequest.url?.includes('/auth/login-branch') ||
                          originalRequest.url?.includes('/auth/signup') ||
                          originalRequest.url?.includes('/auth/logout');

    if (error.response?.status === 401 && !isAuthRequest) {
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Use a bare axios call (not the shared `api` instance) to avoid hitting this
          // interceptor recursively if the refresh endpoint itself returns 401.
          await axios.post(
            `${import.meta.env.VITE_API_URL}/auth/refresh/`,
            {},
            { withCredentials: true }
          );

          return api(originalRequest);
        } catch (refreshError) {
          // Both tokens are expired or blacklisted — notify AuthContext to clear state.
          window.dispatchEvent(new Event('auth-session-expired'));
          return Promise.reject(refreshError);
        }
      } else {
        // The retried request itself returned 401 — definitely expired, clear session.
        window.dispatchEvent(new Event('auth-session-expired'));
      }
    }

    return Promise.reject(error);
  }
);

export default api;
