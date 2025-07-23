import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminAuthService from '../services/adminAuthService';

const AdminAuthTest = () => {
  const [authState, setAuthState] = useState({});
  const [testResult, setTestResult] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = () => {
    const adminToken = localStorage.getItem('adminToken');
    const adminUser = localStorage.getItem('adminUser');
    const adminRefreshToken = localStorage.getItem('adminRefreshToken');
    const isAuthenticated = adminAuthService.isAuthenticated();
    const storedAdmin = adminAuthService.getStoredAdmin();

    setAuthState({
      hasAdminToken: !!adminToken,
      hasAdminUser: !!adminUser,
      hasRefreshToken: !!adminRefreshToken,
      isAuthenticated,
      storedAdmin,
      tokenLength: adminToken ? adminToken.length : 0,
      currentPath: window.location.pathname,
      currentTime: new Date().toLocaleString()
    });
  };

  const testLogin = async () => {
    setTestResult('Testing login...');
    try {
      await adminAuthService.login('admin@example.com', 'admin123');
      setTestResult('✅ Login successful! Checking auth state...');
      setTimeout(() => {
        checkAuthState();
        setTestResult('✅ Login successful! Auth state updated.');
      }, 1000);
    } catch (error) {
      setTestResult(`❌ Login failed: ${error.message}`);
    }
  };

  const testNavigation = () => {
    setTestResult('Testing navigation to dashboard...');
    navigate('/admin/dashboard');
  };

  const clearAuth = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminRefreshToken');
    checkAuthState();
    setTestResult('🧹 Auth data cleared');
  };

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f8f9fa', 
      border: '2px solid #007bff',
      borderRadius: '8px',
      margin: '20px',
      fontFamily: 'monospace'
    }}>
      <h2>🧪 Admin Authentication Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={testLogin} style={{ marginRight: '10px', padding: '8px 16px' }}>
          🔐 Test Login
        </button>
        <button onClick={testNavigation} style={{ marginRight: '10px', padding: '8px 16px' }}>
          🚀 Navigate to Dashboard
        </button>
        <button onClick={clearAuth} style={{ marginRight: '10px', padding: '8px 16px' }}>
          🧹 Clear Auth
        </button>
        <button onClick={checkAuthState} style={{ padding: '8px 16px' }}>
          🔄 Refresh State
        </button>
      </div>

      {testResult && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: testResult.includes('✅') ? '#d4edda' : testResult.includes('❌') ? '#f8d7da' : '#fff3cd',
          border: '1px solid #ccc',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <strong>Test Result:</strong> {testResult}
        </div>
      )}

      <div style={{ backgroundColor: '#e9ecef', padding: '15px', borderRadius: '4px' }}>
        <h4>📊 Current Auth State:</h4>
        <p><strong>Current Path:</strong> {authState.currentPath}</p>
        <p><strong>Current Time:</strong> {authState.currentTime}</p>
        <p><strong>Has Admin Token:</strong> {authState.hasAdminToken ? '✅ Yes' : '❌ No'}</p>
        <p><strong>Has Admin User:</strong> {authState.hasAdminUser ? '✅ Yes' : '❌ No'}</p>
        <p><strong>Has Refresh Token:</strong> {authState.hasRefreshToken ? '✅ Yes' : '❌ No'}</p>
        <p><strong>Is Authenticated:</strong> {authState.isAuthenticated ? '✅ Yes' : '❌ No'}</p>
        <p><strong>Token Length:</strong> {authState.tokenLength}</p>
        
        <details style={{ marginTop: '10px' }}>
          <summary><strong>Stored Admin Data:</strong></summary>
          <pre style={{ 
            backgroundColor: '#ffffff', 
            padding: '10px', 
            borderRadius: '4px',
            border: '1px solid #ddd',
            marginTop: '5px',
            fontSize: '12px'
          }}>
            {JSON.stringify(authState.storedAdmin, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
};

export default AdminAuthTest;