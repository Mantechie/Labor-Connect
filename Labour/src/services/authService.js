import axiosInstance from '../utils/axiosInstance';

// Centralized error handling utility
const handleAuthError = (error, defaultMessage) => {
  // Handle CORS and network errors specifically
  if (error.code === 'ERR_NETWORK' || error.message?.includes('CORS')) {
    throw new Error('Network error. Please check your connection and try again.');
  }
  
  // Handle 403 Forbidden errors
  if (error.response?.status === 403) {
    throw new Error('Access forbidden. Please check your credentials or contact support.');
  }
  
  // Handle 401 Unauthorized errors
  if (error.response?.status === 401) {
    throw new Error('Session expired. Please login again.');
  }
  
  // Handle 500 Server errors specifically
  if (error.response?.status === 500) {
    console.error('Server error details:', error.response?.data);
    throw new Error('Server error occurred. Our team has been notified. Please try again later.');
  }
  
  // Handle other HTTP errors
  const errorMessage = error.response?.data?.message || error.message || defaultMessage;
  throw new Error(errorMessage);
};

class AuthService {
  // Login user
  async login(email, password) {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      // Store user data only (tokens will be in HttpOnly cookies)
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      // Log detailed error information for debugging
      console.error('Login error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      handleAuthError(error, 'Login failed. Please try again.');
    }
  }

  // Rest of the methods remain the same...
  // Register user
  async register(userData) {
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      // Store user data only (tokens will be in HttpOnly cookies)
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      handleAuthError(error, 'Registration failed. Please try again.');
    }
  }

  // Send OTP
  async sendOTP(email, phone) {
    try {
      const response = await axiosInstance.post('/auth/send-otp', { email, phone });
      return response.data;
    } catch (error) {
      handleAuthError(error, 'Failed to send OTP. Please try again.');
    }
  }

  // Verify OTP
  async verifyOTP(email, phone, otp) {
    try {
      const response = await axiosInstance.post('/auth/verify-otp', { email, phone, otp });
      // Store user data only (tokens will be in HttpOnly cookies)
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      handleAuthError(error, 'OTP verification failed. Please try again.');
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
      handleAuthError(error, 'Password reset failed. Please try again.');
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const response = await axiosInstance.get('/auth/me');
      return response.data;
    } catch (error) {
      handleAuthError(error, 'Failed to get user information.');
    }
  }

  // Refresh token
  async refreshToken() {
    try {
      const response = await axiosInstance.post('/auth/refresh');
      return response.data;
    } catch (error) {
      handleAuthError(error, 'Failed to refresh authentication.');
    }
  }

  // Logout - call backend to invalidate tokens (cookies)
  async logout() {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      // Silently handle logout errors
      console.error('Logout error:', error);
    } finally {
      // Clear user data
      localStorage.removeItem('user');
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    // Since we can't check HttpOnly cookies directly,
    // we rely on the presence of user data
    return !!this.getStoredUser();
  }

  // Get stored user
  getStoredUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Store user data
  storeUserData(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  // Clear user data
  clearUserData() {
    localStorage.removeItem('user');
  }
}

export default new AuthService();
