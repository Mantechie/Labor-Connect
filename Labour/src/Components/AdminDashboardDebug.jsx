import React, { useEffect, useState } from 'react';
import adminAuthService from '../services/adminAuthService';

const AdminDashboardDebug = () => {
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const checkAuth = () => {
      const adminToken = localStorage.getItem('adminToken');
      const adminUser = localStorage.getItem('adminUser');
      const isAuthenticated = adminAuthService.isAuthenticated();
      const storedAdmin = adminAuthService.getStoredAdmin();

      setDebugInfo({
        hasAdminToken: !!adminToken,
        hasAdminUser: !!adminUser,
        isAuthenticated,
        storedAdmin,
        tokenLength: adminToken ? adminToken.length : 0,
        currentPath: window.location.pathname
      });
    };

    checkAuth();
  }, []);

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f8f9fa', 
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      margin: '20px'
    }}>
      <h3>🔍 Admin Dashboard Debug Info</h3>
      <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>
        <p><strong>Current Path:</strong> {debugInfo.currentPath}</p>
        <p><strong>Has Admin Token:</strong> {debugInfo.hasAdminToken ? '✅ Yes' : '❌ No'}</p>
        <p><strong>Has Admin User:</strong> {debugInfo.hasAdminUser ? '✅ Yes' : '❌ No'}</p>
        <p><strong>Is Authenticated:</strong> {debugInfo.isAuthenticated ? '✅ Yes' : '❌ No'}</p>
        <p><strong>Token Length:</strong> {debugInfo.tokenLength}</p>
        <p><strong>Stored Admin:</strong></p>
        <pre style={{ backgroundColor: '#e9ecef', padding: '10px', borderRadius: '4px' }}>
          {JSON.stringify(debugInfo.storedAdmin, null, 2)}
        </pre>
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#d4edda', borderRadius: '4px' }}>
        <h4>✅ If you can see this, the admin dashboard route is working!</h4>
        <p>The issue might be with specific components or styling.</p>
      </div>
    </div>
  );
};

export default AdminDashboardDebug;