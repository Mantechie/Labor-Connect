/**
 * Configuration for admin log functionality
 * These values can be overridden by environment variables
 */
export default {
  // Pagination limits
  MAX_PAGE_SIZE: process.env.ADMIN_LOG_MAX_PAGE_SIZE || 100,
  DEFAULT_PAGE_SIZE: process.env.ADMIN_LOG_DEFAULT_PAGE_SIZE || 50,
  EXPORT_LIMIT: process.env.ADMIN_LOG_EXPORT_LIMIT || 1000,
  
  // Caching
  CACHE_ENABLED: process.env.ADMIN_LOG_CACHE_ENABLED !== 'false',
  CACHE_TTL: process.env.ADMIN_LOG_CACHE_TTL || 300, // 5 minutes
  
  // Security
  MASK_IP_ADDRESSES: process.env.ADMIN_LOG_MASK_IP !== 'false',
  MASK_EMAILS: process.env.ADMIN_LOG_MASK_EMAILS !== 'false',
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: process.env.ADMIN_LOG_RATE_LIMIT_WINDOW || 5 * 60 * 1000, // 5 minutes
  RATE_LIMIT_MAX_REQUESTS: process.env.ADMIN_LOG_RATE_LIMIT_MAX || 30,
  EXPORT_RATE_LIMIT_WINDOW_MS: process.env.ADMIN_LOG_EXPORT_RATE_LIMIT_WINDOW || 60 * 60 * 1000, // 1 hour
  EXPORT_RATE_LIMIT_MAX_REQUESTS: process.env.ADMIN_LOG_EXPORT_RATE_LIMIT_MAX || 5
};
