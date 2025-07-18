# Labor Connect API Documentation

## Base URL
```
http://localhost:8080/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format
All responses follow this structure:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...}
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Register a new user (user, laborer, or admin).

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
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
**POST** `/auth/login`

Authenticate user and get JWT token.

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
**POST** `/auth/send-otp`

Send OTP to user's email for verification.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "message": "OTP sent to your email"
}
```

### Verify OTP
**POST** `/auth/verify-otp`

Verify the OTP sent to user's email.

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "message": "OTP verified successfully"
}
```

---

## User Endpoints

### Get User Profile
**GET** `/users/profile`
🔒 **Requires Authentication**

Get the logged-in user's profile.

**Response:**
```json
{
  "id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": "123 Main St",
  "role": "user",
  "isApproved": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Update User Profile
**PUT** `/users/profile`
🔒 **Requires Authentication**

Update the logged-in user's profile.

**Request Body:**
```json
{
  "name": "John Smith",
  "phone": "+1234567891",
  "address": "456 Oak Ave"
}
```

### Toggle Availability
**PATCH** `/users/availability`
🔒 **Requires Authentication** (Laborers only)

Toggle laborer's availability status.

**Response:**
```json
{
  "message": "Availability updated",
  "isAvailable": true
}
```

### Upload Portfolio
**POST** `/users/portfolio`
🔒 **Requires Authentication** (Laborers only)

Upload portfolio images/documents.

**Request:** Multipart form data with files

**Response:**
```json
{
  "message": "Portfolio uploaded successfully",
  "urls": ["url1", "url2"]
}
```

### Get All Laborers
**GET** `/users/laborers`

Get list of all approved laborers.

**Query Parameters:**
- `specialization` (optional): Filter by specialization
- `location` (optional): Filter by location
- `rating` (optional): Minimum rating

**Response:**
```json
[
  {
    "id": "laborer_id",
    "name": "Ramesh Kumar",
    "email": "ramesh@example.com",
    "specialization": "electrician",
    "experience": 8,
    "rating": 4.8,
    "numReviews": 25,
    "isAvailable": true,
    "photos": ["url1", "url2"]
  }
]
```

---

## Job Endpoints

### Get All Jobs
**GET** `/jobs`

Get list of all jobs.

**Query Parameters:**
- `category` (optional): Filter by job category
- `location` (optional): Filter by location
- `status` (optional): Filter by status
- `budget_min` (optional): Minimum budget
- `budget_max` (optional): Maximum budget

**Response:**
```json
[
  {
    "id": "job_id",
    "title": "Electrical Wiring",
    "description": "Need electrical work done",
    "category": "electrician",
    "location": "New York, NY",
    "budget": 2500,
    "status": "open",
    "postedBy": {
      "id": "user_id",
      "name": "John Doe"
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Create Job
**POST** `/jobs`
🔒 **Requires Authentication**

Create a new job posting.

**Request Body:**
```json
{
  "title": "Kitchen Plumbing Repair",
  "description": "Need plumbing repair in kitchen",
  "category": "plumber",
  "location": "Los Angeles, CA",
  "budget": 800,
  "contact": {
    "phone": "+1234567890",
    "email": "john@example.com"
  },
  "scheduledDate": "2024-01-15T10:00:00.000Z"
}
```

**Response:**
```json
{
  "message": "Job created successfully",
  "job": {
    "id": "job_id",
    "title": "Kitchen Plumbing Repair",
    "description": "Need plumbing repair in kitchen",
    "category": "plumber",
    "location": "Los Angeles, CA",
    "budget": 800,
    "status": "open",
    "postedBy": "user_id",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get Job by ID
**GET** `/jobs/:id`

Get details of a specific job.

**Response:**
```json
{
  "id": "job_id",
  "title": "Kitchen Plumbing Repair",
  "description": "Need plumbing repair in kitchen",
  "category": "plumber",
  "location": "Los Angeles, CA",
  "budget": 800,
  "status": "open",
  "postedBy": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "assignedLaborer": null,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Update Job
**PUT** `/jobs/:id`
🔒 **Requires Authentication** (Job owner only)

Update job details.

**Request Body:**
```json
{
  "title": "Updated Job Title",
  "description": "Updated description",
  "budget": 1000,
  "status": "in progress"
}
```

### Delete Job
**DELETE** `/jobs/:id`
🔒 **Requires Authentication** (Job owner only)

Delete a job posting.

**Response:**
```json
{
  "message": "Job deleted successfully"
}
```

---

## Laborer Endpoints

### Get All Laborers
**GET** `/laborers`

Get list of all approved laborers with detailed profiles.

**Query Parameters:**
- `specialization` (optional): Filter by specialization
- `experience_min` (optional): Minimum years of experience
- `rating_min` (optional): Minimum rating
- `available` (optional): Filter by availability (true/false)

**Response:**
```json
[
  {
    "id": "laborer_id",
    "user": {
      "id": "user_id",
      "name": "Ramesh Kumar",
      "email": "ramesh@example.com",
      "phone": "+1234567890",
      "address": "123 Main St"
    },
    "specialization": "electrician",
    "experience": 8,
    "documents": ["cert_url1", "cert_url2"],
    "photos": ["work_url1", "work_url2"],
    "videos": ["video_url1"],
    "socialLinks": {
      "facebook": "facebook_url",
      "instagram": "instagram_url"
    },
    "isAvailable": true,
    "isApproved": true,
    "rating": 4.8,
    "numReviews": 25
  }
]
```

### Create Laborer Profile
**POST** `/laborers`
🔒 **Requires Authentication** (Laborer role only)

Create a detailed laborer profile.

**Request Body:**
```json
{
  "specialization": "electrician",
  "experience": 8,
  "documents": ["cert_url1"],
  "photos": ["work_url1", "work_url2"],
  "socialLinks": {
    "facebook": "facebook_url",
    "instagram": "instagram_url"
  }
}
```

### Get Laborer by ID
**GET** `/laborers/:id`

Get detailed laborer profile by ID.

**Response:**
```json
{
  "id": "laborer_id",
  "user": {
    "id": "user_id",
    "name": "Ramesh Kumar",
    "email": "ramesh@example.com",
    "phone": "+1234567890"
  },
  "specialization": "electrician",
  "experience": 8,
  "rating": 4.8,
  "numReviews": 25,
  "reviews": [
    {
      "id": "review_id",
      "rating": 5,
      "comment": "Excellent work!",
      "user": {
        "name": "John Doe"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Update Laborer Profile
**PUT** `/laborers/:id`
🔒 **Requires Authentication** (Profile owner only)

Update laborer profile details.

**Request Body:**
```json
{
  "experience": 10,
  "specialization": "electrician",
  "photos": ["new_work_url1"]
}
```

### Delete Laborer Profile
**DELETE** `/laborers/:id`
🔒 **Requires Authentication** (Profile owner or admin only)

Delete laborer profile.

**Response:**
```json
{
  "message": "Laborer profile deleted successfully"
}
```

---

## Review Endpoints

### Get All Reviews
**GET** `/reviews`

Get list of all reviews.

**Query Parameters:**
- `laborer` (optional): Filter by laborer ID
- `user` (optional): Filter by user ID
- `rating_min` (optional): Minimum rating

**Response:**
```json
[
  {
    "id": "review_id",
    "rating": 5,
    "comment": "Excellent work! Very professional.",
    "user": {
      "id": "user_id",
      "name": "John Doe"
    },
    "laborer": {
      "id": "laborer_id",
      "name": "Ramesh Kumar"
    },
    "job": {
      "id": "job_id",
      "title": "Electrical Wiring"
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Create Review
**POST** `/reviews`
🔒 **Requires Authentication**

Create a review for a laborer.

**Request Body:**
```json
{
  "laborer": "laborer_id",
  "job": "job_id",
  "rating": 5,
  "comment": "Excellent work! Very professional and on time."
}
```

**Response:**
```json
{
  "message": "Review created successfully",
  "review": {
    "id": "review_id",
    "rating": 5,
    "comment": "Excellent work! Very professional and on time.",
    "user": "user_id",
    "laborer": "laborer_id",
    "job": "job_id",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get Review by ID
**GET** `/reviews/:id`

Get details of a specific review.

### Update Review
**PUT** `/reviews/:id`
🔒 **Requires Authentication** (Review author only)

Update review details.

**Request Body:**
```json
{
  "rating": 4,
  "comment": "Updated review comment"
}
```

### Delete Review
**DELETE** `/reviews/:id`
🔒 **Requires Authentication** (Review author or admin only)

Delete a review.

**Response:**
```json
{
  "message": "Review deleted successfully"
}
```

---

## Chat Endpoints

### Get All Chats
**GET** `/chats`
🔒 **Requires Authentication**

Get list of all chats for the authenticated user.

**Response:**
```json
[
  {
    "id": "chat_id",
    "participants": [
      {
        "id": "user_id",
        "name": "John Doe",
        "role": "user"
      },
      {
        "id": "laborer_id",
        "name": "Ramesh Kumar",
        "role": "laborer"
      }
    ],
    "lastMessage": {
      "content": "When can you start the work?",
      "sender": "user_id",
      "timestamp": "2024-01-01T00:00:00.000Z"
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Create Chat
**POST** `/chats`
🔒 **Requires Authentication**

Create a new chat between user and laborer.

**Request Body:**
```json
{
  "participant": "laborer_id",
  "initialMessage": "Hi, I'm interested in your services"
}
```

### Get Chat by ID
**GET** `/chats/:id`
🔒 **Requires Authentication**

Get chat details with message history.

**Response:**
```json
{
  "id": "chat_id",
  "participants": [
    {
      "id": "user_id",
      "name": "John Doe"
    },
    {
      "id": "laborer_id",
      "name": "Ramesh Kumar"
    }
  ],
  "messages": [
    {
      "id": "message_id",
      "content": "Hi, I'm interested in your services",
      "sender": {
        "id": "user_id",
        "name": "John Doe"
      },
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Send Message
**POST** `/chats/:id/messages`
🔒 **Requires Authentication**

Send a message in a chat.

**Request Body:**
```json
{
  "content": "When can you start the work?",
  "type": "text"
}
```

**Response:**
```json
{
  "message": "Message sent successfully",
  "messageData": {
    "id": "message_id",
    "content": "When can you start the work?",
    "sender": "user_id",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Admin Endpoints

### Get All Users
**GET** `/admin/users`
🔒 **Requires Authentication** (Admin only)

Get list of all users.

**Response:**
```json
[
  {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isApproved": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get All Laborers (Admin)
**GET** `/admin/laborers`
🔒 **Requires Authentication** (Admin only)

Get list of all laborers including pending approvals.

**Response:**
```json
[
  {
    "id": "laborer_id",
    "name": "Ramesh Kumar",
    "email": "ramesh@example.com",
    "specialization": "electrician",
    "isApproved": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Approve User
**PUT** `/admin/users/:id/approve`
🔒 **Requires Authentication** (Admin only)

Approve or reject a user.

**Request Body:**
```json
{
  "isApproved": true
}
```

### Approve Laborer
**PUT** `/admin/laborers/:id/approve`
🔒 **Requires Authentication** (Admin only)

Approve or reject a laborer.

**Request Body:**
```json
{
  "isApproved": true
}
```

### Delete User
**DELETE** `/admin/users/:id`
🔒 **Requires Authentication** (Admin only)

Delete a user account.

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error |

---

## Rate Limiting

API requests are limited to:
- 100 requests per hour for unauthenticated users
- 1000 requests per hour for authenticated users
- 5000 requests per hour for admin users

---

## File Upload

File uploads are supported for:
- Profile pictures (max 5MB)
- Portfolio images (max 10MB each)
- Documents (max 20MB each)

Supported formats:
- Images: JPEG, PNG, GIF
- Documents: PDF, DOC, DOCX

Upload endpoints accept multipart/form-data with file fields.