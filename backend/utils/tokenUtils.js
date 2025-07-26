import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { isTokenBlacklisted } from './tokenBlacklist.js';

/**
 * Generates an access token for a user
 * @param {string} id - User ID
 * @param {string} role - User role
 * @param {Object} options - Additional options
 * @param {string} options.ip - IP address of the client
 * @param {string} options.userAgent - User agent of the client
 * @returns {string} JWT access token
 */
export const generateAccessToken = (id, role, options = {}) => {
  // Create payload with essential user data and metadata
  const payload = {
    id,
    role,
    // Add token metadata for security tracking
    metadata: {
      createdAt: Date.now(),
      ...(options.ip && { ip: options.ip }),
      ...(options.userAgent && { userAgent: options.userAgent }),
    }
  };

  // Get token expiration from environment or use default
  const expiresIn = process.env.JWT_ACCESS_EXPIRY || '15m';

  // Sign token with JWT_SECRET
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

/**
 * Generates a refresh token for a user
 * @param {string} id - User ID
 * @param {Object} options - Additional options
 * @param {string} options.ip - IP address of the client
 * @param {string} options.userAgent - User agent of the client
 * @param {string} options.deviceId - Unique device identifier
 * @returns {string} JWT refresh token
 */
export const generateRefreshToken = (id, options = {}) => {
  // Create payload with user ID and device info for multi-device support
  const payload = {
    id,
    // Add token metadata for security tracking
    metadata: {
      createdAt: Date.now(),
      ...(options.deviceId && { deviceId: options.deviceId }),
      ...(options.ip && { ip: options.ip }),
      ...(options.userAgent && { userAgent: options.userAgent }),
    }
  };

  // Get token expiration from environment or use default
  const expiresIn = process.env.JWT_REFRESH_EXPIRY || '60d';

  // Use a separate secret for refresh tokens if available
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

  // Sign token with refresh secret
  return jwt.sign(
    payload,
    secret,
    { expiresIn }
  );
};

/**
 * Verifies an access token
 * @param {string} token - JWT access token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
export const verifyAccessToken =async  (token) => {
  try {
    // Check if token is blacklisted
    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) {
      const error = new Error('Token has been revoked');
      error.statusCode = 401;
      throw error;
    }
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    // Enhance error with more context
    if (error.name === 'TokenExpiredError') {
      error.statusCode = 401;
      error.message = 'Access token expired';
    } else {
      error.statusCode = 401;
      error.message = 'Invalid access token';
    }
    throw error;
  }
};

/**
 * Verifies a refresh token
 * @param {string} token - JWT refresh token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
export const verifyRefreshToken =async  (token) => {
  try {
    // Check if token is blacklisted
    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) {
      const error = new Error('Token has been revoked');
      error.statusCode = 401;
      throw error;
    }

    // Use a separate secret for refresh tokens if available
    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    return jwt.verify(token, secret);
  } catch (error) {
    // Enhance error with more context
    if (error.name === 'TokenExpiredError') {
      error.statusCode = 401;
      error.message = 'Refresh token expired';
    } else {
      error.statusCode = 401;
      error.message = 'Invalid refresh token';
    }
    throw error;
  }
};

/**
 * Generates a secure random token
 * @param {number} bytes - Number of bytes for the token
 * @returns {string} Hex string token
 */
export const generateSecureToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateSecureToken
};
