import adminAxiosInstance from '../utils/adminAxiosInstance';

class AdminAuthService {
  // Admin login
  async login(email, password) {
    try {
      console.log('🔍 Frontend: Admin login attempt:', { email, hasPassword: !!password });
      
      const requestData = { email, password };
      console.log('📤 Frontend: Sending request data:', requestData);
      
      const response = await adminAxiosInstance.post('/admin/auth/login', requestData);
      console.log('✅ Frontend: Admin login response received:', {
        status: response.status,
        hasData: !!response.data,
        hasAdmin: !!response.data.admin,
        hasToken: !!response.data.admin?.token,
        hasRefreshToken: !!response.data.admin?.refreshToken
      });
      
      if (response.data.admin && response.data.admin.token) {
        console.log('💾 Frontend: Storing admin tokens in localStorage');
        localStorage.setItem('adminToken', response.data.admin.token);
        localStorage.setItem('adminRefreshToken', response.data.admin.refreshToken);
        localStorage.setItem('adminUser', JSON.stringify(response.data.admin));
        
        console.log('✅ Frontend: Admin tokens stored successfully');
        console.log('🔑 Frontend: adminToken length:', response.data.admin.token.length);
        console.log('🔑 Frontend: adminRefreshToken length:', response.data.admin.refreshToken.length);
      } else {
        console.log('❌ Frontend: No token in response');
        throw new Error('No authentication token received');
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Frontend: Admin login error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      throw error.response?.data || error.message;
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
      throw error.response?.data || error.message;
    }
  }

  // Send admin OTP
  async sendOTP(email, phone) {
    try {
      console.log('🔍 Sending Admin OTP request:', { email, phone });
      const response = await adminAxiosInstance.post('/admin/auth/send-otp', { email, phone });
      console.log('✅ Admin OTP response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Admin OTP error:', error);
      throw error.response?.data || error.message;
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
      throw error.response?.data || error.message;
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
      throw error.response?.data || error.message;
    }
  }

  // Get current admin
  async getCurrentAdmin() {
    try {
      const response = await adminAxiosInstance.get('/admin/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
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
      console.error('Admin logout error:', error);
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
    console.log('🔍 Frontend: Admin authentication check:', { hasToken, hasUser });
    return hasToken && hasUser;
  }

  // Get stored admin user
  getStoredAdmin() {
    const admin = localStorage.getItem('adminUser');
    const parsedAdmin = admin ? JSON.parse(admin) : null;
    console.log('🔍 Frontend: Getting stored admin:', { hasAdmin: !!parsedAdmin });
    return parsedAdmin;
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
      console.log('Admin token validation failed:', error);
      return false;
    }
  }
}

export default new AdminAuthService(); 