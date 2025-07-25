import axios from 'axios';

const baseURL = 'http://localhost:8080/api/admin/auth'; // Corrected route prefix to match backend

const testAdminAuthController = async () => {
  try {
    console.log('Starting tests for adminAuthController...');

    // 1. Test admin registration
    const registerResponse = await axios.post(`${baseURL}/register`, {
      name: 'Test Admin',
      email: 'testadmin@example.com',
      password: 'TestPass123!',
      phone: '1234567890',
      role: 'admin',
      department: 'general',
      permissions: ['manage_users']
    });
    console.log('Register Admin:', registerResponse.data);

    // 2. Test admin login
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'testadmin@example.com',
      password: 'TestPass123!'
    });
    console.log('Admin Login:', loginResponse.data);

    const token = loginResponse.data.admin.token;
    const refreshToken = loginResponse.data.admin.refreshToken;

    // 3. Test send OTP
    const sendOtpResponse = await axios.post(`${baseURL}/send-otp`, {
      email: 'testadmin@example.com'
    });
    console.log('Send OTP:', sendOtpResponse.data);

    // 4. Test verify OTP - This requires manual OTP input or mocking, so skipping here

    // 5. Test refresh token
    const refreshResponse = await axios.post(`${baseURL}/refresh`, {
      refreshToken
    });
    console.log('Refresh Token:', refreshResponse.data);

    // 6. Test get current admin
    const meResponse = await axios.get(`${baseURL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Get Current Admin:', meResponse.data);

    // 7. Test update profile with OTP generation
    const updateProfileResponse1 = await axios.put(`${baseURL}/auth/profile`, {
      name: 'Updated Admin',
      email: 'testadmin@example.com',
      phone: '1234567890',
      department: 'general',
      role: 'admin'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Update Profile (OTP generation):', updateProfileResponse1.data);

    // 8. Test change password with OTP generation
    const changePasswordResponse1 = await axios.put(`${baseURL}/auth/change-password`, {
      currentPassword: 'TestPass123!',
      newPassword: 'NewPass123!',
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Change Password (OTP generation):', changePasswordResponse1.data);

    // 9. Test upload profile picture - Skipping actual file upload in this test

    // 10. Test get admin collaborators
    const collaboratorsResponse = await axios.get(`${baseURL}/auth/collaborators`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Get Admin Collaborators:', collaboratorsResponse.data);

    // 11. Test add admin collaborator (super admin only) - Skipping due to role restrictions

    // 12. Test remove admin collaborator (super admin only) - Skipping due to role restrictions

    // 13. Test logout
    const logoutResponse = await axios.post(`${baseURL}/auth/logout`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Logout:', logoutResponse.data);

    console.log('Extended tests completed successfully.');
  } catch (error) {
    if (error.response) {
      console.error('Error response:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
};

testAdminAuthController();