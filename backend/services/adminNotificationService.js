import Admin from '../models/Admin.js';
import AdminLog from '../models/AdminLog.js';
import sendEmail from '../utils/sendEmail.js';
import sendSMS from '../utils/sendSMS.js';

class AdminNotificationService {
  // Notify all active admins about profile/password changes
  static async notifyAdminsOfChange(changeType, changedBy, details = {}) {
    try {
      console.log(`🔔 Notifying admins of ${changeType} by ${changedBy.email}`);
      
      // Get all active admins except the one who made the change
      const admins = await Admin.find({ 
        isActive: true, 
        _id: { $ne: changedBy._id } 
      });
      
      if (admins.length === 0) {
        console.log('No other admins to notify');
        return;
      }
      
      const notifications = [];
      
      for (const admin of admins) {
        try {
          // Send email notification
          if (admin.email) {
            const emailResult = await this.sendEmailNotification(admin, changeType, changedBy, details);
            notifications.push({
              adminId: admin._id,
              type: 'email',
              success: emailResult.success,
              error: emailResult.error
            });
          }
          
          // Send SMS notification (if phone exists and SMS is configured)
          if (admin.phone && process.env.TWILIO_ACCOUNT_SID) {
            const smsResult = await this.sendSMSNotification(admin, changeType, changedBy, details);
            notifications.push({
              adminId: admin._id,
              type: 'sms',
              success: smsResult.success,
              error: smsResult.error
            });
          }
        } catch (error) {
          console.error(`Error notifying admin ${admin.email}:`, error);
          notifications.push({
            adminId: admin._id,
            type: 'unknown',
            success: false,
            error: error.message
          });
        }
      }
      
      // Log the notification attempt
      await AdminLog.createLog({
        adminId: changedBy._id,
        adminEmail: changedBy.email,
        action: 'admin_notification_sent',
        details: `Notified ${admins.length} admins about ${changeType}`,
        metadata: {
          changeType,
          notificationsSent: notifications.length,
          notifications
        }
      });
      
      console.log(`✅ Notified ${admins.length} admins about ${changeType}`);
      return notifications;
      
    } catch (error) {
      console.error('Error in notifyAdminsOfChange:', error);
      throw error;
    }
  }
  
  // Send email notification
  static async sendEmailNotification(admin, changeType, changedBy, details) {
    try {
      const subject = this.getEmailSubject(changeType);
      const html = this.getEmailTemplate(admin, changeType, changedBy, details);
      const text = this.getEmailText(admin, changeType, changedBy, details);
      
      const result = await sendEmail({
        to: admin.email,
        subject,
        text,
        html
      });
      
      return { success: true, error: null };
    } catch (error) {
      console.error(`Email notification failed for ${admin.email}:`, error);
      return { success: false, error: error.message };
    }
  }
  
  // Send SMS notification
  static async sendSMSNotification(admin, changeType, changedBy, details) {
    try {
      const message = this.getSMSTemplate(admin, changeType, changedBy, details);
      
      const result = await sendSMS({
        to: admin.phone,
        message
      });
      
      return { success: true, error: null };
    } catch (error) {
      console.error(`SMS notification failed for ${admin.phone}:`, error);
      return { success: false, error: error.message };
    }
  }
  
  // Get email subject based on change type
  static getEmailSubject(changeType) {
    const subjects = {
      'profile_update': '🔔 Admin Profile Updated - LabourConnect',
      'password_change': '🔐 Admin Password Changed - LabourConnect',
      'profile_picture_update': '📷 Admin Profile Picture Updated - LabourConnect',
      'add_collaborator': '👥 New Admin Collaborator Added - LabourConnect',
      'remove_collaborator': '👥 Admin Collaborator Removed - LabourConnect',
      'login': '🔑 Admin Login Detected - LabourConnect',
      'failed_login': '⚠️ Failed Admin Login Attempt - LabourConnect'
    };
    
    return subjects[changeType] || '🔔 Admin Activity Notification - LabourConnect';
  }
  
