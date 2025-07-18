# Labour Connect - Complete Setup Guide

This guide will help you set up and run the complete Labour Connect application with both backend and frontend integrated.

## 📁 Project Structure

```
Labour/
├── backend/          # Node.js/Express API server
│   ├── config/       # Configuration files
│   ├── controllers/  # API controllers
│   ├── models/       # MongoDB models
│   ├── routes/       # API routes
│   ├── middlewares/  # Express middlewares
│   ├── utils/        # Utility functions
│   └── server.js     # Main server file
├── Labour/           # React.js frontend application
│   ├── src/          # Source code
│   ├── public/       # Static files
│   └── package.json  # Frontend dependencies
└── SETUP.md          # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm
- MongoDB (running locally or cloud instance)

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 2: Configure Backend Environment

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/labor-connect

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Twilio Configuration (optional)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-phone

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

### Step 3: Start Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running in development mode on port 5000
📧 Email configured: Yes/No
📱 SMS configured: Yes/No
🔌 WebSocket enabled for real-time chat
```

### Step 4: Install Frontend Dependencies

```bash
cd Labour
npm install
```

### Step 5: Configure Frontend Environment

Create a `.env` file in the `Labour` directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Step 6: Start Frontend Application

```bash
cd Labour
npm run dev
```

You should see:
```
  VITE v6.3.5  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 7: Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Backend Health Check**: http://localhost:5000

## 🧪 Testing the Integration

Run the integration test to verify everything is working:

```bash
node test-integration.js
```

## 📋 Available Scripts

### Backend Scripts
```bash
cd backend
npm run dev      # Start development server
npm start        # Start production server
npm test         # Run API tests
```

### Frontend Scripts
```bash
cd Labour
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🔧 Troubleshooting

### Backend Issues

1. **Port already in use**:
   ```bash
   # Kill process on port 5000
   npx kill-port 5000
   ```

2. **MongoDB connection failed**:
   - Ensure MongoDB is running
   - Check MONGO_URI in .env file
   - Try: `mongodb://127.0.0.1:27017/labor-connect`

3. **JWT errors**:
   - Set a strong JWT_SECRET in .env
   - Restart the server after changing JWT_SECRET

### Frontend Issues

1. **API connection failed**:
   - Ensure backend is running on port 5000
   - Check VITE_API_BASE_URL in .env
   - Verify CORS configuration

2. **Build errors**:
   ```bash
   cd Labour
   rm -rf node_modules package-lock.json
   npm install
   ```

### CORS Issues

If you see CORS errors in browser console:

1. Check backend CORS configuration in `server.js`
2. Verify CORS_ORIGIN in backend .env
3. Ensure frontend is running on the correct port

## 🌐 Production Deployment

### Backend Deployment
1. Set NODE_ENV=production
2. Use a strong JWT_SECRET
3. Configure production MongoDB URI
4. Set up proper CORS_ORIGIN for your domain

### Frontend Deployment
1. Update VITE_API_BASE_URL to production API URL
2. Build the application: `npm run build`
3. Deploy the `dist` folder to your hosting service

## 📱 Features Available

Once running, you can:

- ✅ Register as User or Laborer
- ✅ Login with email/password
- ✅ Post jobs (Users)
- ✅ Browse and apply for jobs (Laborers)
- ✅ Real-time chat between users
- ✅ Rate and review laborers
- ✅ Admin dashboard (Admin role)
- ✅ Profile management
- ✅ Job status tracking

## 🔐 Default Admin Account

To create an admin account, register normally and then manually update the user role in MongoDB:

```javascript
// In MongoDB shell or MongoDB Compass
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

## 📞 Support

If you encounter any issues:

1. Check the console logs for both backend and frontend
2. Verify all environment variables are set correctly
3. Ensure MongoDB is running and accessible
4. Test the integration with `node test-integration.js`

---

**Happy coding! 🚀** 