// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

// API Endpoints
export const ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  SEND_OTP: '/api/auth/send-otp',
  VERIFY_OTP: '/api/auth/verify-otp',
  RESET_PASSWORD: '/api/auth/reset-password',
  GET_CURRENT_USER: '/api/auth/me',
  
  // Jobs
  JOBS: '/api/jobs',
  JOB_BY_ID: (id) => `/api/jobs/${id}`,
  USER_JOBS: '/api/jobs/my-jobs',
  ASSIGN_LABORER: (jobId) => `/api/jobs/${jobId}/assign`,
  UPDATE_JOB_STATUS: (jobId) => `/api/jobs/${jobId}/status`,
  
  // Laborers
  LABORERS: '/api/laborers',
  LABORER_BY_ID: (id) => `/api/laborers/${id}`,
  LABORER_DASHBOARD: '/api/laborers/dashboard',
  LABORER_PROFILE: '/api/laborers/profile',
  LABORER_SPECIALIZATION: '/api/laborers/specialization',
  LABORER_AVAILABILITY: '/api/laborers/availability',
  LABORER_PORTFOLIO: '/api/laborers/portfolio',
  LABORER_MEDIA: '/api/laborers/media',
  LABORER_JOBS: '/api/laborers/jobs',
  SEARCH_LABORERS: '/api/laborers/search',
  
  // Chats
  CHATS: '/api/chats',
  CHAT_BY_ID: (id) => `/api/chats/${id}`,
  CHAT_MESSAGES: (chatId) => `/api/chats/${chatId}/messages`,
  CHAT_READ: (chatId) => `/api/chats/${chatId}/read`,
  CHAT_MESSAGE: (chatId, messageId) => `/api/chats/${chatId}/messages/${messageId}`,
  
  // Reviews
  REVIEWS: '/api/reviews',
  REVIEW_BY_ID: (id) => `/api/reviews/${id}`,
  USER_REVIEWS: '/api/reviews/my-reviews',
  CHECK_REVIEW: (laborerId) => `/api/reviews/check/${laborerId}`,
  
  // Admin Auth
  ADMIN_LOGIN: '/api/admin/auth/login',
  ADMIN_REGISTER: '/api/admin/auth/register',
  ADMIN_GET_CURRENT_USER: '/api/admin/auth/me',
  ADMIN_LOGOUT: '/api/admin/auth/logout',
  
  // Admin
  ADMIN_USERS: '/api/admin/users',
  ADMIN_LABORERS: '/api/admin/laborers',
  ADMIN_JOBS: '/api/admin/jobs',
  ADMIN_CHATS: '/api/admin/chats',
  ADMIN_REVIEWS: '/api/admin/reviews',
  APPROVE_LABORER: (id) => `/api/admin/laborers/${id}/approve`,
  DELETE_USER: (id) => `/api/admin/users/${id}`,
}; 