import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware to add correlation ID to each request
 * This helps with tracing requests across services and logs
 */
export const addCorrelationId = (req, res, next) => {
  // Generate a new UUID for this request
  const correlationId = uuidv4();
  
  // Add to request object for use in controllers and services
  req.correlationId = correlationId;
  
  // Add as response header for client-side tracking
  res.setHeader('X-Correlation-ID', correlationId);
  
  next();
};
