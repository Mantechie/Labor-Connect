// Simple test to check if admin login redirects properly
import fetch from 'node-fetch';

const testAdminLoginRedirect = async () => {
  console.log('🧪 Testing admin login and redirect...\n');
  
  try {
    // Test admin login
    const loginResponse = await fetch('http://localhost:8080/api/admin/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    
    if (loginResponse.ok) {
      console.log('✅ Admin login successful!');
      console.log('Admin:', loginData.admin.name);
      console.log('Role:', loginData.admin.role);
      console.log('Token received:', !!loginData.admin.token);
      
      // Test protected admin route
      console.log('\n🔍 Testing admin dashboard access...');
      const dashboardResponse = await fetch('http://localhost:8080/api/admin/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${loginData.admin.token}`,
          'Content-Type': 'application/json',
        }
      });

      if (dashboardResponse.ok) {
        const adminData = await dashboardResponse.json();
        console.log('✅ Admin dashboard access successful!');
        console.log('Current admin:', adminData.admin.name);
      } else {
        console.log('❌ Admin dashboard access failed:', dashboardResponse.status);
      }
      
    } else {
      console.log('❌ Admin login failed:', loginData.message);
    }
    
  } catch (error) {
    console.log('❌ Test error:', error.message);
  }
};

testAdminLoginRedirect();