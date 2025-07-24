// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Layout Components
import Header from './Components/Header';
import Footer from './Components/Footer';
import { ToastProvider } from './Components/ToastContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './Components/ProtectedRoute';
import AdminProtectedRoute from './Components/AdminProtectedRoute';
import AboutUs from './Components/AboutUs';

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
import LaborerRatings from './pages/LaborerRatings';
import UserDashboard from './pages/UserDashboard';
import UserComplaints from './pages/UserComplaints';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminProfile from './pages/AdminProfile';
import ErrorBoundary from './Components/ErrorBoundary';

// Features
import JobListing from './Components/JobListing';
import LaborerProfile from './Components/LaborerProfile';
import ChatInterface from './Components/ChatInterface';
import Portfolio from './Components/Portfolio';
import Documents from './Components/Documents';
import Complaints from './Components/Complaints';

// Styles
import './styles/App.css';
import './styles/components.css';


// Component to conditionally render layout
const AppLayout = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  if (isAdminRoute) {
    // Admin routes - no header/footer
    return <main className="flex-fill">{children}</main>;
  }
  
  // Regular routes - with header/footer
  return (
    <>
      <Header />
      <main className="flex-fill">{children}</main>
      <Footer />
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="d-flex flex-column min-vh-100">
            <Routes>
              <Route path="/" element={
                <AppLayout>
                  <HomePage />
                </AppLayout>
              } />
              <Route path="/signup" element={
                <AppLayout>
                  <SignupPage />
                </AppLayout>
              } />
              <Route path="/login" element={
                <AppLayout>
                  <LoginPage />
                </AppLayout>
              } />
              <Route path="/otp-login" element={
                <AppLayout>
                  <OTPLoginPage />
                </AppLayout>
              } />
              <Route path="/otp-verification" element={
                <AppLayout>
                  <OTPVerificationPage />
                </AppLayout>
              } />
              <Route path="/about" element={
                <AppLayout>
                 <AboutUs />
                </AppLayout>
              } />
              <Route path="/test-otp" element={
                <AppLayout>
                  <TestOTP />
                </AppLayout>
              } />
              
              {/* Admin Routes - No Header/Footer */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={
                <ErrorBoundary>
                  <AdminProtectedRoute>
                    <AdminDashboard />
                  </AdminProtectedRoute>
                </ErrorBoundary>
              } />
              <Route path="/admin/profile" element={
                <AdminProtectedRoute>
                  <AdminProfile />
                </AdminProtectedRoute>
              } />
              <Route path="/admin-login" element={<AdminLogin />} />
              
              {/* User Protected Routes */}
              <Route path="/profile" element={
                <AppLayout>
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                </AppLayout>
              } />
              <Route path="/job-post" element={
                <AppLayout>
                  <ProtectedRoute>
                    <JobPostPage />
                  </ProtectedRoute>
                </AppLayout>
              } />
              <Route path="/chat" element={
                <AppLayout>
                  <ProtectedRoute>
                    <ChatInterface />
                  </ProtectedRoute>
                </AppLayout>
              } />
              <Route path="/browse-laborers" element={
                <AppLayout>
                  <ProtectedRoute>
                    <BrowseLaborers />
                  </ProtectedRoute>
                </AppLayout>
              } />
              <Route path="/job-management" element={
                <AppLayout>
                  <ProtectedRoute>
                    <JobManagement />
                  </ProtectedRoute>
                </AppLayout>
              } />
              <Route path="/laborer-dashboard" element={
                <AppLayout>
                  <ProtectedRoute>
                    <LaborerDashboard />
                  </ProtectedRoute>
                </AppLayout>
              } />
              <Route path="/laborer-dashboard/ratings" element={
                <AppLayout>
                  <ProtectedRoute>
                    <LaborerRatings />
                  </ProtectedRoute>
                </AppLayout>
              } />
              <Route path="/laborer-dashboard/myRatings" element={
                <AppLayout>
                  <ProtectedRoute>
                    <LaborerRatings />
                  </ProtectedRoute>
                </AppLayout>
              } />
              <Route path="/user-dashboard" element={
                <AppLayout>
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                </AppLayout>
              } />
              <Route path="/user-Complaints" element={
                <AppLayout>
                  <ProtectedRoute>
                    <UserComplaints />
                  </ProtectedRoute>
                </AppLayout>
              } />
              <Route path="/myRatings" element={
                <AppLayout>
                  <ProtectedRoute>
                    <LaborerRatings />
                  </ProtectedRoute>
                </AppLayout>
              } />
              <Route path="/portfolio" element={
                <AppLayout>
                  <ProtectedRoute>
                    <Portfolio />
                  </ProtectedRoute>
                </AppLayout>
              } />
              <Route path="/documents" element={
                <AppLayout>
                  <ProtectedRoute>
                    <Documents/>
                  </ProtectedRoute>
                </AppLayout>
              } />
              <Route path="/complaints" element={
                <AppLayout>
                  <ProtectedRoute>
                    <Complaints />
                  </ProtectedRoute>
                </AppLayout>
              } />
              
              {/* Public Routes */}
              <Route path="/job-listings" element={
                <AppLayout>
                  <JobListing />
                </AppLayout>
              } />
              <Route path="/laborer-profile" element={
                <AppLayout>
                  <LaborerProfile />
                </AppLayout>
              } />
              <Route path="/laborers/:id" element={
                <AppLayout>
                  <React.Suspense fallback={<div>Loading...</div>}>
                    <LaborerProfile />
                  </React.Suspense>
                </AppLayout>
              } />
              <Route path="/help" element={
                <AppLayout>
                  <HelpPage />
                </AppLayout>
              } />
            </Routes>
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
