// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout Components
import Header from './Components/Header';
import Footer from './Components/Footer';
import { ToastProvider } from './Components/ToastContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './Components/ProtectedRoute';
import AdminProtectedRoute from './Components/AdminProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import OTPLoginPage from './pages/OTPLoginPage';
import OTPVerificationPage from './pages/OTPVerificationPage';
import JobPostPage from './pages/JobPostPage';
import HelpPage from './pages/HelpPage';
import TestOTP from './pages/TestOTP';
import UserProfile from './pages/UserProfile';
import BrowseLaborers from './pages/BrowseLaborers';
import JobManagement from './pages/JobManagement';
import LaborerDashboard from './pages/LaborerDashboard';
import UserDashboard from './pages/UserDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

// Features
import JobListing from './Components/JobListing';
import LaborerProfile from './Components/LaborerProfile';
import ChatInterface from './Components/ChatInterface';

// Styles
import './styles/App.css';
import './styles/components.css';

const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="d-flex flex-column min-vh-100">
            <Header />
            <main className="flex-fill">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/otp-login" element={<OTPLoginPage />} />
                <Route path="/otp-verification" element={<OTPVerificationPage />} />
                <Route path="/test-otp" element={<TestOTP />} />
                
                {/* Admin Routes - Must come before other protected routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={
                  <AdminProtectedRoute>
                    <AdminDashboard />
                  </AdminProtectedRoute>
                } />
                <Route path="/admin-login" element={<AdminLogin />} />
                
                {/* User Protected Routes */}
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                } />
                <Route path="/job-post" element={
                  <ProtectedRoute>
                    <JobPostPage />
                  </ProtectedRoute>
                } />
                <Route path="/chat" element={
                  <ProtectedRoute>
                    <ChatInterface />
                  </ProtectedRoute>
                } />
                <Route path="/browse-laborers" element={
                  <ProtectedRoute>
                    <BrowseLaborers />
                  </ProtectedRoute>
                } />
                <Route path="/job-management" element={
                  <ProtectedRoute>
                    <JobManagement />
                  </ProtectedRoute>
                } />
                <Route path="/laborer-dashboard" element={
                  <ProtectedRoute>
                    <LaborerDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/user-dashboard" element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                } />
                
                {/* Public Routes */}
                <Route path="/job-listings" element={<JobListing />} />
                <Route path="/laborer-profile" element={<LaborerProfile />} />
                <Route path="/help" element={<HelpPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
