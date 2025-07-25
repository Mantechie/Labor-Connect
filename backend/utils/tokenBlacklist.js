
import mongoose from 'mongoose';

// Schema for blacklisted tokens
const blacklistedTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['access', 'refresh'],
    default: 'refresh'
  },
  reason: {
    type: String,
    enum: ['logout', 'password_change', 'security_breach', 'user_request', 'admin_action'],
    default: 'logout'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '90d' // Automatically remove after 90 days
  }
});

// Create model if it doesn't exist
const BlacklistedToken = mongoose.models.BlacklistedToken || 
  mongoose.model('BlacklistedToken', blacklistedTokenSchema);

/**
 * Add a token to the blacklist
 * @param {string} token - The token to blacklist
 * @param {string} userId - The user ID associated with the token
 * @param {Object} options - Additional options
 * @param {string} options.type - Token type ('access' or 'refresh')
 * @param {string} options.reason - Reason for blacklisting
 * @returns {Promise<Object>} The blacklisted token document
 */
export const blacklistToken = async (token, userId, options = {}) => {
  const { type = 'refresh', reason = 'logout' } = options;
  
  const blacklistedToken = new BlacklistedToken({
    token,
    type,
    reason,
    userId
  });
  
  return await blacklistedToken.save();
};

/**
 * Check if a token is blacklisted
 * @param {string} token - The token to check
 * @returns {Promise<boolean>} True if token is blacklisted, false otherwise
 */
export const isTokenBlacklisted = async (token) => {
  const exists = await BlacklistedToken.exists({ token });
  return !!exists;
};

/**
 * Remove expired tokens from the blacklist
 * This is handled automatically by MongoDB TTL index,
 * but can be called manually if needed
 * @returns {Promise<number>} Number of tokens removed
 */
export const cleanupBlacklist = async () => {
  const result = await BlacklistedToken.deleteMany({
    createdAt: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } // 90 days
  });
  return result.deletedCount;
};

/**
 * Blacklist all tokens for a specific user
 * @param {string} userId - The user ID
 * @param {string} reason - Reason for blacklisting
 * @returns {Promise<number>} Number of tokens blacklisted
 */
export const blacklistAllUserTokens = async (userId, reason = 'security_breach') => {
  // Find user to get their current refresh token
  const User = mongoose.model('User');
  const user = await User.findById(userId);
  
  if (user && user.refreshToken) {
    // Blacklist the current refresh token
    await blacklistToken(user.refreshToken, userId, { 
      type: 'refresh', 
      reason 
    });
    
    // Clear the refresh token from the user
    user.refreshToken = null;
    await user.save();
    
    return 1;
  }
  
  return 0;
};

export default {
  blacklistToken,
  isTokenBlacklisted,
  cleanupBlacklist,
  blacklistAllUserTokens
};
