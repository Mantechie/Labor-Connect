import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:8080/api';

// Test admin credentials (you should have these in your database)
const ADMIN_CREDENTIALS = {
  email: 'admin@labourconnect.com',
  password: 'admin123'
};

let adminToken = '';

// Helper function to make authenticated requests
const makeRequest = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(adminToken && { 'Authorization': `Bearer ${adminToken}` }),
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`${response.status}: ${data.message || 'Request failed'}`);
  }

  return data;
};

// Test functions
const testAdminLogin = async () => {
  console.log('\n🔐 Testing Admin Login...');
  try {
    const response = await makeRequest('/admin/login', {
      method: 'POST',
      body: JSON.stringify(ADMIN_CREDENTIALS)
    });
    
    adminToken = response.token;
    console.log('✅ Admin login successful');
    console.log(`📝 Token: ${adminToken.substring(0, 20)}...`);
    return true;
  } catch (error) {
    console.error('❌ Admin login failed:', error.message);
    return false;
  }
};

const testGetAllLaborers = async () => {
  console.log('\n👥 Testing Get All Laborers...');
  try {
    const response = await makeRequest('/admin/laborers?page=1&limit=5');
    console.log('✅ Get laborers successful');
    console.log(`📊 Found ${response.laborers.length} laborers`);
    console.log(`📈 Stats:`, response.stats);
    
    if (response.laborers.length > 0) {
      console.log(`👤 First laborer: ${response.laborers[0].user?.name || 'N/A'}`);
      return response.laborers[0]._id; // Return first laborer ID for further tests
    }
    return null;
  } catch (error) {
    console.error('❌ Get laborers failed:', error.message);
    return null;
  }
};

const testGetLaborerDetails = async (laborerId) => {
  if (!laborerId) {
    console.log('\n⏭️ Skipping laborer details test (no laborer ID)');
    return;
  }

  console.log('\n🔍 Testing Get Laborer Details...');
  try {
    const response = await makeRequest(`/admin/laborers/${laborerId}`);
    console.log('✅ Get laborer details successful');
    console.log(`👤 Laborer: ${response.laborer.user?.name || 'N/A'}`);
    console.log(`📧 Email: ${response.laborer.user?.email || 'N/A'}`);
    console.log(`🔧 Specialization: ${response.laborer.specialization || 'N/A'}`);
    console.log(`⭐ Rating: ${response.laborer.rating || 0}`);
  } catch (error) {
    console.error('❌ Get laborer details failed:', error.message);
  }
};

const testGetSpecializations = async () => {
  console.log('\n🛠️ Testing Get Specializations...');
  try {
    const response = await makeRequest('/admin/laborers/specializations');
    console.log('✅ Get specializations successful');
    console.log(`📋 Specializations: ${response.specializations.join(', ')}`);
  } catch (error) {
    console.error('❌ Get specializations failed:', error.message);
  }
};

const testUpdateLaborerStatus = async (laborerId) => {
  if (!laborerId) {
    console.log('\n⏭️ Skipping status update test (no laborer ID)');
    return;
  }

  console.log('\n🔄 Testing Update Laborer Status...');
  try {
    const response = await makeRequest(`/admin/laborers/${laborerId}/status`, {
      method: 'PUT',
      body: JSON.stringify({
        status: 'active',
        reason: 'Test status update'
      })
    });
    console.log('✅ Update laborer status successful');
    console.log(`📝 Message: ${response.message}`);
  } catch (error) {
    console.error('❌ Update laborer status failed:', error.message);
  }
};

const testUpdateLaborerVerification = async (laborerId) => {
  if (!laborerId) {
    console.log('\n⏭️ Skipping verification update test (no laborer ID)');
    return;
  }

  console.log('\n✅ Testing Update Laborer Verification...');
  try {
    const response = await makeRequest(`/admin/laborers/${laborerId}/verify`, {
      method: 'PUT',
      body: JSON.stringify({
        isVerified: true,
        reason: 'Test verification'
      })
    });
    console.log('✅ Update laborer verification successful');
    console.log(`📝 Message: ${response.message}`);
  } catch (error) {
    console.error('❌ Update laborer verification failed:', error.message);
  }
};

const testSendNotification = async () => {
  console.log('\n📢 Testing Send Notification...');
  try {
    const response = await makeRequest('/admin/laborers/notify', {
      method: 'POST',
      body: JSON.stringify({
        subject: 'Test Notification',
        message: 'This is a test notification from the admin panel.',
        type: 'general'
        // Note: Not specifying laborerIds means it will send to all laborers
      })
    });
    console.log('✅ Send notification successful');
    console.log(`📊 Sent to ${response.successCount} laborers`);
    if (response.failedCount > 0) {
      console.log(`⚠️ Failed to send to ${response.failedCount} laborers`);
    }
  } catch (error) {
    console.error('❌ Send notification failed:', error.message);
  }
};

const testSendWarning = async (laborerId) => {
  if (!laborerId) {
    console.log('\n⏭️ Skipping warning test (no laborer ID)');
    return;
  }

  console.log('\n⚠️ Testing Send Warning...');
  try {
    const response = await makeRequest(`/admin/laborers/${laborerId}/warning`, {
      method: 'POST',
      body: JSON.stringify({
        reason: 'Poor Service Quality',
        details: 'This is a test warning for demonstration purposes.'
      })
    });
    console.log('✅ Send warning successful');
    console.log(`📝 Message: ${response.message}`);
  } catch (error) {
    console.error('❌ Send warning failed:', error.message);
  }
};

const testExportData = async () => {
  console.log('\n📊 Testing Export Data...');
  try {
    const response = await fetch(`${BASE_URL}/admin/laborers/export?format=json`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`${response.status}: Export failed`);
    }
    
    const data = await response.text();
    console.log('✅ Export data successful');
    console.log(`📄 Data length: ${data.length} characters`);
  } catch (error) {
    console.error('❌ Export data failed:', error.message);
  }
};

// Main test runner
const runTests = async () => {
  console.log('🧪 Starting Laborer Management API Tests...');
  console.log('=' .repeat(50));

  // Login first
  const loginSuccess = await testAdminLogin();
  if (!loginSuccess) {
    console.log('\n❌ Cannot proceed without admin authentication');
    return;
  }

  // Run all tests
  const laborerId = await testGetAllLaborers();
  await testGetLaborerDetails(laborerId);
  await testGetSpecializations();
  await testUpdateLaborerStatus(laborerId);
  await testUpdateLaborerVerification(laborerId);
  await testSendNotification();
  await testSendWarning(laborerId);
  await testExportData();

  console.log('\n' + '=' .repeat(50));
  console.log('🎉 All tests completed!');
  console.log('\n💡 Tips:');
  console.log('- Make sure you have at least one laborer in your database');
  console.log('- Check the admin email/password in the test file');
  console.log('- Some tests may show warnings if email/SMS is not configured');
  console.log('- Check the server logs for detailed information');
};

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export default runTests;