// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layout Components
import Header from './Components/Header';
import Footer from './Components/Footer';

// Pages
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import OTPVerificationPage from './pages/OTPVerificationPage';
import JobPostPage from './pages/JobPostPage';

// Features
import JobListing from './Components/JobListing';
import LaborerProfile from './Components/LaborerProfile';
import ChatInterface from './Components/ChatInterface';
import AdminDashboard from './Components/AdminDashboard';

// Styles
import './styles/App.css';
import './styles/components.css';

const App = () => {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Header />
        <main className="flex-fill">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/otp-verification" element={<OTPVerificationPage />} />
            <Route path="/job-post" element={<JobPostPage />} />
            <Route path="/job-listings" element={<JobListing />} />
            <Route path="/laborer-profile" element={<LaborerProfile />} />
            <Route path="/chat" element={<ChatInterface />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
