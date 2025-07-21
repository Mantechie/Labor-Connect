# CORS Configuration Guide

## Overview
This backend has been configured with comprehensive CORS (Cross-Origin Resource Sharing) support to handle requests from your frontend applications.

## Current Configuration

### 1. CORS Middleware
- **Package**: `cors@^2.8.5` (already installed)
- **Location**: `server.js` lines 44-70
- **Features**:
  - Dynamic origin validation
  - Credentials support
  - Preflight request handling
  - Security headers
  - Debug logging (development mode)

### 2. Allowed Origins
Configure in `.env` file:
```env
CORS_ORIGIN=http://localhost:5173,http://localhost:3000,http://localhost:5174
```

**Default Development Origins**:
- `http://localhost:5173` (Vite default)
- `http://localhost:3000` (React/Next.js default)
- `http://localhost:5174` (Alternative Vite port)

### 3. Supported Methods
- GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD

### 4. Allowed Headers
- Origin
- X-Requested-With
- Content-Type
- Accept
- Authorization
- Cache-Control
- X-HTTP-Method-Override
- X-Forwarded-For
- X-Real-IP

## Frontend Integration

### Using Fetch API
```javascript
// For authenticated requests
fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Important for cookies/sessions
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
})
.then(response => response.json())
.then(data => console.log(data));

// For requests with JWT token
fetch('http://localhost:8080/api/users/profile', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  credentials: 'include'
})
.then(response => response.json())
.then(data => console.log(data));
```

### Using Axios
```javascript
import axios from 'axios';

// Configure axios globally
axios.defaults.baseURL = 'http://localhost:8080/api';
axios.defaults.withCredentials = true;

// For individual requests
const response = await axios.post('/auth/login', {
  email: 'user@example.com',
  password: 'password123'
}, {
  withCredentials: true
});

// With JWT token
const profileResponse = await axios.get('/users/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  },
  withCredentials: true
});
```

### React/Vue.js Setup
```javascript
// In your API service file
const API_BASE_URL = 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

## Testing CORS Configuration

### 1. Run CORS Test Script
```bash
cd backend
node test-cors.js
```

### 2. Manual Testing
```bash
# Test preflight request
curl -X OPTIONS http://localhost:8080/api/health \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -v

# Test actual request
curl -X GET http://localhost:8080/api/health \
  -H "Origin: http://localhost:5173" \
  -H "Content-Type: application/json" \
  -v
```

## Production Configuration

### 1. Update Environment Variables
```env
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

### 2. Security Considerations
- Remove debug logging in production
- Use HTTPS origins only
- Implement rate limiting
- Add additional security headers

### 3. Additional Security Headers
The backend automatically adds:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Access-Control-Allow-Credentials: true`

## Troubleshooting

### Common Issues

1. **CORS Error: "Access to fetch blocked by CORS policy"**
   - Check if your frontend origin is in `CORS_ORIGIN`
   - Ensure `credentials: 'include'` is set in frontend requests
   - Verify the backend server is running

2. **Preflight Request Failing**
   - Check if OPTIONS method is allowed
   - Verify all required headers are in `allowedHeaders`
   - Check browser developer tools for specific error

3. **Credentials Not Working**
   - Ensure `withCredentials: true` (axios) or `credentials: 'include'` (fetch)
   - Verify `Access-Control-Allow-Credentials: true` header is present
   - Check if cookies are being set correctly

### Debug Mode
In development, the server logs all CORS requests:
```
🌐 CORS Request: POST /api/auth/login from origin: http://localhost:5173
```

### Browser Developer Tools
Check the Network tab for:
- Preflight OPTIONS requests
- Response headers
- CORS error messages in console

## Files Modified/Created

1. **server.js** - Enhanced CORS configuration
2. **config/env.js** - Multiple origins support
3. **.env** - CORS_ORIGIN configuration
4. **middlewares/corsMiddleware.js** - Custom CORS utilities
5. **test-cors.js** - CORS testing script
6. **CORS_SETUP.md** - This documentation

## Support

If you encounter CORS issues:
1. Check the browser console for specific error messages
2. Run the CORS test script
3. Verify your frontend configuration matches the examples above
4. Ensure the backend server is running on the correct port (8080)