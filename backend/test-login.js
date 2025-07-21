import fetch from 'node-fetch';

const API_BASE = 'http://localhost:8080';

// Test regular user login
const testUserLogin = async () => {
  console.log('🔍 Testing regular user login...');
  
  try {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ User login successful!');
      console.log('User:', data.user.name, '- Role:', data.user.role);
      console.log('Token received:', data.user.token ? 'Yes' : 'No');
    } else {
      console.log('❌ User login failed:', data.message);
    }
  } catch (error) {
    console.log('❌ User login error:', error.message);
  }
};

// Test admin login
const testAdminLogin = async () => {
  console.log('\n🔍 Testing admin login...');
  
  try {
    const response = await fetch(`${API_BASE}/api/admin/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Admin login successful!');
      console.log('Admin:', data.admin.name, '- Role:', data.admin.role);
      console.log('Token received:', data.admin.token ? 'Yes' : 'No');
    } else {
      console.log('❌ Admin login failed:', data.message);
    }
  } catch (error) {
    console.log('❌ Admin login error:', error.message);
  }
};

// Test health endpoint
const testHealth = async () => {
  console.log('🔍 Testing server health...');
  
  try {
    const response = await fetch(`${API_BASE}/api/health`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Server is healthy!');
      console.log('Status:', data.status);
    } else {
      console.log('❌ Server health check failed');
    }
  } catch (error) {
    console.log('❌ Server is not running or not accessible:', error.message);
    console.log('Make sure the backend server is running on port 8080');
    return false;
  }
  return true;
};

// Run all tests
const runTests = async () => {
  console.log('🚀 Starting login tests...\n');
  
  const serverRunning = await testHealth();
  if (!serverRunning) {
    console.log('\n❌ Cannot run tests - server is not accessible');
    return;
  }
  
  await testUserLogin();
  await testAdminLogin();
  
  console.log('\n✅ All tests completed!');
  console.log('\nTest credentials:');
  console.log('Regular User: test@example.com / password123');
  console.log('Admin User: admin@example.com / admin123');
};

runTests();