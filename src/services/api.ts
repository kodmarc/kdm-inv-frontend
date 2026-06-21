import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
});

// Response interceptor to catch unauthorized errors (401) and attempt to refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    const isAuthRequest = originalRequest.url?.includes('/auth/login-org') ||
                          originalRequest.url?.includes('/auth/login-branch') ||
                          originalRequest.url?.includes('/auth/signup') ||
                          originalRequest.url?.includes('/auth/logout');

    // If the error is 401 (Unauthorized) and it is not a direct login/signup/logout request
    if (error.response?.status === 401 && !isAuthRequest) {
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          // Call the refresh endpoint to get a new access token
          await axios.post(
            `${import.meta.env.VITE_API_URL}/auth/refresh/`,
            {},
            { withCredentials: true }
          );
          
          // Retry the original request
          return api(originalRequest);
        } catch (refreshError) {
          // If refresh fails, notify the auth context to clear state
          window.dispatchEvent(new Event('auth-session-expired'));
          return Promise.reject(refreshError);
        }
      } else {
        // The retried request itself returned 401
        window.dispatchEvent(new Event('auth-session-expired'));
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
