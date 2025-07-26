import { logger } from '../utils/Logger.js';
import sendEmail from '../utils/sendEmail.js';
import sendSMS from '../utils/sendSMS.js';

/**
 * Send notification to admin with retry logic
 * 
 * @param {Object} options - Notification options
 * @param {String} options.subject - Email subject
 * @param {String} options.message - Notification message
 * @param {Object} options.admin - Admin object with email and/or phone
 * @param {String} options.correlationId - Request correlation ID for tracing
 * @returns {Boolean} Success status
 */
export const sendAdminNotification = async ({ subject, message, admin, correlationId }) => {
  const maxRetries = 3;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      if (admin.email) {
        await sendEmail({
          to: admin.email,
          subject,
          html: `
            <h2>🔔 Admin Notification</h2>
            <p>${message}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Time:</strong> ${new Date().toISOString()}</p>
            <p><small>Correlation ID: ${correlationId}</small></p>
          `
        });
      }
      
      if (admin.phone) {
        await sendSMS({
          to: admin.phone,
          message: `LabourConnect Admin: ${subject} - ${message}`
        });
      }
      
      logger.info({
        message: `Notification sent to admin ${admin.email || admin.phone}`,
        correlationId,
        adminId: admin._id
      });
      
      return true;
    } catch (error) {
      retries++;
      logger.error({
        message: `Error sending notification to admin ${admin.email || admin.phone}, retry ${retries}/${maxRetries}`,
        error: error.message,
        stack: error.stack,
        correlationId,
        adminId: admin._id
      });
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
    }
  }
  
  logger.error({
    message: `Failed to send notification to admin ${admin.email || admin.phone} after ${maxRetries} attempts`,
    correlationId,
    adminId: admin._id
  });
  
  return false;
};

/**
 * Notify all admins except the one specified
 * 
 * @param {Object} options - Notification options
 * @param {String} options.subject - Email subject
 * @param {String} options.message - Notification message
 * @param {String} options.excludeAdminId - Admin ID to exclude
 * @param {String} options.correlationId - Request correlation ID for tracing
 * @returns {Promise<void>}
 */
export const notifyAdmins = async ({ subject, message, excludeAdminId, correlationId }) => {
  try {
    const Admin = (await import('../models/Admin.js')).default;
    
    const admins = await Admin.find({ 
      isActive: true, 
      _id: { $ne: excludeAdminId } 
    });
    
    if (admins.length === 0) {
      logger.info({
        message: 'No other admins to notify',
        correlationId
      });
      return;
    }
    
    // Use Promise.allSettled to send notifications in parallel
    const results = await Promise.allSettled(
      admins.map(admin => sendAdminNotification({ 
        subject, 
        message, 
        admin, 
        correlationId 
      }))
    );
    
    // Log results
    const successful = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
    const failed = admins.length - successful;
    
    logger.info({
      message: `Admin notifications: ${successful} sent, ${failed} failed`,
      correlationId
    });
  } catch (error) {
    logger.error({
      message: 'Error in notifyAdmins',
      error: error.message,
      stack: error.stack,
      correlationId
    });
  }
};
