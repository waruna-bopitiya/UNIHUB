import nodemailer from 'nodemailer'

// Initialize email transporter
export const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

// Send OTP email
export async function sendOTPEmail(email: string, otp: string) {
  try {
    const mailOptions = {
      from: process.env.GMAIL_EMAIL,
      to: email,
      subject: 'Kuppi Site - Password Reset OTP',
      html: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
    <div style="background-color: white; max-width: 600px; margin: 0 auto; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Kuppi Site</h1>
      </div>
      <div style="padding: 30px 20px;">
        <h2 style="color: #333; margin-top: 0; text-align: center;">Password Reset OTP</h2>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          You requested to reset your password. Use the code below to proceed:
        </p>
        <div style="background-color: #f9f9f9; border: 2px solid #667eea; border-radius: 6px; padding: 25px; text-align: center; margin: 25px 0;">
          <p style="color: #999; font-size: 12px; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 1px;">Your Code</p>
          <p style="font-size: 42px; font-weight: bold; color: #667eea; margin: 0; letter-spacing: 8px; font-family: monospace;">${otp}</p>
          <p style="color: #999; font-size: 12px; margin: 15px 0 0 0;">Expires in 2 minutes</p>
        </div>
        <div style="background-color: #fef8e7; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
            <strong>Security:</strong> Never share this code. Kuppi Site staff will never ask for it.
          </p>
        </div>
        <p style="color: #666; font-size: 14px; line-height: 1.6;">
          If you didn't request this, please ignore this email and don't share this code with anyone.
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
          Kuppi Site - Student Learning Platform<br>
          © 2026 All rights reserved
        </p>
      </div>
    </div>
  </body>
</html>`,
    }

    await emailTransporter.sendMail(mailOptions)
    console.log(`✅ OTP email sent successfully to ${email}`)
    return true
  } catch (error) {
    console.error('❌ Failed to send OTP email:', error)
    throw error
  }
}

// Send message notification email
export async function sendMessageNotificationEmail(
  recipientEmail: string,
  recipientName: string,
  senderName: string,
  messagePreview: string
) {
  try {
    const mailOptions = {
      from: process.env.GMAIL_EMAIL,
      to: recipientEmail,
      subject: `New Message from ${senderName} - Kuppi Site`,
      html: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
    <div style="background-color: white; max-width: 600px; margin: 0 auto; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Kuppi Site</h1>
      </div>
      <div style="padding: 30px 20px;">
        <h2 style="color: #333; margin-top: 0;">Hi ${recipientName},</h2>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          You have received a new message from <strong>${senderName}</strong>
        </p>
        <div style="background-color: #f9f9f9; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px;">
          <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">
            "${messagePreview}"
          </p>
        </div>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          Reply to messages and continue the conversation in Kuppi Site
        </p>
        <div style="text-align: center; margin: 30px 0;">
           <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://kuppi.site'}" 
             style="display: inline-block; background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Open Kuppi Site Chat
          </a>
        </div>
        <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
          Kuppi Site - Student Learning Platform<br>
          © 2026 All rights reserved
        </p>
      </div>
    </div>
  </body>
</html>`,
    }

    await emailTransporter.sendMail(mailOptions)
    console.log(`✅ Message notification email sent to ${recipientEmail}`)
    return true
  } catch (error) {
    console.error('❌ Failed to send message notification email:', error)
    // Don't throw - let the message be saved even if email fails
    return false
  }
}

// Verify email transporter is working
export async function verifyEmailTransporter() {
  try {
    await emailTransporter.verify()
    console.log('✅ Email transporter verified and ready')
    return true
  } catch (error) {
    console.error('❌ Email transporter verification failed:', error)
    throw error
  }
}
