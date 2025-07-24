import React, { useState } from 'react';
import { Button, Card, Alert, Badge } from 'react-bootstrap';
import { runAllCorsTests } from '../utils/corsTest';

const CorsDebugger = () => {
  const [testResults, setTestResults] = useState(null);
  const [testing, setTesting] = useState(false);

  const handleRunTests = async () => {
    setTesting(true);
    try {
      const results = await runAllCorsTests();
      setTestResults(results);
    } catch (error) {
      console.error('Test error:', error);
      setTestResults({ error: error.message });
    } finally {
      setTesting(false);
    }
  };

  const getStatusBadge = (success) => {
    return success ? 
      <Badge bg="success">✅ Pass</Badge> : 
      <Badge bg="danger">❌ Fail</Badge>;
  };

  return (
    <Card className="mt-3">
      <Card.Header>
        <h5>🧪 CORS Debugger</h5>
        <small className="text-muted">
          Use this to test if your backend CORS is configured correctly
        </small>
      </Card.Header>
      <Card.Body>
        <div className="mb-3">
          <p><strong>Frontend Origin:</strong> {window.location.origin}</p>
          <p><strong>API Base URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}</p>
        </div>

        <Button 
          variant="primary" 
          onClick={handleRunTests}
          disabled={testing}
          className="mb-3"
        >
          {testing ? '🔄 Testing...' : '🚀 Run CORS Tests'}
        </Button>

        {testResults && (
          <div>
            <h6>Test Results:</h6>
            
            {testResults.error ? (
              <Alert variant="danger">
                <strong>Test Error:</strong> {testResults.error}
              </Alert>
            ) : (
              <>
                <div className="mb-2">
                  {getStatusBadge(testResults.basicCors?.success)} 
                  <strong> Basic CORS Test</strong>
                  {!testResults.basicCors?.success && (
                    <div className="text-danger small mt-1">
                      Error: {testResults.basicCors?.error}
                    </div>
                  )}
                </div>

                <div className="mb-2">
                  {getStatusBadge(testResults.authCors?.success)} 
                  <strong> CORS with Auth Headers</strong>
                  {!testResults.authCors?.success && (
                    <div className="text-danger small mt-1">
                      Error: {testResults.authCors?.error}
                    </div>
                  )}
                </div>

                <div className="mb-2">
                  {getStatusBadge(testResults.preflight?.success)} 
                  <strong> Preflight Request Test</strong>
                  {!testResults.preflight?.success && testResults.preflight?.type === 'cors' && (
                    <div className="text-danger small mt-1">
                      CORS Error: {testResults.preflight?.error}
                    </div>
                  )}
                  {testResults.preflight?.success && testResults.preflight?.type === 'validation' && (
                    <div className="text-success small mt-1">
                      ✅ Preflight OK (validation error is expected)
                    </div>
                  )}
                </div>

                {testResults.basicCors?.data && (
                  <Alert variant="info" className="mt-3">
                    <strong>Backend CORS Config:</strong>
                    <pre className="mt-2 mb-0" style={{ fontSize: '0.8rem' }}>
                      {JSON.stringify(testResults.basicCors.data.corsConfig, null, 2)}
                    </pre>
                  </Alert>
                )}
              </>
            )}
          </div>
        )}

        <Alert variant="warning" className="mt-3">
          <strong>🚨 Remove this component before production!</strong><br/>
          This is only for debugging CORS issues during development and deployment.
        </Alert>
      </Card.Body>
    </Card>
  );
};

export default CorsDebugger;