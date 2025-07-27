import axios from 'axios'
import authService from '../services/authService';

// Create axios instance with comprehensive CORS configuration
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Include credentials (cookies, auth headers) in requests
  
  // Additional CORS-related configurations
  validateStatus: function (status) {
    // Consider 2xx and 3xx as success, handle CORS errors properly
    return status >= 200 && status < 400;
  }
})

// Add request ID for debugging
let requestId = 0;

// Flag to prevent multiple refresh requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor to add CSRF token and debug info
axiosInstance.interceptors.request.use(
  (config) => {
    // Add request ID for debugging
    config.metadata = { requestId: ++requestId, startTime: Date.now() };
    
    // Add CSRF token if available (for CSRF protection)
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    
    // Add additional headers for CORS compatibility
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    
    // Debug logging in development
    if (import.meta.env.VITE_NODE_ENV === 'development' && import.meta.env.VITE_SHOW_CONSOLE_LOGS === 'true') {
      console.log(`🚀 API Request [${config.metadata.requestId}]:`, {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        headers: config.headers,
        data: config.data
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and CORS errors
axiosInstance.interceptors.response.use(
  (response) => {
    // Debug logging in development
    if (import.meta.env.VITE_NODE_ENV === 'development' && import.meta.env.VITE_SHOW_CONSOLE_LOGS === 'true') {
      const duration = Date.now() - response.config.metadata?.startTime;
      console.log(`✅ API Response [${response.config.metadata?.requestId}]:`, {
        status: response.status,
        statusText: response.statusText,
        duration: `${duration}ms`,
        data: response.data
      });
    }
    return response;
  },
  async (error) => {
    // Enhanced error logging
    if (import.meta.env.VITE_NODE_ENV === 'development') {
      console.error('❌ API Error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          method: error.config?.method,
          url: error.config?.url,
          baseURL: error.config?.baseURL
        }
      });
    }
    
    // Handle CORS errors specifically
    if (error.message?.includes('CORS') || error.message?.includes('Network Error')) {
      console.error('🚫 CORS Error detected:', error.message);
      
      // Show user-friendly CORS error
      if (window.showToast) {
        window.showToast('Connection error. Please check if the server is running.', 'error');
      }
      
      return Promise.reject({
        ...error,
        isCorsError: true,
        userMessage: 'Unable to connect to server. Please try again later.'
      });
    }
    
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors (expired token)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return axiosInstance(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Use the authService to refresh the token
        await authService.refreshToken();
        
        // Process queued requests
        processQueue(null);
        
        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh token failed, logout user
        processQueue(refreshError);
        await authService.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance
