# Labour Connect Frontend

A React.js frontend application for the Labour Connect platform that connects skilled laborers with clients.

## Features

- **User Authentication**: Login, registration, and OTP verification
- **Job Management**: Post jobs, browse jobs, and manage job status
- **Laborer Profiles**: View laborer profiles, ratings, and reviews
- **Real-time Chat**: Communicate between clients and laborers
- **Review System**: Rate and review laborers
- **Admin Dashboard**: Manage users, jobs, and platform content

## Backend Integration

This frontend is fully integrated with the Labour Connect backend API. The integration includes:

### API Services
- **AuthService**: Handles user authentication, registration, and OTP verification
- **JobService**: Manages job posting, browsing, and status updates
- **LaborerService**: Handles laborer profiles, availability, and job assignments
- **ChatService**: Manages real-time messaging between users
- **ReviewService**: Handles rating and review system

### Configuration
- API base URL: `http://localhost:5000/api` (configurable via environment variables)
- JWT token authentication
- Automatic token refresh and error handling

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Backend server running on port 5000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file (optional):
```bash
# Create .env file in the root directory
VITE_API_BASE_URL=http://localhost:5000/api
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── Components/          # Reusable UI components
│   ├── Header.jsx      # Navigation header
│   ├── Footer.jsx      # Footer component
│   ├── JobListing.jsx  # Job listing component
│   ├── LaborerProfile.jsx # Laborer profile component
│   ├── ChatInterface.jsx # Chat interface
│   └── AdminDashboard.jsx # Admin dashboard
├── pages/              # Page components
│   ├── HomePage.jsx    # Landing page
│   ├── LoginPage.jsx   # Login page
│   ├── SignUpPage.jsx  # Registration page
│   ├── JobPostPage.jsx # Job posting page
│   └── OTPVerificationPage.jsx # OTP verification
├── services/           # API service classes
│   ├── authService.js  # Authentication service
│   ├── jobService.js   # Job management service
│   ├── laborerService.js # Laborer management service
│   ├── chatService.js  # Chat service
│   └── reviewService.js # Review service
├── utils/              # Utility functions
│   └── axiosInstance.js # Axios configuration
├── config/             # Configuration files
│   └── api.js          # API endpoints and config
├── styles/             # CSS styles
│   ├── App.css         # Main app styles
│   └── components.css  # Component styles
└── assets/             # Static assets
```

## API Integration Details

### Authentication Flow
1. User registers/logs in through the frontend
2. Backend returns JWT token and user data
3. Token is stored in localStorage
4. All subsequent API calls include the token in Authorization header
5. Automatic token refresh and logout on 401 errors

### Job Management
- Users can post jobs with title, description, category, location, and budget
- Jobs can be filtered by category, location, budget range, and status
- Laborers can apply for jobs and update job status
- Real-time updates for job assignments and status changes

### Chat System
- Real-time messaging between clients and laborers
- Support for text, image, and file messages
- Message history and read status tracking
- WebSocket integration for instant messaging

### Review System
- Clients can rate and review laborers after job completion
- Rating system with 1-5 stars and comment functionality
- Review moderation and management

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:5000/api` |

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
