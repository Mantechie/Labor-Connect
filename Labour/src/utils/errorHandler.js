// Error handling utilities for better user experience

export const isCorsError = (error) => {
  return (
    error.code === 'ERR_NETWORK' ||
    error.message?.includes('CORS') ||
    error.message?.includes('preflight') ||
    error.message?.includes('Access-Control-Allow-Origin') ||
    (error.response?.status === 0 && !error.response?.data)
  );
};

export const isAuthError = (error) => {
  return (
    error.response?.status === 401 ||
    error.response?.status === 403 ||
    error.message?.includes('token') ||
    error.message?.includes('auth') ||
    error.message?.includes('unauthorized') ||
    error.message?.includes('Session expired') ||
    error.message?.includes('Access forbidden')
  );
};

export const isNetworkError = (error) => {
  return (
    error.code === 'ERR_NETWORK' ||
    error.code === 'NETWORK_ERROR' ||
    error.message?.includes('Network Error') ||
    error.message?.includes('fetch')
  );
};

export const getErrorMessage = (error) => {
  // Handle CORS errors
  if (isCorsError(error)) {
    return {
      type: 'cors',
      message: 'Connection issue detected. This might be a temporary network problem or server configuration issue. Please try again in a moment.',
      userMessage: 'Network connection issue. Please try again.',
      technical: error.message
    };
  }

  // Handle authentication errors
  if (isAuthError(error)) {
    return {
      type: 'auth',
      message: error.response?.data?.message || error.message || 'Authentication failed',
      userMessage: 'Please check your credentials and try again.',
      technical: error.message
    };
  }

  // Handle network errors
  if (isNetworkError(error)) {
    return {
      type: 'network',
      message: 'Unable to connect to the server. Please check your internet connection.',
      userMessage: 'Connection problem. Please check your internet and try again.',
      technical: error.message
    };
  }

  // Handle server errors
  if (error.response?.status >= 500) {
    return {
      type: 'server',
      message: 'Server is temporarily unavailable. Please try again later.',
      userMessage: 'Server issue. Please try again in a moment.',
      technical: error.response?.data?.message || error.message
    };
  }

  // Handle client errors
  if (error.response?.status >= 400 && error.response?.status < 500) {
    return {
      type: 'client',
      message: error.response?.data?.message || error.message || 'Request failed',
      userMessage: error.response?.data?.message || 'Please check your input and try again.',
      technical: error.message
    };
  }

  // Default error handling
  return {
    type: 'unknown',
    message: error.message || 'An unexpected error occurred',
    userMessage: 'Something went wrong. Please try again.',
    technical: error.message
  };
};

export const handleApiError = (error, context = '') => {
  const errorInfo = getErrorMessage(error);
  
  // Log technical details for debugging
  console.error(`API Error in ${context}:`, {
    type: errorInfo.type,
    status: error.response?.status,
    message: errorInfo.technical,
    url: error.config?.url,
    method: error.config?.method
  });

  // Return user-friendly message
  return errorInfo;
};

// Retry logic for network/CORS errors
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Only retry for network/CORS errors
      if (isCorsError(error) || isNetworkError(error)) {
        if (i < maxRetries - 1) {
          console.log(`Request failed, retrying in ${delay}ms... (attempt ${i + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 1.5; // Exponential backoff
          continue;
        }
      }
      
      // Don't retry for auth errors or other client errors
      break;
    }
  }
  
  throw lastError;
};

export default {
  isCorsError,
  isAuthError,
  isNetworkError,
  getErrorMessage,
  handleApiError,
  retryRequest
};