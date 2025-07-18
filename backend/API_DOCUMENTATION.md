# Labor Connect API Documentation

## Base URL
```
http://localhost:8080/api
```

## Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user" // "user", "laborer", or "admin"
}
```

**Response:**
```json
{
  "message": "Registration successful",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "token": "jwt_token_here"
  }
}
```

### Login User
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "token": "jwt_token_here"
  }
}
```

### Send OTP
```http
POST /auth/send-otp
```

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

### Verify OTP
```http
POST /auth/verify-otp
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

---

## 👤 User Endpoints

### Get User Profile
```http
GET /users/profile
```
*Requires authentication*

### Update User Profile
```http
PUT /users/profile
```
*Requires authentication*

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "+1234567890",
  "address": "123 Main St, City"
}
```

### Toggle Availability (Laborers)
```http
PATCH /users/availability
```
*Requires authentication (laborer role)*

### Upload Portfolio
```http
POST /users/portfolio
```
*Requires authentication (laborer role)*
*Multipart form data*

---

## 🔨 Laborer Endpoints

### Get Laborer Dashboard
```http
GET /laborers/dashboard
```
*Requires authentication (laborer role)*

**Response:**
```json
{
  "laborer": {
    "id": "laborer_id",
    "name": "John Doe",
    "specialization": "plumber",
    "rating": 4.5,
    "isAvailable": true
  },
  "assignedJobs": [...],
  "stats": {
    "totalJobs": 10,
    "completedJobs": 8,
    "pendingJobs": 2
  }
}
```

### Update Specialization
```http
PUT /laborers/specialization
```
*Requires authentication (laborer role)*

**Request Body:**
```json
{
  "specialization": "electrician"
}
```

### Upload Work Media
```http
POST /laborers/media
```
*Requires authentication (laborer role)*
*Multipart form data*

### Update Availability
```http
PATCH /laborers/availability
```
*Requires authentication (laborer role)*

**Request Body:**
```json
{
  "isAvailable": false
}
```

### Get Assigned Jobs
```http
GET /laborers/jobs
```
*Requires authentication (laborer role)*

---

## 💼 Job Endpoints

### Post New Job
```http
POST /jobs
```
*Requires authentication*

**Request Body:**
```json
{
  "title": "Fix bathroom plumbing",
  "description": "Need to fix leaking faucet and clogged drain",
  "category": "plumber",
  "location": "Mumbai, Maharashtra",
  "budget": 5000,
  "contact": {
    "phone": "+1234567890",
    "email": "client@example.com"
  }
}
```

### Get All Jobs (with advanced filtering)
```http
GET /jobs?category=plumber&location=mumbai&minBudget=1000&maxBudget=10000&page=1&limit=10
```

**Query Parameters:**
- `category`: Job category (plumber, electrician, mason, carpenter, painter, welder, other)
- `location`: Location search (case-insensitive)
- `minBudget`: Minimum budget
- `maxBudget`: Maximum budget
- `status`: Job status (open, in progress, completed, cancelled)
- `search`: Search in title and description
- `sortBy`: Sort field (createdAt, budget, title)
- `sortOrder`: Sort order (asc, desc)
- `page`: Page number
- `limit`: Items per page

**Response:**
```json
{
  "jobs": [...],
  "page": 1,
  "totalPages": 5,
  "total": 50,
  "filters": {
    "applied": {...},
    "available": {
      "categories": ["plumber", "electrician", ...],
      "statuses": ["open", "in progress", ...]
    }
  }
}
```

### Get Job by ID
```http
GET /jobs/:id
```
*Requires authentication*

### Delete Job
```http
DELETE /jobs/:id
```
*Requires authentication (job owner or admin)*

---

## ⭐ Review Endpoints

### Create Review
```http
POST /reviews
```
*Requires authentication*

**Request Body:**
```json
{
  "laborerId": "laborer_id",
  "rating": 5,
  "comment": "Excellent work, very professional!"
}
```

### Get Reviews
```http
GET /reviews?laborerId=laborer_id&page=1&limit=10
```

### Update Review
```http
PUT /reviews/:id
```
*Requires authentication (review owner)*

