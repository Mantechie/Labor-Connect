import fetch from 'node-fetch';
import config from './config/env.js';

/**
 * Test CORS configuration
 */
const testCORS = async () => {
  const baseURL = `http://localhost:${config.PORT}`;
  const testOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5174',
    'https://example.com' // This should fail
  ];

  console.log('🧪 Testing CORS Configuration...\n');

  for (const origin of testOrigins) {
    console.log(`Testing origin: ${origin}`);
    
    try {
      // Test preflight request
      const preflightResponse = await fetch(`${baseURL}/api/health`, {
        method: 'OPTIONS',
        headers: {
          'Origin': origin,
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type, Authorization'
        }
      });

      console.log(`  Preflight Status: ${preflightResponse.status}`);
      console.log(`  Allow-Origin: ${preflightResponse.headers.get('access-control-allow-origin')}`);
      console.log(`  Allow-Credentials: ${preflightResponse.headers.get('access-control-allow-credentials')}`);
      console.log(`  Allow-Methods: ${preflightResponse.headers.get('access-control-allow-methods')}`);

      // Test actual request
      const actualResponse = await fetch(`${baseURL}/api/health`, {
        method: 'GET',
        headers: {
          'Origin': origin,
          'Content-Type': 'application/json'
        }
      });

      console.log(`  Actual Request Status: ${actualResponse.status}`);
      console.log(`  Response Allow-Origin: ${actualResponse.headers.get('access-control-allow-origin')}`);
      console.log(`  Response Allow-Credentials: ${actualResponse.headers.get('access-control-allow-credentials')}`);
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }

  console.log('✅ CORS testing completed!');
  console.log('\n📋 Frontend Integration Guide:');
  console.log('For fetch requests, use:');
  console.log(`
fetch('${baseURL}/api/endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token'
  },
  credentials: 'include', // Important for cookies/auth
  body: JSON.stringify(data)
});
  `);

  console.log('For axios requests, use:');
  console.log(`
axios.defaults.withCredentials = true;
// or for individual requests:
axios.post('${baseURL}/api/endpoint', data, {
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token'
  }
});
  `);
};

// Run the test
testCORS().catch(console.error);