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
      subject: 'UniHub - Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">UniHub</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p style="color: #666; font-size: 16px;">Hi,</p>
            <p style="color: #666; font-size: 16px;">You requested to reset your password. Use the OTP below to proceed:</p>
            
            <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <p style="font-size: 12px; color: #999; margin: 0 0 10px 0;">Your One-Time Password (OTP)</p>
              <p style="font-size: 48px; font-weight: bold; color: #667eea; letter-spacing: 5px; margin: 0;">${otp}</p>
              <p style="font-size: 12px; color: #999; margin: 10px 0 0 0;">This OTP will expire in 2 minutes</p>
            </div>
            
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>⚠️ Security Notice:</strong> Never share this OTP with anyone. UniHub support will never ask for it.
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 20px;">If you didn't request this, please ignore this email.</p>
            <p style="color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px;">
              UniHub - Student Learning Platform<br>
              © 2026 All rights reserved
            </p>
          </div>
        </div>
      `,
    }

    await emailTransporter.sendMail(mailOptions)
    console.log(`✅ OTP email sent successfully to ${email}`)
    return true
  } catch (error) {
    console.error('❌ Failed to send OTP email:', error)
    throw error
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
