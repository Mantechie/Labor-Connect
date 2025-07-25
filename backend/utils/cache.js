import NodeCache from 'node-cache';

// Create cache instances with different TTLs
export const statsCache = new NodeCache({ stdTTL: 300 }); // 5 minutes
export const analyticsCache = new NodeCache({ stdTTL: 1800 }); // 30 minutes
