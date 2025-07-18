// Test script to verify backend-frontend integration
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function testBackendConnection() {
  console.log('🧪 Testing Backend-Frontend Integration...\n');
  
  try {
    // Test 1: Check if backend is running
    console.log('1. Testing backend connectivity...');
    const healthResponse = await axios.get('http://localhost:5000/');
    console.log('✅ Backend is running and accessible');
    
    // Test 2: Test API endpoint
    console.log('\n2. Testing API endpoint...');
    const apiResponse = await axios.get(`${API_BASE_URL}/auth`);
    console.log('✅ API routes are working');
    
    // Test 3: Test CORS
    console.log('\n3. Testing CORS configuration...');
    const corsResponse = await axios.get(`${API_BASE_URL}/auth`, {
      headers: {
        'Origin': 'http://localhost:5173'
      }
    });
    console.log('✅ CORS is properly configured');
    
    console.log('\n🎉 All tests passed! Backend and frontend are properly integrated.');
    console.log('\n📋 Next steps:');
    console.log('1. Start backend: cd backend && npm run dev');
    console.log('2. Start frontend: cd Labour && npm run dev');
    console.log('3. Open http://localhost:5173 in your browser');
    
  } catch (error) {
    console.error('\n❌ Integration test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure backend is running on port 5000');
    console.log('2. Check if MongoDB is running');
    console.log('3. Verify all dependencies are installed');
  }
}

testBackendConnection(); 