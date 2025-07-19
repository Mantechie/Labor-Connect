import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spinner } from 'react-bootstrap';

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

  // Check if user is authenticated and has admin role
  if (!user) {
    // Not logged in, redirect to admin login
    return <Navigate to="/admin/login" replace />;
  }

  if (user.role !== 'admin') {
    // User is logged in but not admin, redirect to home
    return <Navigate to="/" replace />;
  }

  // User is authenticated and is admin, render the protected component
  return children;
};

export default AdminProtectedRoute; 