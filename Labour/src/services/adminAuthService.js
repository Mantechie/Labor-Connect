import adminAxiosInstance from '../utils/adminAxiosInstance';

class AdminAuthService {
  // Admin login
  async login(email, password) {
    try {
      const requestData = { email, password };
      const response = await adminAxiosInstance.post('/admin/auth/login', requestData);
      
      if (response.data.admin && response.data.admin.token) {
        localStorage.setItem('adminToken', response.data.admin.token);
        localStorage.setItem('adminRefreshToken', response.data.admin.refreshToken);
        localStorage.setItem('adminUser', JSON.stringify(response.data.admin));
      } else {
        throw new Error('Authentication failed');
      }
      
      return response.data;
    } catch (error) {
      // Handle CORS and network errors specifically
      if (error.code === 'ERR_NETWORK' || error.message?.includes('CORS')) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      // Handle 403 Forbidden errors
      if (error.response?.status === 403) {
        throw new Error('Admin access forbidden. Please check your credentials or contact support.');
      }
      
      // Handle 401 Unauthorized errors
      if (error.response?.status === 401) {
        throw new Error('Invalid admin credentials. Please try again.');
      }
      
      const errorMessage = error.response?.data?.message || error.message || 'Admin login failed. Please try again.';
      throw new Error(errorMessage);
    }
  }

  // Admin register (super admin only)
  async register(adminData) {
    try {
      const response = await adminAxiosInstance.post('/admin/auth/register', adminData);
      if (response.data.admin && response.data.admin.token) {
        localStorage.setItem('adminToken', response.data.admin.token);
        localStorage.setItem('adminRefreshToken', response.data.admin.refreshToken);
        localStorage.setItem('adminUser', JSON.stringify(response.data.admin));
      }
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      throw new Error(errorMessage);
    }
  }

  // Send admin OTP
  async sendOTP(email, phone) {
    try {
      const response = await adminAxiosInstance.post('/admin/auth/send-otp', { email, phone });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send OTP. Please try again.';
      throw new Error(errorMessage);
    }
  }

  // Verify admin OTP
  async verifyOTP(email, phone, otp) {
    try {
      const response = await adminAxiosInstance.post('/admin/auth/verify-otp', { email, phone, otp });
      if (response.data.admin && response.data.admin.token) {
        localStorage.setItem('adminToken', response.data.admin.token);
        localStorage.setItem('adminRefreshToken', response.data.admin.refreshToken);
        localStorage.setItem('adminUser', JSON.stringify(response.data.admin));
      }
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'OTP verification failed. Please try again.';
      throw new Error(errorMessage);
    }
  }

  // Refresh admin token
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('adminRefreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await adminAxiosInstance.post('/admin/auth/refresh', { refreshToken });
      
      if (response.data.token) {
        // Update tokens in localStorage
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminRefreshToken', response.data.refreshToken);
        if (response.data.admin) {
          localStorage.setItem('adminUser', JSON.stringify(response.data.admin));
        }
      }
      
      return response.data;
    } catch (error) {
      // If refresh fails, clear admin data
      this.logout();
      throw new Error('Session expired. Please login again.');
    }
  }

  // Get current admin
  async getCurrentAdmin() {
    try {
      const response = await adminAxiosInstance.get('/admin/auth/me');
      return response.data;
    } catch (error) {
      // Handle CORS and network errors specifically
      if (error.code === 'ERR_NETWORK' || error.message?.includes('CORS')) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      // Handle 403 Forbidden errors
      if (error.response?.status === 403) {
        throw new Error('Admin access forbidden. Please login again.');
      }
      
      // Handle 401 Unauthorized errors
      if (error.response?.status === 401) {
        throw new Error('Admin session expired. Please login again.');
      }
      
      throw new Error('Failed to get admin information.');
    }
  }

  // Admin logout
  async logout() {
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        await adminAxiosInstance.post('/admin/auth/logout');
      }
    } catch (error) {
      // Silently handle logout errors
    } finally {
      // Clear all admin data
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminRefreshToken');
      localStorage.removeItem('adminUser');
    }
  }

  // Check if admin is authenticated
  isAuthenticated() {
    const hasToken = !!localStorage.getItem('adminToken');
    const hasUser = !!localStorage.getItem('adminUser');
    return hasToken && hasUser;
  }

  // Get stored admin user
  getStoredAdmin() {
    const admin = localStorage.getItem('adminUser');
    return admin ? JSON.parse(admin) : null;
  }

  // Store admin auth data
  storeAdminAuthData(admin, token) {
    localStorage.setItem('adminUser', JSON.stringify(admin));
    localStorage.setItem('adminToken', token);
  }

  // Validate admin token
  async validateToken() {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        return false;
      }

      // Try to get current admin to validate token
      await this.getCurrentAdmin();
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default new AdminAuthService(); 