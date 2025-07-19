import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spinner } from 'react-bootstrap';
import adminAuthService from '../services/adminAuthService';

const AdminProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  // Check if admin is authenticated via adminAuthService
  const isAdminAuthenticated = adminAuthService.isAuthenticated();
  
  if (!isAdminAuthenticated) {
    // Not logged in as admin, redirect to admin login
    return <Navigate to="/admin/login" replace />;
  }

  // Check if user is authenticated and has admin role (for additional security)
  if (user && (user.role === 'admin' || user.role === 'super_admin')) {
    // User is authenticated and is admin, render the protected component
    return children;
  }

  // If no user context but admin is authenticated, still allow access
  if (isAdminAuthenticated) {
    return children;
  }

  // User is logged in but not admin, redirect to home
  return <Navigate to="/" replace />;
};

export default AdminProtectedRoute; 