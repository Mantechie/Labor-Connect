/**
 * Validates password strength according to policy
 * @param {string} password - The password to validate
 * @returns {Object} Validation result with success flag and message
 */
export const validatePasswordStrength = (password) => {
  // Check minimum length
  if (password.length < 8) {
    return {
      success: false,
      message: 'Password must be at least 8 characters long'
    };
  }
  
  // Check for uppercase letters
  if (!/[A-Z]/.test(password)) {
    return {
      success: false,
      message: 'Password must contain at least one uppercase letter'
    };
  }
  
  // Check for lowercase letters
  if (!/[a-z]/.test(password)) {
    return {
      success: false,
      message: 'Password must contain at least one lowercase letter'
    };
  }
  
  // Check for numbers
  if (!/[0-9]/.test(password)) {
    return {
      success: false,
      message: 'Password must contain at least one number'
    };
  }
  
  // Check for special characters
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      success: false,
      message: 'Password must contain at least one special character'
    };
  }
  
  // Check for common passwords (simplified example)
  const commonPasswords = [
    'password', 'password123', '123456', 'qwerty', 'admin123',
    'welcome', 'welcome123', 'letmein', 'abc123'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    return {
      success: false,
      message: 'Password is too common. Please choose a stronger password'
    };
  }
  
  return {
    success: true,
    message: 'Password meets strength requirements'
  };
};

/**
 * Checks if a password has been used before by this user
 * @param {string} password - The password to check
 * @param {Array} passwordHistory - Array of previous password hashes
 * @param {Function} compareFunc - Function to compare password with hash
 * @returns {Promise<boolean>} True if password was used before
 */
export const isPasswordReused = async (password, passwordHistory, compareFunc) => {
  if (!passwordHistory || !passwordHistory.length) {
    return false;
  }
  
  // Check each password in history
  for (const hash of passwordHistory) {
    const match = await compareFunc(password, hash);
    if (match) {
      return true;
    }
  }
  
  return false;
};

export default {
  validatePasswordStrength,
  isPasswordReused
};
