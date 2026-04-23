import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Gmail SMTP configuration...')

    // Check environment variables
    const gmailEmail = process.env.GMAIL_EMAIL
    const gmailPassword = process.env.GMAIL_APP_PASSWORD

    console.log('📧 Email config:')
    console.log('  - GMAIL_EMAIL:', gmailEmail)
    console.log('  - GMAIL_APP_PASSWORD length:', gmailPassword?.length)

    if (!gmailEmail || !gmailPassword) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Missing Gmail credentials in .env.local',
          missing: {
            email: !gmailEmail,
            password: !gmailPassword,
          },
        },
        { status: 400 }
      )
    }

    // Create transporter
    console.log('🔧 Creating Gmail transporter...')
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailEmail,
        pass: gmailPassword,
      },
    })

    // Verify connection
    console.log('🔍 Verifying SMTP connection...')
    await transporter.verify()
    console.log('✅ SMTP connection verified')

    // Send test email
    console.log('📤 Sending test email...')
    const testResult = await transporter.sendMail({
      from: gmailEmail,
      to: gmailEmail,
      subject: 'Kuppi Site - Test Email',
      html: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
    <div style="background-color: white; max-width: 600px; margin: 0 auto; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <h1 style="color: #667eea; text-align: center; margin-top: 0;">Kuppi Site</h1>
      <h2 style="color: #333; text-align: center;">Email Test Successful ✅</h2>
      <p style="color: #666; font-size: 16px; line-height: 1.6;">
        This is a test email from Kuppi Site to verify Gmail SMTP is working correctly.
      </p>
      <p style="color: #666; font-size: 16px; line-height: 1.6;">
        If you received this email, your email configuration is ready for OTP and other notifications!
      </p>
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <p style="color: #999; font-size: 12px; margin: 0;">
          <strong>Test Details:</strong><br>
          Sent at: ${new Date().toLocaleString()}<br>
          Status: Working ✅
        </p>
      </div>
      <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
        Kuppi Site - Student Learning Platform
      </p>
    </div>
  </body>
</html>`,
    })

    console.log('✅ Test email sent successfully')
    console.log('📨 Email details:', {
      messageId: testResult.messageId,
      response: testResult.response,
    })

    return NextResponse.json({
      status: 'success',
      message: 'Gmail SMTP is working perfectly! ✅',
      details: {
        email: gmailEmail,
        smtpVerified: true,
        testEmailSent: true,
        messageId: testResult.messageId,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error('❌ Gmail test error:', error)

    return NextResponse.json(
      {
        status: 'error',
        message: 'Gmail SMTP configuration failed',
        error: error.message,
        details: {
          errorCode: error.code,
          errorResponse: error.response,
          suggestions: [
            'Check GMAIL_EMAIL and GMAIL_APP_PASSWORD in .env.local',
            'Verify Gmail App Password (not regular password)',
            'Enable "Allow less secure apps" if using regular password',
            'Check email quota limits',
            'Ensure password has no leading/trailing spaces',
          ],
        },
      },
      { status: 500 }
    )
  }
}
