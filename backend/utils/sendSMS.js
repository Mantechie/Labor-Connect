import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const fromPhone = process.env.TWILIO_PHONE

const client = twilio(accountSid, authToken)

const sendSMS = async ({ to, body }) => {
  try {
    const message = await client.messages.create({
      body,
      from: fromPhone,
      to, // Should be in E.164 format, e.g., +919876543210
    })

    console.log(`✅ SMS sent: ${message.sid}`)
  } catch (error) {
    console.error(`❌ SMS error: ${error.message}`)
    throw new Error('SMS could not be sent')
  }
}

export default sendSMS
