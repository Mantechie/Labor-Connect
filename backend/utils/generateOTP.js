// Updated generateOTP.js with crypto
import crypto from 'crypto';

// Function to generate a 6-digit numeric OTP using cryptographically secure random numbers
const generateOTP = () => {
  // Generate random bytes
  const buffer = crypto.randomBytes(3);
  
  // Convert to a number and ensure it's 6 digits
  const otp = parseInt(buffer.toString('hex'), 16)
    .toString()
    .substr(0, 6)
    .padStart(6, '0');
    
  return otp;
};

export default generateOTP;