import sendEmail from './sendEmail.js'
import sendSMS from './sendSMS.js'
import { getIO } from '../sockets/chatSocket.js'
import config from '../config/env.js'

// Notification types
export const NOTIFICATION_TYPES = {
  JOB_POSTED: 'job_posted',
  JOB_ASSIGNED: 'job_assigned',
  JOB_COMPLETED: 'job_completed',
  JOB_CANCELLED: 'job_cancelled',
  NEW_MESSAGE: 'new_message',
  REVIEW_RECEIVED: 'review_received',
  LABORER_APPROVED: 'laborer_approved',
  LABORER_REJECTED: 'laborer_rejected',
  PAYMENT_RECEIVED: 'payment_received',
  REMINDER: 'reminder'
}

// Notification templates
const templates = {
  [NOTIFICATION_TYPES.JOB_POSTED]: {
    email: {
      subject: 'New Job Posted - Labor Connect',
      template: (data) => ({
        subject: 'New Job Posted - Labor Connect',
        text: `A new ${data.category} job has been posted in ${data.location} with a budget of ₹${data.budget}.`,
        html: `
          <h2>New Job Opportunity!</h2>
          <p><strong>Category:</strong> ${data.category}</p>
          <p><strong>Location:</strong> ${data.location}</p>
          <p><strong>Budget:</strong> ₹${data.budget}</p>
          <p><strong>Description:</strong> ${data.description}</p>
          <a href="${config.CORS_ORIGIN}/jobs/${data.jobId}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Job</a>
        `
      })
    },
    sms: {
      template: (data) => `New ${data.category} job in ${data.location} - ₹${data.budget}. View at ${config.CORS_ORIGIN}/jobs/${data.jobId}`
    }
  },
  [NOTIFICATION_TYPES.JOB_ASSIGNED]: {
    email: {
      subject: 'Job Assigned - Labor Connect',
      template: (data) => ({
        subject: 'Job Assigned - Labor Connect',
        text: `You have been assigned a ${data.category} job in ${data.location}.`,
        html: `
          <h2>Job Assigned!</h2>
          <p><strong>Category:</strong> ${data.category}</p>
          <p><strong>Location:</strong> ${data.location}</p>
          <p><strong>Budget:</strong> ₹${data.budget}</p>
          <p><strong>Client:</strong> ${data.clientName}</p>
          <a href="${config.CORS_ORIGIN}/jobs/${data.jobId}" style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Details</a>
        `
      })
    },
    sms: {
      template: (data) => `Job assigned: ${data.category} in ${data.location} - ₹${data.budget}. Client: ${data.clientName}`
    }
  },
  [NOTIFICATION_TYPES.NEW_MESSAGE]: {
    email: {
      subject: 'New Message - Labor Connect',
      template: (data) => ({
        subject: 'New Message - Labor Connect',
        text: `You have a new message from ${data.senderName}: ${data.message}`,
        html: `
          <h2>New Message</h2>
          <p><strong>From:</strong> ${data.senderName}</p>
          <p><strong>Message:</strong> ${data.message}</p>
          <a href="${config.CORS_ORIGIN}/chats/${data.chatId}" style="background: #17a2b8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reply</a>
        `
      })
    },
    sms: {
      template: (data) => `New message from ${data.senderName}: ${data.message.substring(0, 50)}${data.message.length > 50 ? '...' : ''}`
    }
  },
  [NOTIFICATION_TYPES.REVIEW_RECEIVED]: {
    email: {
      subject: 'New Review Received - Labor Connect',
      template: (data) => ({
        subject: 'New Review Received - Labor Connect',
        text: `You received a ${data.rating}-star review from ${data.reviewerName}.`,
        html: `
          <h2>New Review Received!</h2>
          <p><strong>Rating:</strong> ${'⭐'.repeat(data.rating)}</p>
          <p><strong>From:</strong> ${data.reviewerName}</p>
          <p><strong>Comment:</strong> ${data.comment}</p>
          <a href="${config.CORS_ORIGIN}/profile" style="background: #ffc107; color: black; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Profile</a>
        `
      })
    },
    sms: {
      template: (data) => `New ${data.rating}-star review from ${data.reviewerName}: ${data.comment.substring(0, 50)}${data.comment.length > 50 ? '...' : ''}`
    }
  }
}

// Send notification through multiple channels
export const sendNotification = async (userId, type, data, channels = ['email', 'sms', 'push']) => {
  try {
    const notification = {
      id: Date.now().toString(),
      type,
      data,
      timestamp: new Date(),
      read: false
    }

    // Send real-time push notification
    if (channels.includes('push')) {
      getIO().to(userId.toString()).emit('notification', notification)
    }

    // Send email notification
    if (channels.includes('email') && config.EMAIL_USER) {
      const template = templates[type]?.email?.template(data)
      if (template) {
        await sendEmail(template)
      }
    }

    // Send SMS notification
    if (channels.includes('sms') && config.TWILIO_ACCOUNT_SID) {
      const template = templates[type]?.sms?.template(data)
      if (template) {
        await sendSMS(data.phone, template)
      }
    }

    return { success: true, notification }
  } catch (error) {
    console.error('Notification error:', error)
    return { success: false, error: error.message }
  }
}

// Send bulk notifications
export const sendBulkNotifications = async (userIds, type, data, channels = ['email', 'sms', 'push']) => {
  const results = []
  
  for (const userId of userIds) {
    const result = await sendNotification(userId, type, data, channels)
    results.push({ userId, ...result })
  }
  
  return results
}

// Send notification to laborers in specific area
export const notifyLaborersInArea = async (location, type, data, channels = ['email', 'sms', 'push']) => {
  try {
    const User = (await import('../models/User.js')).default
    
    // Find laborers in the area (simple location matching)
    const laborers = await User.find({
      role: 'laborer',
      isAvailable: true,
      isApproved: true,
      address: { $regex: location, $options: 'i' }
    }).select('_id email phone')

    const userIds = laborers.map(laborer => laborer._id)
    
    return await sendBulkNotifications(userIds, type, data, channels)
  } catch (error) {
    console.error('Error notifying laborers in area:', error)
    return { success: false, error: error.message }
  }
}

// Send reminder notifications
export const sendReminder = async (userId, reminderType, data) => {
  const reminderTemplates = {
    job_due: {
      email: {
        subject: 'Job Reminder - Labor Connect',
        template: (data) => ({
          subject: 'Job Reminder - Labor Connect',
          text: `Reminder: Your ${data.category} job in ${data.location} is due on ${data.dueDate}.`,
          html: `
            <h2>Job Reminder</h2>
            <p><strong>Job:</strong> ${data.category} in ${data.location}</p>
            <p><strong>Due Date:</strong> ${data.dueDate}</p>
            <p><strong>Client:</strong> ${data.clientName}</p>
            <a href="${config.CORS_ORIGIN}/jobs/${data.jobId}" style="background: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Job</a>
          `
        })
      },
      sms: {
        template: (data) => `Reminder: ${data.category} job in ${data.location} due on ${data.dueDate}`
      }
    }
  }

  const template = reminderTemplates[reminderType]
  if (template) {
    return await sendNotification(userId, NOTIFICATION_TYPES.REMINDER, data, ['email', 'sms'])
  }
}

export default {
  sendNotification,
  sendBulkNotifications,
  notifyLaborersInArea,
  sendReminder,
  NOTIFICATION_TYPES
}
