import fetch from 'node-fetch'

const BASE_URL = 'http://localhost:8080/api'

// Test data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  role: 'user'
}

const testLaborer = {
  name: 'Test Laborer',
  email: 'laborer@example.com',
  password: 'password123',
  role: 'laborer'
}

// Test functions
async function testHealthCheck() {
  try {
    const response = await fetch('http://localhost:8080/')
    console.log('✅ Health check:', response.status)
  } catch (error) {
    console.log('❌ Health check failed:', error.message)
  }
}

async function testRegistration() {
  try {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    })
    
    const data = await response.json()
    console.log('✅ Registration test:', response.status, data.message)
    return data.user?.token
  } catch (error) {
    console.log('❌ Registration failed:', error.message)
  }
}

async function testLogin() {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
    })
    
    const data = await response.json()
    console.log('✅ Login test:', response.status, data.message)
    return data.user?.token
  } catch (error) {
    console.log('❌ Login failed:', error.message)
  }
}

async function testGetJobs(token) {
  try {
    const response = await fetch(`${BASE_URL}/jobs`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    
    const data = await response.json()
    console.log('✅ Get jobs test:', response.status, `Found ${data.jobs?.length || 0} jobs`)
  } catch (error) {
    console.log('❌ Get jobs failed:', error.message)
  }
}

async function testPostJob(token) {
  try {
    const jobData = {
      title: 'Test Job',
      description: 'This is a test job for plumbing work',
      category: 'plumber',
      location: 'Mumbai, Maharashtra',
      budget: 5000,
      contact: {
        phone: '1234567890',
        email: 'client@example.com'
      }
    }
    
    const response = await fetch(`${BASE_URL}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(jobData),
    })
    
    const data = await response.json()
    console.log('✅ Post job test:', response.status, data.message)
  } catch (error) {
    console.log('❌ Post job failed:', error.message)
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting API tests...\n')
  
  await testHealthCheck()
  
  console.log('\n--- Authentication Tests ---')
  const token = await testRegistration()
  await testLogin()
  
  if (token) {
    console.log('\n--- Job Tests ---')
    await testGetJobs(token)
    await testPostJob(token)
  }
  
  console.log('\n✅ All tests completed!')
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests()
}

export { runTests } 