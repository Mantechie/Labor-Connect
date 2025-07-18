// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

// API Endpoints
export const ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  SEND_OTP: '/auth/send-otp',
  VERIFY_OTP: '/auth/verify-otp',
  RESET_PASSWORD: '/auth/reset-password',
  GET_CURRENT_USER: '/auth/me',
  
  // Jobs
  JOBS: '/jobs',
  JOB_BY_ID: (id) => `/jobs/${id}`,
  USER_JOBS: '/jobs/my-jobs',
  ASSIGN_LABORER: (jobId) => `/jobs/${jobId}/assign`,
  UPDATE_JOB_STATUS: (jobId) => `/jobs/${jobId}/status`,
  
  // Laborers
  LABORERS: '/laborers',
  LABORER_BY_ID: (id) => `/laborers/${id}`,
  LABORER_DASHBOARD: '/laborers/dashboard',
  LABORER_PROFILE: '/laborers/profile',
  LABORER_SPECIALIZATION: '/laborers/specialization',
  LABORER_AVAILABILITY: '/laborers/availability',
  LABORER_PORTFOLIO: '/laborers/portfolio',
  LABORER_MEDIA: '/laborers/media',
  LABORER_JOBS: '/laborers/jobs',
  SEARCH_LABORERS: '/laborers/search',
  
  // Chats
  CHATS: '/chats',
  CHAT_BY_ID: (id) => `/chats/${id}`,
  CHAT_MESSAGES: (chatId) => `/chats/${chatId}/messages`,
  CHAT_READ: (chatId) => `/chats/${chatId}/read`,
  CHAT_MESSAGE: (chatId, messageId) => `/chats/${chatId}/messages/${messageId}`,
  
  // Reviews
  REVIEWS: '/reviews',
  REVIEW_BY_ID: (id) => `/reviews/${id}`,
  USER_REVIEWS: '/reviews/my-reviews',
  CHECK_REVIEW: (laborerId) => `/reviews/check/${laborerId}`,
  
  // Admin
  ADMIN_USERS: '/admin/users',
  ADMIN_LABORERS: '/admin/laborers',
  ADMIN_JOBS: '/admin/jobs',
  ADMIN_CHATS: '/admin/chats',
  ADMIN_REVIEWS: '/admin/reviews',
  APPROVE_LABORER: (id) => `/admin/laborers/${id}/approve`,
  DELETE_USER: (id) => `/admin/users/${id}`,
}; 