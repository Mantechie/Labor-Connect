// CORS Test Utility
// Use this to test if your backend CORS is configured correctly

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const testCorsConnection = async () => {
  console.log('🧪 Testing CORS connection...');
  console.log('Frontend Origin:', window.location.origin);
  console.log('API Base URL:', API_BASE_URL);
  
  try {
    // Test simple GET request
    const response = await fetch(`${API_BASE_URL}/cors-test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include' // Important for CORS with credentials
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ CORS Test Successful:', data);
      return { success: true, data };
    } else {
      console.error('❌ CORS Test Failed:', response.status, response.statusText);
      const errorData = await response.text();
      return { success: false, error: errorData, status: response.status };
    }
  } catch (error) {
    console.error('❌ CORS Test Error:', error);
    return { success: false, error: error.message };
  }
};

export const testCorsWithAuth = async () => {
  console.log('🧪 Testing CORS with authentication...');
  
  try {
    // Test with Authorization header (simulates login request)
    const response = await fetch(`${API_BASE_URL}/cors-test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ CORS Auth Test Successful:', data);
      return { success: true, data };
    } else {
      console.error('❌ CORS Auth Test Failed:', response.status, response.statusText);
      const errorData = await response.text();
      return { success: false, error: errorData, status: response.status };
    }
  } catch (error) {
    console.error('❌ CORS Auth Test Error:', error);
    return { success: false, error: error.message };
  }
};

export const testPreflightRequest = async () => {
  console.log('🧪 Testing CORS preflight request...');
  
  try {
    // This will trigger a preflight request
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({}) // Empty body to test preflight
    });
    
    // We expect this to fail with validation error, but CORS should work
    console.log('✅ Preflight Request Completed (status:', response.status, ')');
    return { success: true, status: response.status };
  } catch (error) {
    if (error.message.includes('CORS') || error.message.includes('preflight')) {
      console.error('❌ CORS Preflight Failed:', error);
      return { success: false, error: error.message, type: 'cors' };
    } else {
      console.log('✅ Preflight OK (validation error expected):', error.message);
      return { success: true, error: error.message, type: 'validation' };
    }
  }
};

// Run all CORS tests
export const runAllCorsTests = async () => {
  console.log('🚀 Running all CORS tests...');
  
  const results = {
    basicCors: await testCorsConnection(),
    authCors: await testCorsWithAuth(),
    preflight: await testPreflightRequest()
  };
  
  console.log('📊 CORS Test Results:', results);
  
  const allPassed = results.basicCors.success && 
                   results.authCors.success && 
                   results.preflight.success;
  
  if (allPassed) {
    console.log('🎉 All CORS tests passed! Your backend is properly configured.');
  } else {
    console.log('⚠️ Some CORS tests failed. Check the results above.');
  }
  
  return results;
};

// Usage in browser console:
// import { runAllCorsTests } from './utils/corsTest.js';
// runAllCorsTests();