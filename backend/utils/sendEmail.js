import nodemailer from 'nodemailer'

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    // Create a test account using Ethereal Email (for development)
    // This will actually send emails that can be viewed in a web interface
    const testAccount = await nodemailer.createTestAccount();

    // Create transporter using test account
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    // Email options
    const mailOptions = {
      from: `"LabourConnect" <${testAccount.user}>`,
      to,
      subject,
      text,
      html,
    }

    // Send email
    const info = await transporter.sendMail(mailOptions)
    console.log(`✅ Email sent successfully!`)
    console.log(`📧 Message ID: ${info.messageId}`)
    console.log(`🔗 Preview URL: ${nodemailer.getTestMessageUrl(info)}`)
    
    // Return the preview URL for development
    return {
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info)
    };
  } catch (error) {
    console.error(`❌ Email error: ${error.message}`)
    throw new Error('Email could not be sent')
  }
}

export default sendEmail
