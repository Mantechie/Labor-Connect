# Labor Connect Backend

A comprehensive backend API for the Labor Connect platform that connects users with skilled laborers.

## Features

- **User Authentication**: JWT-based authentication with OTP verification
- **Role-based Access**: Support for users, laborers, and admins
- **Job Management**: Create, update, and manage job postings
- **Laborer Profiles**: Detailed laborer profiles with portfolios
- **Review System**: Rating and review system for laborers
- **Chat System**: Real-time messaging between users and laborers
- **Admin Dashboard**: Admin controls for user and laborer management
- **File Uploads**: Support for document and image uploads
- **Email Notifications**: OTP and notification system via email
- **SMS Integration**: Twilio integration for SMS notifications

## Tech Stack

- **Runtime**: Node.js with ES6 modules
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Email**: Nodemailer for email notifications
- **SMS**: Twilio for SMS notifications
- **File Upload**: Multer for file handling
- **Validation**: Express middleware for input validation

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Local MongoDB
   mongod
   
   # Or use MongoDB Atlas connection string in .env
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/labor-connect` |
| `JWT_SECRET` | JWT signing secret | `your-super-secret-jwt-key` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `PORT` | Server port | `8080` |
| `EMAIL_USER` | Email for notifications | `your-email@gmail.com` |
| `EMAIL_PASS` | Email app password | `your-app-password` |
| `TWILIO_ACCOUNT_SID` | Twilio account SID | `your-twilio-sid` |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | `your-twilio-token` |
| `TWILIO_PHONE_NUMBER` | Twilio phone number | `+1234567890` |

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/send-otp` - Send OTP via email
- `POST /api/auth/verify-otp` - Verify OTP

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PATCH /api/users/availability` - Toggle availability
- `POST /api/users/portfolio` - Upload portfolio
- `GET /api/users/laborers` - Get all laborers

### Jobs
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create new job
- `GET /api/jobs/:id` - Get job by ID
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Laborers
- `GET /api/laborers` - Get all laborers
- `POST /api/laborers` - Create laborer profile
- `GET /api/laborers/:id` - Get laborer by ID
- `PUT /api/laborers/:id` - Update laborer profile
- `DELETE /api/laborers/:id` - Delete laborer profile

### Reviews
- `GET /api/reviews` - Get all reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/:id` - Get review by ID
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Chat
- `GET /api/chats` - Get all chats
- `POST /api/chats` - Create chat
- `GET /api/chats/:id` - Get chat by ID
- `POST /api/chats/:id/messages` - Send message

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/laborers` - Get all laborers
- `PUT /api/admin/users/:id/approve` - Approve user
- `PUT /api/admin/laborers/:id/approve` - Approve laborer
- `DELETE /api/admin/users/:id` - Delete user

## Database Models

### User
- Basic user information
- Authentication credentials
- Role-based permissions
- Contact information

### Laborer
- Extended user profile for laborers
- Specialization and experience
- Portfolio (documents, photos, videos)
- Availability and approval status

### Job
- Job posting details
- Category and location
- Budget and requirements
- Assignment and status tracking

### Review
- Rating and feedback system
- User and laborer references
- Timestamp tracking

### Chat/Message
- Real-time messaging
- User-to-laborer communication
- Message history

## Middleware

- **Authentication**: JWT token verification
- **Authorization**: Role-based access control
- **Error Handling**: Centralized error management
- **File Upload**: Multer configuration for file handling
- **Validation**: Input validation and sanitization

## Development

### Project Structure
```
backend/
├── config/          # Database configuration
├── controllers/     # Business logic
├── middlewares/     # Custom middleware
├── models/         # Database schemas
├── routes/         # API routes
├── utils/          # Utility functions
├── views/          # EJS templates
├── uploads/        # File uploads
└── server.js       # Main server file
```

### Scripts
```bash
npm run dev     # Development with nodemon
npm start       # Production server
npm test        # Run tests (if configured)
```

### API Testing
Use tools like Postman or curl to test the API endpoints:

```bash
# Register a new user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "user"
  }'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Role-based access control
- Input validation and sanitization
- CORS configuration
- Error handling without sensitive data exposure

## Deployment

1. **Environment Setup**
   - Set production environment variables
   - Configure MongoDB Atlas or production database
   - Set up email and SMS services

2. **Build and Deploy**
   ```bash
   npm install --production
   NODE_ENV=production npm start
   ```

3. **Process Management**
   - Use PM2 for production process management
   - Configure reverse proxy (Nginx)
   - Set up SSL certificates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please contact the development team or create an issue in the repository.