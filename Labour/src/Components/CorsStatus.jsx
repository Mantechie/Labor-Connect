import React, { useState, useEffect } from 'react';
import { Alert, Button, Badge, Collapse, Card } from 'react-bootstrap';
import { CorsTestUtil } from '../utils/corsTest';

const CorsStatus = () => {
  const [corsStatus, setCorsStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [lastTest, setLastTest] = useState(null);

  useEffect(() => {
    // Auto-test on component mount in development
    if (import.meta.env.VITE_NODE_ENV === 'development') {
      testCors();
    }
  }, []);

  const testCors = async () => {
    setLoading(true);
    try {
      const results = await CorsTestUtil.testConnection();
      setCorsStatus(results);
      setLastTest(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('CORS test failed:', error);
      setCorsStatus({
        tests: [],
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = () => {
    if (!corsStatus) return 'secondary';
    if (corsStatus.error) return 'danger';
    
    const passedTests = corsStatus.tests?.filter(test => test.status === 'PASS').length || 0;
    const totalTests = corsStatus.tests?.length || 0;
    const corsErrors = corsStatus.tests?.filter(test => test.isCorsError).length || 0;
    
    if (corsErrors > 0) return 'danger';
    if (passedTests === totalTests && totalTests > 0) return 'success';
    if (passedTests > 0) return 'warning';
    return 'danger';
  };

  const getStatusMessage = () => {
    if (!corsStatus) return 'Not tested';
    if (corsStatus.error) return 'Test failed';
    
    const passedTests = corsStatus.tests?.filter(test => test.status === 'PASS').length || 0;
    const totalTests = corsStatus.tests?.length || 0;
    const corsErrors = corsStatus.tests?.filter(test => test.isCorsError).length || 0;
    
    if (corsErrors > 0) return `CORS errors detected (${corsErrors})`;
    if (passedTests === totalTests && totalTests > 0) return 'All tests passed';
    if (passedTests > 0) return `${passedTests}/${totalTests} tests passed`;
    return 'All tests failed';
  };

  // Only show in development mode
  if (import.meta.env.VITE_NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Alert variant={getStatusVariant()} className="mb-3">
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <strong>🌐 CORS Status:</strong>{' '}
          <Badge bg={getStatusVariant()}>{getStatusMessage()}</Badge>
          {lastTest && (
            <small className="text-muted ms-2">
              Last tested: {lastTest}
            </small>
          )}
        </div>
        <div>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={testCors}
            disabled={loading}
            className="me-2"
          >
            {loading ? '🔄 Testing...' : '🧪 Test CORS'}
          </Button>
          <Button
            variant="outline-info"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            disabled={!corsStatus}
          >
            {showDetails ? '📄 Hide Details' : '📋 Show Details'}
          </Button>
        </div>
      </div>

      <Collapse in={showDetails}>
        <div className="mt-3">
          {corsStatus && (
            <Card>
              <Card.Header>
                <strong>CORS Test Results</strong>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <strong>Environment:</strong> {corsStatus.environment}<br />
                  <strong>Base URL:</strong> {corsStatus.baseURL}<br />
                  <strong>Backend URL:</strong> {corsStatus.backendURL}<br />
                  <strong>Timestamp:</strong> {corsStatus.timestamp}
                </div>

                {corsStatus.error && (
                  <Alert variant="danger">
                    <strong>Error:</strong> {corsStatus.error}
                  </Alert>
                )}

                {corsStatus.tests && corsStatus.tests.length > 0 && (
                  <div>
                    <strong>Test Results:</strong>
                    {corsStatus.tests.map((test, index) => (
                      <div key={index} className="mt-2 p-2 border rounded">
                        <div className="d-flex justify-content-between">
                          <strong>{test.name}</strong>
                          <Badge bg={test.status === 'PASS' ? 'success' : 'danger'}>
                            {test.status}
                          </Badge>
                        </div>
                        
                        {test.statusCode && (
                          <div><small>Status Code: {test.statusCode}</small></div>
                        )}
                        
                        {test.error && (
                          <div className="text-danger">
                            <small>Error: {test.error}</small>
                          </div>
                        )}
                        
                        {test.isCorsError && (
                          <div className="text-warning">
                            <small>⚠️ CORS-related error detected</small>
                          </div>
                        )}
                        
                        {test.headers && (
                          <details className="mt-1">
                            <summary><small>Headers</small></summary>
                            <pre className="small mt-1">
                              {JSON.stringify(test.headers, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-3">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => CorsTestUtil.logEnvironmentInfo()}
                  >
                    📊 Log Environment Info
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}
        </div>
      </Collapse>
    </Alert>
  );
};

export default CorsStatus;