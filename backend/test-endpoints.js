import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:8080/api';

// Test endpoints
const testEndpoints = async () => {
  console.log('🧪 Testing API Endpoints...\n');

  // Test health endpoint
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    console.log('✅ Health Check:', data.status);
  } catch (error) {
    console.log('❌ Health Check Failed:', error.message);
  }

  // Test auth endpoints (without authentication)
  const authEndpoints = [
    { method: 'POST', path: '/auth/register', description: 'Register endpoint' },
    { method: 'POST', path: '/auth/login', description: 'Login endpoint' },
    { method: 'POST', path: '/auth/send-otp', description: 'Send OTP endpoint' },
  ];

  for (const endpoint of authEndpoints) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint.path}`, {
        method: endpoint.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) // Empty body to test endpoint existence
      });
      
      if (response.status === 400 || response.status === 422) {
        console.log(`✅ ${endpoint.description}: Endpoint exists (validation error expected)`);
      } else {
        console.log(`⚠️  ${endpoint.description}: Status ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.description}: ${error.message}`);
    }
  }

  // Test public endpoints
  const publicEndpoints = [
    { method: 'GET', path: '/jobs', description: 'Get all jobs' },
    { method: 'GET', path: '/laborers/browse', description: 'Browse laborers' },
    { method: 'GET', path: '/categories', description: 'Get categories' },
  ];

  for (const endpoint of publicEndpoints) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint.path}`, {
        method: endpoint.method,
      });
      
      if (response.ok) {
        console.log(`✅ ${endpoint.description}: Working`);
      } else {
        console.log(`⚠️  ${endpoint.description}: Status ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.description}: ${error.message}`);
    }
  }

  console.log('\n🏁 Endpoint testing completed!');
};

testEndpoints();