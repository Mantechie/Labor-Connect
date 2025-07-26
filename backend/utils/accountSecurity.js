/**
 * Handles login attempts and account lockout
 * @param {Object} user - User document from database
 * @param {boolean} success - Whether login was successful
 * @returns {Object} Updated user and lockout status
 */
export const handleLoginAttempt = async (user, success) => {
  // If login successful, reset attempts
  if (success) {
    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();
    return { user, isLocked: false };
  }
  
  // Calculate lockout threshold and duration based on attempts
  const MAX_ATTEMPTS = 5;
  let lockoutDuration = 0;
  
  // Increment attempts
  user.loginAttempts += 1;
  
  // Determine if account should be locked
  if (user.loginAttempts >= MAX_ATTEMPTS) {
    // Progressive lockout duration
    if (user.loginAttempts >= MAX_ATTEMPTS * 2) {
      // After 10 attempts, lock for 24 hours
      lockoutDuration = 24 * 60 * 60 * 1000; // 24 hours
    } else if (user.loginAttempts >= MAX_ATTEMPTS * 1.5) {
      // After 7-8 attempts, lock for 1 hour
      lockoutDuration = 60 * 60 * 1000; // 1 hour
    } else {
      // After 5-6 attempts, lock for 15 minutes
      lockoutDuration = 15 * 60 * 1000; // 15 minutes
    }
    
    user.lockUntil = new Date(Date.now() + lockoutDuration);
  }
  
  await user.save();
  
  return { 
    user, 
    isLocked: !!user.lockUntil && user.lockUntil > new Date(),
    lockUntil: user.lockUntil,
    attemptsRemaining: Math.max(0, MAX_ATTEMPTS - user.loginAttempts)
  };
};

/**
 * Checks if a user account is locked
 * @param {Object} user - User document from database
 * @returns {Object} Lock status information
 */
export const checkAccountLock = (user) => {
  if (!user.lockUntil || user.lockUntil < new Date()) {
    return { isLocked: false };
  }
  
  const timeLeft = Math.ceil((user.lockUntil - new Date()) / (60 * 1000)); // minutes
  return {
    isLocked: true,
    lockUntil: user.lockUntil,
    timeLeft
  };
};

export default {
  handleLoginAttempt,
  checkAccountLock
};
