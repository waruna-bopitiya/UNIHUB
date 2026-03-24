import { sql } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'
import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// Initialize email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send OTP to email
async function sendOTPEmail(email: string, otp: string) {
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
              <p style="font-size: 12px; color: #999; margin: 10px 0 0 0;">This OTP will expire in 10 minutes</p>
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

    await transporter.sendMail(mailOptions)
    console.log(`✅ OTP email sent successfully to ${email}`)
    return true
  } catch (error) {
    console.error('❌ Failed to send OTP email:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    // Ensure tables exist
    await ensureTablesExist()

    const body = await request.json()
    const { email, action, otp, password } = body

    // STEP 1: Send OTP to email
    if (action === 'send-otp') {
      if (!email || !email.endsWith('@my.sliit.lk')) {
        return NextResponse.json(
          { error: 'Invalid email format. Must end with @my.sliit.lk' },
          { status: 400 }
        )
      }

      // Check if user exists
      const users = await sql`SELECT id FROM users WHERE email = ${email}`

      if (users.length === 0) {
        // Don't reveal if email exists for security
        return NextResponse.json(
          {
            message: 'If an account exists with this email, an OTP has been sent',
          },
          { status: 200 }
        )
      }

      // Clear old OTPs for this email
      await sql`DELETE FROM password_reset_otp WHERE email = ${email}`

      // Generate new OTP
      const newOTP = generateOTP()
      const expiryTime = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

      // Store OTP in database
      try {
        await sql`
          INSERT INTO password_reset_otp (email, otp, expires_at)
          VALUES (${email}, ${newOTP}, ${expiryTime.toISOString()})
        `
        console.log(`✅ OTP stored in database for ${email}`)
      } catch (dbError) {
        console.error('❌ Database error storing OTP:', dbError)
        throw new Error('Failed to store OTP in database')
      }

      // Send OTP via email
      try {
        await sendOTPEmail(email, newOTP)
      } catch (emailError) {
        console.error('❌ Email sending error:', emailError)
        // Don't fail if email fails in production, but log it
        // In development, you can comment this out to see the OTP
        // throw emailError
      }

      return NextResponse.json(
        {
          message: `OTP has been sent to ${email}. ${process.env.NODE_ENV === 'development' ? `(Dev: OTP is ${newOTP})` : ''} Please check your inbox.`,
        },
        { status: 200 }
      )
    }

    // STEP 2: Verify OTP
    if (action === 'verify-otp') {
      if (!email || !otp) {
        return NextResponse.json(
          { error: 'Email and OTP are required' },
          { status: 400 }
        )
      }

      // Check if OTP exists and is not expired
      const otpRecords = await sql`
        SELECT otp, expires_at FROM password_reset_otp 
        WHERE email = ${email} 
        ORDER BY created_at DESC 
        LIMIT 1
      `

      if (otpRecords.length === 0) {
        return NextResponse.json(
          { error: 'No OTP found. Please request a new one.' },
          { status: 400 }
        )
      }

      const { otp: storedOTP, expires_at } = otpRecords[0] as any

      // Check if OTP is expired
      if (new Date() > new Date(expires_at)) {
        await sql`DELETE FROM password_reset_otp WHERE email = ${email}`
        return NextResponse.json(
          { error: 'OTP has expired. Please request a new one.' },
          { status: 400 }
        )
      }

      // Check if OTP matches
      if (otp !== storedOTP) {
        return NextResponse.json(
          { error: 'Invalid OTP. Please try again.' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        {
          message: 'OTP verified successfully. You can now reset your password.',
        },
        { status: 200 }
      )
    }

    // STEP 3: Reset Password
    if (action === 'reset-password') {
      if (!email || !otp || !password) {
        return NextResponse.json(
          { error: 'Email, OTP, and password are required' },
          { status: 400 }
        )
      }

      if (password.length < 8) {
        return NextResponse.json(
          { error: 'Password must be at least 8 characters long' },
          { status: 400 }
        )
      }

      // Verify OTP one more time
      const otpRecords = await sql`
        SELECT otp, expires_at FROM password_reset_otp 
        WHERE email = ${email} 
        ORDER BY created_at DESC 
        LIMIT 1
      `

      if (otpRecords.length === 0) {
        return NextResponse.json(
          { error: 'No OTP found. Please request a new one.' },
          { status: 400 }
        )
      }

      const { otp: storedOTP, expires_at } = otpRecords[0] as any

      if (new Date() > new Date(expires_at) || otp !== storedOTP) {
        return NextResponse.json(
          { error: 'OTP has expired or is invalid. Please try again.' },
          { status: 400 }
        )
      }

      // Hash password
      const bcrypt = require('bcryptjs')
      const hashedPassword = await bcrypt.hash(password, 10)

      // Update user password
      await sql`
        UPDATE users 
        SET password = ${hashedPassword}, updated_at = NOW()
        WHERE email = ${email}
      `

      // Delete used OTP
      await sql`DELETE FROM password_reset_otp WHERE email = ${email}`

      return NextResponse.json(
        {
          message: 'Password has been reset successfully. You can now log in with your new password.',
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('❌ Forgot password error:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return NextResponse.json(
      { error: `Failed to process request: ${errorMessage}` },
      { status: 500 }
    )
  }
}
