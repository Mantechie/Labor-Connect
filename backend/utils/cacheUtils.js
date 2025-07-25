/**
 * Simple in-memory cache implementation
 */
class MemoryCache {
  constructor(defaultTTL = 300) { // Default TTL: 5 minutes (300 seconds)
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }
  
  /**
   * Set a value in the cache
   * @param {string} key - Cache key
   * @param {any} value - Value to store
   * @param {number} ttl - Time to live in seconds (optional)
   */
  set(key, value, ttl = this.defaultTTL) {
    const expiry = Date.now() + (ttl * 1000);
    this.cache.set(key, { value, expiry });
    return true;
  }
  
  /**
   * Get a value from the cache
   * @param {string} key - Cache key
   * @returns {any|null} The cached value or null if not found/expired
   */
  get(key) {
    const item = this.cache.get(key);
    
    // Not found
    if (!item) return null;
    
    // Expired
    if (item.expiry < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  /**
   * Delete a value from the cache
   * @param {string} key - Cache key
   */
  delete(key) {
    return this.cache.delete(key);
  }
  
  /**
   * Clear all cache entries
   */
  clear() {
    this.cache.clear();
  }
  
  /**
   * Get cache stats
   * @returns {Object} Cache statistics
   */
  getStats() {
    let expired = 0;
    const now = Date.now();
    
    this.cache.forEach(item => {
      if (item.expiry < now) expired++;
    });
    
    return {
      total: this.cache.size,
      expired,
      active: this.cache.size - expired
    };
  }
}

// Create and export a singleton instance
export const adminLogCache = new MemoryCache(300); // 5 minutes TTL
