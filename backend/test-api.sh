#!/bin/bash

# Labor Connect API Testing Script
# Make sure the server is running on localhost:8080

BASE_URL="http://localhost:8080/api"

echo "🚀 Testing Labor Connect API..."
echo "================================="

# Test 1: Health Check
echo "1. Health Check"
curl -s -X GET http://localhost:8080/ | head -20
echo -e "\n"

# Test 2: User Registration
echo "2. User Registration"
curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "+1234567890",
    "role": "user"
  }' | jq '.'
echo -e "\n"

# Test 3: User Login
echo "3. User Login"
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')

echo $LOGIN_RESPONSE | jq '.'

# Extract token for authenticated requests
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.user.token')
echo "Token: $TOKEN"
echo -e "\n"

# Test 4: Get User Profile (Protected Route)
echo "4. Get User Profile"
curl -s -X GET $BASE_URL/users/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo -e "\n"

# Test 5: Get All Laborers
echo "5. Get All Laborers"
curl -s -X GET $BASE_URL/laborers \
  -H "Content-Type: application/json" | jq '.'
echo -e "\n"

# Test 6: Laborer Registration
echo "6. Laborer Registration"
curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Laborer",
    "email": "laborer@example.com",
    "password": "password123",
    "phone": "+1234567891",
    "role": "laborer"
  }' | jq '.'
echo -e "\n"

# Test 7: Laborer Login
echo "7. Laborer Login"
LABORER_LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "laborer@example.com",
    "password": "password123"
  }')

echo $LABORER_LOGIN_RESPONSE | jq '.'

# Extract laborer token
LABORER_TOKEN=$(echo $LABORER_LOGIN_RESPONSE | jq -r '.user.token')
echo "Laborer Token: $LABORER_TOKEN"
echo -e "\n"

# Test 8: Create Job (as user)
echo "8. Create Job"
curl -s -X POST $BASE_URL/jobs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Job",
    "description": "This is a test job posting",
    "category": "electrician",
    "location": "Test City",
    "budget": 500,
    "contact": {
      "phone": "+1234567890",
      "email": "test@example.com"
    }
  }' | jq '.'
echo -e "\n"

# Test 9: Get All Jobs
echo "9. Get All Jobs"
curl -s -X GET $BASE_URL/jobs \
  -H "Content-Type: application/json" | jq '.'
echo -e "\n"

# Test 10: Send OTP
echo "10. Send OTP"
curl -s -X POST $BASE_URL/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }' | jq '.'
echo -e "\n"

echo "✅ API Testing Complete!"
echo "Note: Some tests may fail if the database is not seeded or if email/SMS services are not configured."