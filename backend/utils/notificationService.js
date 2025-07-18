import sendEmail from '../utils/sendEmail.js'
import sendSMS from '../utils/sendSMS.js'

/**
 * Notification service to abstract email/SMS notifications
 * @param {Object} options
 * @param {string} [options.email] - Recipient email (optional)
 * @param {string} [options.phone] - Recipient phone number in E.164 format (optional)
 * @param {string} options.subject - Subject (for email)
 * @param {string} options.message - Plain text message body
 * @param {string} [options.html] - Optional HTML content for email
 */
const notifyUser = async ({ email, phone, subject, message, html }) => {
  try {
    if (email) {
      await sendEmail({
        to: email,
        subject,
        text: message,
        html,
      })
    }

    if (phone) {
      await sendSMS({
        to: phone,
        body: message,
      })
    }

    // Future: Push notification, socket.io emit, etc.
    // e.g., socket.emit('notify', { message })

    console.log(`✅ Notification sent to ${email || phone}`)
  } catch (error) {
    console.error('❌ Notification failed:', error.message)
    throw new Error('Notification failed')
  }
}

export default notifyUser
