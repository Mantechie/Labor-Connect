import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import adminAuthService from '../services/adminAuthService';

const AdminProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminAuth = () => {
      try {
        // Simple check - just verify admin data exists in localStorage
        const isValid = adminAuthService.isAuthenticated();
        setIsAuthenticated(isValid);
      } catch (error) {
        console.error('Admin auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    // Small delay to ensure localStorage is available
    setTimeout(checkAdminAuth, 100);
  }, []);

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

  // Check if admin is authenticated
  if (!isAuthenticated) {
    // Not logged in as admin, redirect to admin login
    return <Navigate to="/admin/login" replace />;
  }

  // Admin is authenticated, render the protected component
  return children;
};

export default AdminProtectedRoute; 