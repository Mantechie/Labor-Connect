import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes default TTL

/**
 * Middleware to cache API responses
 * @param {string} key - Base key for the cache entry
 * @param {number} ttl - Time to live in seconds
 * @returns {Function} Express middleware
 */
export const cacheMiddleware = (key, ttl = 300) => {
  return (req, res, next) => {
    // Skip cache for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    // Generate cache key based on route and query params
    const cacheKey = `${key}_${JSON.stringify(req.query)}`;
    
    // Check if data exists in cache
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }
    
    // Store original send method
    const originalSend = res.json;
    
    // Override send method to cache response
    res.json = function(data) {
      // Cache the response data
      cache.set(cacheKey, data, ttl);
      
      // Call original send method
      return originalSend.call(this, data);
    };
    
    next();
  };
};

/**
 * Clear cache entries that match a pattern
 * @param {string} pattern - Pattern to match cache keys
 */
export const clearCache = (pattern) => {
  const keys = cache.keys();
  const matchingKeys = keys.filter(key => key.startsWith(pattern));
  matchingKeys.forEach(key => cache.del(key));
};
