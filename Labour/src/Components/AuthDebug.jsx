import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, Badge, Button } from 'react-bootstrap';

const AuthDebug = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const [token, setToken] = useState('');
  const [storedUser, setStoredUser] = useState(null);

  useEffect(() => {
    const checkStorage = () => {
      const tokenFromStorage = localStorage.getItem('token');
      const userFromStorage = localStorage.getItem('user');
      
      setToken(tokenFromStorage || 'No token');
      setStoredUser(userFromStorage ? JSON.parse(userFromStorage) : null);
    };

    checkStorage();
    
    // Check storage every 2 seconds to detect changes
    const interval = setInterval(checkStorage, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const clearStorage = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('No token');
    setStoredUser(null);
  };

  const getAuthStatus = () => {
    if (loading) return { status: 'loading', color: 'warning', text: '🔄 Loading...' };
    if (isAuthenticated && user) return { status: 'authenticated', color: 'success', text: '✅ Authenticated' };
    if (token !== 'No token' && storedUser) return { status: 'stored', color: 'info', text: '💾 Stored Data' };
    return { status: 'not-authenticated', color: 'danger', text: '❌ Not Authenticated' };
  };

  const authStatus = getAuthStatus();

  return (
    <Card className="mb-3 border-warning">
      <Card.Header className="bg-warning text-dark">
        <h6 className="mb-0">🔍 Auth Debug Panel</h6>
      </Card.Header>
      <Card.Body className="p-3">
        <div className="row">
          <div className="col-md-6">
            <h6>Authentication Status</h6>
            <div className="mb-2">
              <Badge bg={authStatus.color}>{authStatus.text}</Badge>
            </div>
            
            <div className="mb-2">
              <small className="text-muted">Context User:</small>
              <div className="small">
                {user ? (
                  <span className="text-success">✅ {user.name} ({user.email})</span>
                ) : (
                  <span className="text-danger">❌ No user in context</span>
                )}
              </div>
            </div>

            <div className="mb-2">
              <small className="text-muted">Stored User:</small>
              <div className="small">
                {storedUser ? (
                  <span className="text-info">💾 {storedUser.name} ({storedUser.email})</span>
                ) : (
                  <span className="text-danger">❌ No stored user</span>
                )}
              </div>
            </div>

            <div className="mb-2">
              <small className="text-muted">Token:</small>
              <div className="small text-break">
                {token !== 'No token' ? (
                  <span className="text-success">✅ {token.substring(0, 20)}...</span>
                ) : (
                  <span className="text-danger">❌ No token</span>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <h6>Actions</h6>
            <div className="d-grid gap-2">
              <Button 
                size="sm" 
                variant="outline-danger"
                onClick={clearStorage}
              >
                🗑️ Clear Storage
              </Button>
              
              <Button 
                size="sm" 
                variant="outline-info"
                onClick={() => window.location.reload()}
              >
                🔄 Reload Page
              </Button>
            </div>

            <div className="mt-3">
              <h6>Debug Info</h6>
              <div className="small text-muted">
                <div>Loading: {loading ? 'Yes' : 'No'}</div>
                <div>Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
                <div>User ID: {user?.id || 'None'}</div>
                <div>User Role: {user?.role || 'None'}</div>
              </div>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default AuthDebug; 