### Delete Review
```http
DELETE /reviews/:id
```
*Requires authentication (review owner or admin)*

---

## 💬 Chat Endpoints

### Get User Chats
```http
GET /chats
```
*Requires authentication*

### Create New Chat
```http
POST /chats
```
*Requires authentication*

**Request Body:**
```json
{
  "participantId": "user_id"
}
```

### Get Chat Messages
```http
GET /chats/:id/messages
```
*Requires authentication*

### Send Message
```http
POST /chats/:id/messages
```
*Requires authentication*

**Request Body:**
```json
{
  "content": "Hello, are you available for the job?",
  "messageType": "text" // "text", "image", "file"
}
```

---

## 🔧 Admin Endpoints

### Get All Users
```http
GET /admin/users
```
*Requires authentication (admin role)*

### Get All Laborers
```http
GET /admin/laborers
```
*Requires authentication (admin role)*

### Approve Laborer
```http
PUT /admin/laborers/:id/approve
```
*Requires authentication (admin role)*

### Delete User
```http
DELETE /admin/users/:id
```
*Requires authentication (admin role)*

### Get All Jobs
```http
GET /admin/jobs
```
*Requires authentication (admin role)*

### Get All Chats
```http
GET /admin/chats
```
*Requires authentication (admin role)*

### Get All Reviews
```http
GET /admin/reviews
```
*Requires authentication (admin role)*

### Get Analytics
```http
GET /admin/analytics
```
*Requires authentication (admin role)*

**Response:**
```json
{
  "overview": {
    "totalUsers": 150,
    "totalJobs": 75,
    "totalLaborers": 50,
    "totalRevenue": 250000
  },
  "jobs": {
    "open": 20,
    "completed": 45,
    "inProgress": 10,
    "completionRate": 73
  },
  "laborers": {
    "total": 50,
    "available": 35,
    "approved": 40,
    "approvalRate": 80
  },
  "categories": [...],
  "trends": {...},
  "topPerformers": {...},
  "recentActivity": {...}
}
```

---

## 🔌 WebSocket Events

### Connection
```javascript
const socket = io('http://localhost:8080', {
  auth: {
    token: 'your-jwt-token'
  }
})
```

### Join Chat Room
```javascript
socket.emit('join-chat', 'chat_id')
```

### Leave Chat Room
```javascript
socket.emit('leave-chat', 'chat_id')
```

### Send Message
```javascript
socket.emit('send-message', {
  chatId: 'chat_id',
  content: 'Hello!',
  messageType: 'text'
})
```

### Typing Indicators
```javascript
socket.emit('typing-start', 'chat_id')
socket.emit('typing-stop', 'chat_id')
```

### Set Online Status
```javascript
socket.emit('set-online')
```

### Listen for Events
```javascript
// New message
socket.on('new-message', (data) => {
  console.log('New message:', data.message)
})

// User typing
socket.on('user-typing', (data) => {
  console.log(`${data.userName} is typing...`)
})

// User online/offline
socket.on('user-online', (data) => {
  console.log(`${data.userName} is online`)
})

// Notifications
socket.on('notification', (notification) => {
  console.log('New notification:', notification)
})
```

---

## 📊 Error Responses

### 400 Bad Request
```json
{
  "message": "Invalid email or password"
}
```

### 401 Unauthorized
```json
{
  "message": "Not authorized, no token"
}
```

### 403 Forbidden
```json
{
  "message": "Not authorized as admin"
}
```

### 404 Not Found
```json
{
  "message": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Server error",
  "error": "Error details"
}
```

---

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file with:
   ```env
   PORT=8080
   MONGO_URI=mongodb://localhost:27017/labor-connect
   JWT_SECRET=your-secret-key
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

3. **Start the server:**
   ```bash
   npm run dev
   ```

4. **Test the API:**
   ```bash
   npm test
   ```

---

## 📝 Notes

- All timestamps are in ISO 8601 format
- File uploads support images, documents, and videos
- Real-time features require WebSocket connection
- Admin endpoints require admin role
- Laborer endpoints require laborer role
- All responses include appropriate HTTP status codes 