import nodemailer from 'nodemailer'

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    // 1. Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail', // e.g., Gmail, or use custom SMTP
      auth: {
        user: process.env.EMAIL_USER, // your email
        pass: process.env.EMAIL_PASS, // app password or SMTP password
      },
    })

    // 2. Email options
    const mailOptions = {
      from: `"LabourConnect" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html, // Optional: for styled OTP or rich content
    }

    // 3. Send email
    const info = await transporter.sendMail(mailOptions)
    console.log(`✅ Email sent: ${info.response}`)
  } catch (error) {
    console.error(`❌ Email error: ${error.message}`)
    throw new Error('Email could not be sent')
  }
}

export default sendEmail
