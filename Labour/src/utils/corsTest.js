/**
 * CORS Testing Utility for Frontend
 * This utility helps test and debug CORS issues from the frontend
 */

import axiosInstance from './axiosInstance';

export class CorsTestUtil {
  static async testConnection() {
    console.log('🧪 Starting CORS Connection Test...');
    
    const results = {
      timestamp: new Date().toISOString(),
      environment: import.meta.env.VITE_NODE_ENV || 'development',
      baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
      backendURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080',
      tests: []
    };

    // Test 1: Health Check
    try {
      console.log('📡 Testing health endpoint...');
      const healthResponse = await axiosInstance.get('/health');
      results.tests.push({
        name: 'Health Check',
        status: 'PASS',
        response: healthResponse.data,
        statusCode: healthResponse.status
      });
      console.log('✅ Health check passed');
    } catch (error) {
      results.tests.push({
        name: 'Health Check',
        status: 'FAIL',
        error: error.message,
        statusCode: error.response?.status,
        isCorsError: error.isCorsError || false
      });
      console.error('❌ Health check failed:', error.message);
    }

    // Test 2: Preflight Request (OPTIONS)
    try {
      console.log('🔄 Testing preflight request...');
      const preflightResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'}/api/health`, {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type, Authorization'
        }
      });
      
      results.tests.push({
        name: 'Preflight Request',
        status: preflightResponse.ok ? 'PASS' : 'FAIL',
        statusCode: preflightResponse.status,
        headers: {
          'access-control-allow-origin': preflightResponse.headers.get('access-control-allow-origin'),
          'access-control-allow-methods': preflightResponse.headers.get('access-control-allow-methods'),
          'access-control-allow-headers': preflightResponse.headers.get('access-control-allow-headers'),
          'access-control-allow-credentials': preflightResponse.headers.get('access-control-allow-credentials')
        }
      });
      console.log('✅ Preflight request passed');
    } catch (error) {
      results.tests.push({
        name: 'Preflight Request',
        status: 'FAIL',
        error: error.message,
        isCorsError: true
      });
      console.error('❌ Preflight request failed:', error.message);
    }

    // Test 3: Direct Backend Connection (without proxy)
    if (import.meta.env.VITE_BACKEND_URL) {
      try {
        console.log('🔗 Testing direct backend connection...');
        const directResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Origin': window.location.origin
          },
          credentials: 'include'
        });
        
        const data = await directResponse.json();
        results.tests.push({
          name: 'Direct Backend Connection',
          status: directResponse.ok ? 'PASS' : 'FAIL',
          response: data,
          statusCode: directResponse.status
        });
        console.log('✅ Direct backend connection passed');
      } catch (error) {
        results.tests.push({
          name: 'Direct Backend Connection',
          status: 'FAIL',
          error: error.message,
          isCorsError: error.message?.includes('CORS') || error.message?.includes('Network Error')
        });
        console.error('❌ Direct backend connection failed:', error.message);
      }
    }

    // Summary
    const passedTests = results.tests.filter(test => test.status === 'PASS').length;
    const totalTests = results.tests.length;
    const corsErrors = results.tests.filter(test => test.isCorsError).length;

    console.log(`\n📊 CORS Test Summary:`);
    console.log(`   Passed: ${passedTests}/${totalTests}`);
    console.log(`   CORS Errors: ${corsErrors}`);
    console.log(`   Environment: ${results.environment}`);
    console.log(`   Base URL: ${results.baseURL}`);
    
    if (corsErrors > 0) {
      console.log(`\n🔧 CORS Issues Detected:`);
      console.log(`   1. Check if backend server is running on port 8080`);
      console.log(`   2. Verify CORS_ORIGIN in backend .env includes: ${window.location.origin}`);
      console.log(`   3. Check browser console for detailed CORS errors`);
    }

    return results;
  }

  static async testAuthenticatedRequest() {
    console.log('🔐 Testing authenticated request...');
    
    try {
      // This will test with auth headers if token exists
      const response = await axiosInstance.get('/auth/profile');
      console.log('✅ Authenticated request successful');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Authenticated request failed:', error.message);
      return { 
        success: false, 
        error: error.message,
        isCorsError: error.isCorsError || false,
        statusCode: error.response?.status
      };
    }
  }

  static logEnvironmentInfo() {
    console.log('🌍 Environment Information:');
    console.log(`   NODE_ENV: ${import.meta.env.VITE_NODE_ENV}`);
    console.log(`   API Base URL: ${import.meta.env.VITE_API_BASE_URL}`);
    console.log(`   Backend URL: ${import.meta.env.VITE_BACKEND_URL}`);
    console.log(`   Current Origin: ${window.location.origin}`);
    console.log(`   Debug Enabled: ${import.meta.env.VITE_ENABLE_DEBUG}`);
    console.log(`   Console Logs: ${import.meta.env.VITE_SHOW_CONSOLE_LOGS}`);
  }
}

// Auto-run basic test in development
if (import.meta.env.VITE_NODE_ENV === 'development' && import.meta.env.VITE_ENABLE_DEBUG === 'true') {
  // Run test after a short delay to ensure app is loaded
  setTimeout(() => {
    CorsTestUtil.logEnvironmentInfo();
    CorsTestUtil.testConnection();
  }, 2000);
}

export default CorsTestUtil;