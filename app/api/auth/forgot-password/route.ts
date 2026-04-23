import { sql } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'
import { emailTransporter } from '@/lib/email'
import { NextRequest, NextResponse } from 'next/server'

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send OTP email with retry logic
async function sendOTPEmailWithRetry(email: string, otp: string, maxRetries: number = 3) {
  let lastError: any
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📧 Sending OTP email to ${email} (Attempt ${attempt}/${maxRetries})...`)
      
      const mailOptions = {
        from: process.env.GMAIL_EMAIL,
        to: email,
        subject: 'Kuppi Site OTP to Reset Your Password',
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
        <h2 style="color: #333; margin-top: 0; text-align: center;">Kuppi Site OTP to Reset Your Password</h2>
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
      
      const result = await emailTransporter.sendMail(mailOptions)
      console.log(`✅ OTP email sent successfully to ${email} on attempt ${attempt}`)
      console.log(`   Message ID: ${result.messageId}`)
      return true
    } catch (error: any) {
      lastError = error
      console.error(`❌ OTP email sending failed (Attempt ${attempt}/${maxRetries}):`, {
        message: error.message,
        code: error.code,
      })
      
      if (attempt < maxRetries) {
        // Wait longer between retries
        const waitTime = 300 * attempt // 300ms, 600ms, 900ms
        console.log(`⏳ Waiting ${waitTime}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
  }
  
  // All retries failed
  throw new Error(`Failed to send OTP email after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`)
}

