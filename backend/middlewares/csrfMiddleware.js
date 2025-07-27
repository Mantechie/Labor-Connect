export const csrfProtection = (req, res, next) => {
  // Skip CSRF check for GET requests and non-mutating operations
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }
  
  // Get CSRF token from request header
  const csrfToken = req.headers['x-csrf-token'];
  
  // Get CSRF token from cookie
  const cookieCsrfToken = req.cookies.csrf_token;
  
  // If no CSRF token in header or cookie, reject the request
  if (!csrfToken || !cookieCsrfToken) {
    return res.status(403).json({ message: 'CSRF token missing' });
  }
  
  // Compare the tokens
  if (csrfToken !== cookieCsrfToken) {
    return res.status(403).json({ message: 'Invalid CSRF token' });
  }
  
  // If tokens match, proceed
  next();
};
