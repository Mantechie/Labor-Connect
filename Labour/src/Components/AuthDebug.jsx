import React from 'react';
import { Card, Alert, Badge } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const AuthDebug = () => {
  const { currentUser } = useAuth();
  
  return (
    <Card className="mt-3">
      <Card.Header>
        <h5>🔐 Auth Debug</h5>
        <small className="text-muted">
          Debug information about authentication state
        </small>
      </Card.Header>
      <Card.Body>
        {currentUser ? (
          <>
            <Alert variant="success">
              <Badge bg="success">Authenticated</Badge>
              <div className="mt-2">
                <strong>User ID:</strong> {currentUser.uid}
              </div>
              <div>
                <strong>Email:</strong> {currentUser.email || 'Not provided'}
              </div>
            </Alert>
          </>
        ) : (
          <Alert variant="warning">
            <Badge bg="warning">Not Authenticated</Badge>
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default AuthDebug;