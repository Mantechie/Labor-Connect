import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const fromPhone = process.env.TWILIO_PHONE

// Only initialize Twilio client if credentials are available
let client = null;
if (accountSid && authToken && accountSid.startsWith('AC')) {
  try {
    client = twilio(accountSid, authToken);
  } catch (error) {
    console.warn('⚠️ Twilio client initialization failed:', error.message);
  }
}

const sendSMS = async ({ to, message }) => {
  try {
    // If Twilio is not configured, log the message instead
    if (!client) {
      console.log(`📱 SMS (Development Mode): ${message}`);
      console.log(`📱 To: ${to}`);
      return { success: true, mode: 'development' };
    }

    const twilioMessage = await client.messages.create({
      body: message,
      from: fromPhone,
      to, // Should be in E.164 format, e.g., +919876543210
    })

    console.log(`✅ SMS sent: ${twilioMessage.sid}`)
    return { success: true, sid: twilioMessage.sid };
  } catch (error) {
    console.error(`❌ SMS error: ${error.message}`)
    
    // In development, don't fail completely, just log
    if (process.env.NODE_ENV === 'development') {
      console.log(`📱 SMS (Fallback Mode): ${message}`);
      console.log(`📱 To: ${to}`);
      return { success: true, mode: 'fallback' };
    }
    
    throw new Error('SMS could not be sent')
  }
}

export default sendSMS