  // Get email HTML template
  static getEmailTemplate(admin, changeType, changedBy, details) {
    const timestamp = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const changeDescriptions = {
      'profile_update': 'updated their profile information',
      'password_change': 'changed their password',
      'profile_picture_update': 'updated their profile picture',
      'add_collaborator': 'added a new admin collaborator',
      'remove_collaborator': 'removed an admin collaborator',
      'login': 'logged into the admin dashboard',
      'failed_login': 'had a failed login attempt'
    };
    
    const description = changeDescriptions[changeType] || 'performed an action';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Admin Activity Notification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #007bff; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 5px 5px; }
          .alert { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🔔 Admin Activity Notification</h2>
          </div>
          <div class="content">
            <p>Hello <strong>${admin.name}</strong>,</p>
            
            <div class="alert">
              <strong>${changedBy.name}</strong> (${changedBy.email}) ${description} on <strong>${timestamp}</strong>.
            </div>
            
            <div class="details">
              <h4>Activity Details:</h4>
              <ul>
                <li><strong>Admin:</strong> ${changedBy.name} (${changedBy.role})</li>
                <li><strong>Action:</strong> ${changeType.replace('_', ' ').toUpperCase()}</li>
                <li><strong>Time:</strong> ${timestamp}</li>
                ${details.ipAddress ? `<li><strong>IP Address:</strong> ${details.ipAddress}</li>` : ''}
                ${details.location ? `<li><strong>Location:</strong> ${details.location}</li>` : ''}
              </ul>
            </div>
            
            <p>If you did not expect this activity, please contact the system administrator immediately.</p>
            
            <p>Best regards,<br>LabourConnect Admin Team</p>
          </div>
          <div class="footer">
            <p>This is an automated notification from LabourConnect Admin System.</p>
            <p>Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
  
  // Get email text version
  static getEmailText(admin, changeType, changedBy, details) {
    const timestamp = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const changeDescriptions = {
      'profile_update': 'updated their profile information',
      'password_change': 'changed their password',
      'profile_picture_update': 'updated their profile picture',
      'add_collaborator': 'added a new admin collaborator',
      'remove_collaborator': 'removed an admin collaborator',
      'login': 'logged into the admin dashboard',
      'failed_login': 'had a failed login attempt'
    };
    
    const description = changeDescriptions[changeType] || 'performed an action';
    
    return `
Admin Activity Notification

Hello ${admin.name},

${changedBy.name} (${changedBy.email}) ${description} on ${timestamp}.

Activity Details:
- Admin: ${changedBy.name} (${changedBy.role})
- Action: ${changeType.replace('_', ' ').toUpperCase()}
- Time: ${timestamp}
${details.ipAddress ? `- IP Address: ${details.ipAddress}` : ''}
${details.location ? `- Location: ${details.location}` : ''}

If you did not expect this activity, please contact the system administrator immediately.

Best regards,
LabourConnect Admin Team

This is an automated notification from LabourConnect Admin System.
Please do not reply to this email.
    `;
  }
  
  // Get SMS template
  static getSMSTemplate(admin, changeType, changedBy, details) {
    const changeDescriptions = {
      'profile_update': 'updated profile',
      'password_change': 'changed password',
      'profile_picture_update': 'updated profile picture',
      'add_collaborator': 'added new collaborator',
      'remove_collaborator': 'removed collaborator',
      'login': 'logged in',
      'failed_login': 'had failed login'
    };
    
    const description = changeDescriptions[changeType] || 'performed action';
    
    return `LabourConnect: ${changedBy.name} ${description}. Check email for details.`;
  }
  
  // Notify about failed login attempts
  static async notifyFailedLogin(admin, attemptDetails) {
    try {
      await this.notifyAdminsOfChange('failed_login', admin, attemptDetails);
    } catch (error) {
      console.error('Error notifying failed login:', error);
    }
  }
  
  // Notify about successful login
  static async notifySuccessfulLogin(admin, loginDetails) {
    try {
      await this.notifyAdminsOfChange('login', admin, loginDetails);
    } catch (error) {
      console.error('Error notifying successful login:', error);
    }
  }
}

export default AdminNotificationService; 