import axiosInstance from '../utils/axiosInstance';

class AuthService {
  // Login user
  async login(email, password) {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      if (response.data.user.token) {
        localStorage.setItem('token', response.data.user.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        if (response.data.user.refreshToken) {
          localStorage.setItem('refreshToken', response.data.user.refreshToken);
        }
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Register user
  async register(userData) {
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      if (response.data.user.token) {
        localStorage.setItem('token', response.data.user.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        if (response.data.user.refreshToken) {
          localStorage.setItem('refreshToken', response.data.user.refreshToken);
        }
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Send OTP
  async sendOTP(email, phone) {
    try {
      console.log('🔍 Sending OTP request:', { email, phone });
      const response = await axiosInstance.post('/auth/send-otp', { email, phone });
      console.log('✅ OTP response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ OTP error:', error);
      throw error.response?.data || error.message;
    }
  }

  // Verify OTP
  async verifyOTP(email, phone, otp) {
    try {
      const response = await axiosInstance.post('/auth/verify-otp', { email, phone, otp });
      if (response.data.user.token) {
        localStorage.setItem('token', response.data.user.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        if (response.data.user.refreshToken) {
          localStorage.setItem('refreshToken', response.data.user.refreshToken);
        }
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Reset password
  async resetPassword(email, otp, newPassword) {
    try {
      const response = await axiosInstance.post('/auth/reset-password', { 
        email, 
        otp, 
        newPassword 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const response = await axiosInstance.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Logout - call backend to invalidate refresh token
  async logout() {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axiosInstance.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all auth data
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  // Get stored user
  getStoredUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Store auth data
  storeAuthData(user, token) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
  }
}

export default new AuthService(); 