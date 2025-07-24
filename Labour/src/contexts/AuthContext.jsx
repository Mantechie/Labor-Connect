import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on app start and token changes
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = authService.getStoredUser();
        
        if (token && storedUser) {
          // Only verify token if we have both token and user
          try {
            const response = await authService.getCurrentUser();
            setUser(response.user);
          } catch (error) {
            // Handle different types of errors appropriately
            if (error.message?.includes('token') || 
                error.message?.includes('auth') ||
                error.message?.includes('unauthorized') ||
                error.message?.includes('Session expired') ||
                error.message?.includes('Access forbidden') ||
                error.status === 401 || 
                error.status === 403) {
              console.log('Authentication error, logging out:', error.message);
              authService.logout();
              setUser(null);
            } else if (error.message?.includes('Network error') || 
                       error.message?.includes('CORS') ||
                       error.code === 'ERR_NETWORK') {
              // For network/CORS errors, keep user logged in but show warning
              console.log('Network/CORS error, keeping user logged in:', error.message);
              setUser(storedUser);
            } else {
              // For other errors (server down), keep the user logged in
              console.log('Server error, keeping user logged in:', error.message);
              setUser(storedUser);
            }
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    setUser(response.user);
    // Store refresh token
    if (response.user.refreshToken) {
      localStorage.setItem('refreshToken', response.user.refreshToken);
    }
    return response;
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    setUser(response.user);
    // Store refresh token
    if (response.user.refreshToken) {
      localStorage.setItem('refreshToken', response.user.refreshToken);
    }
    return response;
  };

  const sendOTP = async (email, phone) => {
    return await authService.sendOTP(email, phone);
  };

  const verifyOTP = async (email, phone, otp) => {
    const response = await authService.verifyOTP(email, phone, otp);
    setUser(response.user);
    // Store refresh token
    if (response.user.refreshToken) {
      localStorage.setItem('refreshToken', response.user.refreshToken);
    }
    return response;
  };

  const logout = async () => {
    try {
      // Call logout endpoint to invalidate refresh token
      const token = localStorage.getItem('token');
      if (token) {
        await authService.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all auth data
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    login,
    register,
    sendOTP,
    verifyOTP,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 