export async function POST(request: NextRequest) {
  try {
    // Ensure tables exist
    await ensureTablesExist()

    const body = await request.json()
    let { email, action, otp, password } = body

    // Normalize email to lowercase for consistency
    if (email) {
      email = email.toLowerCase().trim()
    }

    // STEP 1: Send OTP to email
    if (action === 'send-otp') {
      if (!email || !email.endsWith('@my.sliit.lk')) {
        return NextResponse.json(
          { error: 'Invalid email format. Must end with @my.sliit.lk' },
          { status: 400 }
        )
      }

      // Check if user exists (case-insensitive)
      console.log(`🔍 Checking if user exists: ${email}`)
      const users = await sql`SELECT id FROM users WHERE LOWER(email) = LOWER(${email})`

      if (users.length === 0) {
        console.log(`❌ User not found: ${email}`)
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      console.log(`✅ User found: ${email}`)

      // Clear old OTPs for this email (case-insensitive)
      console.log(`🗑️  Clearing old OTPs for ${email}...`)
      try {
        const deleted = await sql`DELETE FROM password_reset_otp WHERE LOWER(email) = LOWER(${email})`
        console.log(`✅ Cleared old OTPs for ${email}`)
      } catch (clearError) {
        console.error('⚠️  Error clearing old OTPs (continuing anyway):', clearError)
      }

      // Wait to ensure deletion is complete
      await new Promise(resolve => setTimeout(resolve, 200))

      // Generate new OTP
      const newOTP = generateOTP()
      const expiryTime = new Date(Date.now() + 2 * 60 * 1000) // 2 minutes
      console.log(`🔐 Generated OTP: ${newOTP} (expires: ${expiryTime.toISOString()})`)

      // Store OTP in database with retry logic
      let otpStored = false
      let dbLastError: any
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`💾 Storing OTP in database (Attempt ${attempt}/3)...`)
          await sql`
            INSERT INTO password_reset_otp (email, otp, expires_at)
            VALUES (${email}, ${newOTP}, ${expiryTime.toISOString()})
          `
          console.log(`✅ OTP stored successfully in database`)
          otpStored = true
          break
        } catch (dbError) {
          dbLastError = dbError
          console.error(`❌ Database error (Attempt ${attempt}/3):`, {
            message: dbError instanceof Error ? dbError.message : String(dbError),
            code: (dbError as any)?.code,
          })
          if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, 300 * attempt))
          }
        }
      }

      if (!otpStored) {
        throw new Error(`Failed to store OTP in database: ${dbLastError?.message || 'Unknown error'}`)
      }

      // Send OTP via email with retry logic
      try {
        await sendOTPEmailWithRetry(email, newOTP, 3)
        console.log(`✅ OTP successfully sent to ${email}`)
      } catch (emailError) {
        console.error('❌ Final email sending error after all retries:', emailError)
        console.error('Email config check:', {
          hasGmailEmail: !!process.env.GMAIL_EMAIL,
          hasGmailPassword: !!process.env.GMAIL_APP_PASSWORD,
          gmailEmail: process.env.GMAIL_EMAIL,
        })
        throw emailError
      }

      return NextResponse.json(
        {
          message: `OTP has been sent to ${email}. Please check your inbox.`,
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

      console.log(`🔍 Verifying OTP for ${email}`)

      // Check if OTP exists and is not expired (case-insensitive)
      const otpRecords = await sql`
        SELECT otp, expires_at FROM password_reset_otp 
        WHERE LOWER(email) = LOWER(${email}) 
        ORDER BY created_at DESC 
        LIMIT 1
      `

      if (otpRecords.length === 0) {
        console.error(`❌ No OTP found for ${email}`)
        return NextResponse.json(
          { error: 'No OTP found. Please request a new one.' },
          { status: 400 }
        )
      }

      const { otp: storedOTP, expires_at } = otpRecords[0] as any

      console.log(`📝 Stored OTP: ${storedOTP}, Received OTP: ${otp}`)

      // Check if OTP is expired
      if (new Date() > new Date(expires_at)) {
        console.error(`⏰ OTP expired for ${email}`)
        await sql`DELETE FROM password_reset_otp WHERE LOWER(email) = LOWER(${email})`
        return NextResponse.json(
          { error: 'OTP has expired. Please request a new one.' },
          { status: 400 }
        )
      }

      // Check if OTP matches
      if (otp !== storedOTP) {
        console.error(`❌ OTP mismatch for ${email}`)
        return NextResponse.json(
          { error: 'Invalid OTP. Please try again.' },
          { status: 400 }
        )
      }

      console.log(`✅ OTP verified successfully for ${email}`)
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

      console.log(`🔐 Resetting password for ${email}`)

      // Verify OTP one more time (case-insensitive)
      const otpRecords = await sql`
        SELECT otp, expires_at FROM password_reset_otp 
        WHERE LOWER(email) = LOWER(${email}) 
        ORDER BY created_at DESC 
        LIMIT 1
      `

      if (otpRecords.length === 0) {
        console.error(`❌ No OTP found for password reset ${email}`)
        return NextResponse.json(
          { error: 'No OTP found. Please request a new one.' },
          { status: 400 }
        )
      }

      const { otp: storedOTP, expires_at } = otpRecords[0] as any

      if (new Date() > new Date(expires_at)) {
        console.error(`⏰ OTP expired during password reset for ${email}`)
        await sql`DELETE FROM password_reset_otp WHERE LOWER(email) = LOWER(${email})`
        return NextResponse.json(
          { error: 'OTP has expired or is invalid. Please try again.' },
          { status: 400 }
        )
      }

      if (otp !== storedOTP) {
        console.error(`❌ OTP mismatch during password reset for ${email}`)
        return NextResponse.json(
          { error: 'OTP has expired or is invalid. Please try again.' },
          { status: 400 }
        )
      }

      // Hash password
      const bcrypt = require('bcryptjs')
      const hashedPassword = await bcrypt.hash(password, 10)

      // Update user password (case-insensitive)
      await sql`
        UPDATE users 
        SET password = ${hashedPassword}, updated_at = NOW()
        WHERE LOWER(email) = LOWER(${email})
      `

      // Delete used OTP (case-insensitive)
      await sql`DELETE FROM password_reset_otp WHERE LOWER(email) = LOWER(${email})`

      console.log(`✅ Password reset successfully for ${email}`)
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
