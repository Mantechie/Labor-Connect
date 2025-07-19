import axios from 'axios'

const adminAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

console.log('🔧 Admin Axios Instance created with baseURL:', adminAxiosInstance.defaults.baseURL);

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

// List of endpoints that don't need authentication
const publicEndpoints = [
  '/admin/auth/login',
  '/admin/auth/register', 
  '/admin/auth/send-otp',
  '/admin/auth/verify-otp',
  '/admin/auth/refresh'
];

// Request interceptor to add admin auth token
adminAxiosInstance.interceptors.request.use(
  (config) => {
    // Check if this is a public endpoint that doesn't need authentication
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url.includes(endpoint)
    );
    
    if (isPublicEndpoint) {
      console.log('🔍 Admin Request (Public):', {
        url: config.url,
        method: config.method,
        noAuth: 'Public endpoint - no token needed'
      });
      return config;
    }
    
    const adminToken = localStorage.getItem('adminToken');
    console.log('🔍 Admin Request (Protected):', {
      url: config.url,
      method: config.method,
      hasAdminToken: !!adminToken,
      tokenStart: adminToken ? adminToken.substring(0, 20) + '...' : 'null'
    });
    
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Admin Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle admin token refresh
adminAxiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ Admin Response Interceptor Success:', {
      url: response.config.url,
      status: response.status,
      hasData: !!response.data
    });
    return response;
  },
  async (error) => {
    console.log('❌ Admin Response Interceptor Error:', {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('🔄 Admin 401 error, attempting token refresh...');
      
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return adminAxiosInstance(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const adminRefreshToken = localStorage.getItem('adminRefreshToken');
      
      if (!adminRefreshToken) {
        console.log('❌ No admin refresh token available');
        // No refresh token, logout admin
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminRefreshToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/admin/login';
        return Promise.reject(error);
      }

      try {
        console.log('🔄 Attempting admin token refresh...');
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/admin/auth/refresh`,
          { refreshToken: adminRefreshToken }
        );

        const { token: newToken, refreshToken: newRefreshToken, admin } = response.data;
        
        console.log('✅ Admin token refresh successful');
        
        // Update tokens in localStorage
        localStorage.setItem('adminToken', newToken);
        localStorage.setItem('adminRefreshToken', newRefreshToken);
        localStorage.setItem('adminUser', JSON.stringify(admin));
        
        // Update Authorization header
        originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
        
        // Process queued requests
        processQueue(null, newToken);
        
        return adminAxiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('❌ Admin token refresh failed:', refreshError);
        // Refresh token failed, logout admin
        processQueue(refreshError, null);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminRefreshToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/admin/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export default adminAxiosInstance 