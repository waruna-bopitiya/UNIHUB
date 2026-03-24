import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { emailTransporter } from '@/lib/email'
import { ensureTablesExist } from '@/lib/db-init'

// Generate student ID in format STU00000001
async function generateStudentId() {
  try {
    const result = await sql`SELECT COUNT(*) as count FROM users`
    const count = (result[0] as any).count
    const nextId = count + 1
    return `STU${String(nextId).padStart(8, '0')}`
  } catch {
    // If table doesn't exist yet, start from 1
    return 'STU00000001'
  }
}

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
        subject: 'UniHub OTP to Verify Your Email',
        html: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
    <div style="background-color: white; max-width: 600px; margin: 0 auto; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">UniHub</h1>
      </div>
      <div style="padding: 30px 20px;">
        <h2 style="color: #333; margin-top: 0; text-align: center;">UniHub OTP to Verify Your Email</h2>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          Welcome to UniHub! Use the code below to verify your email address and complete your signup:
        </p>
        <div style="background-color: #f9f9f9; border: 2px solid #667eea; border-radius: 6px; padding: 25px; text-align: center; margin: 25px 0;">
          <p style="color: #999; font-size: 12px; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 1px;">Your Code</p>
          <p style="font-size: 42px; font-weight: bold; color: #667eea; margin: 0; letter-spacing: 8px; font-family: monospace;">${otp}</p>
          <p style="color: #999; font-size: 12px; margin: 15px 0 0 0;">Expires in 2 minutes</p>
        </div>
        <div style="background-color: #fef8e7; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
            <strong>Security:</strong> Never share this code. UniHub staff will never ask for it.
          </p>
        </div>
        <p style="color: #666; font-size: 14px; line-height: 1.6;">
          If you didn't request this, please ignore this email and don't share this code with anyone.
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
          UniHub - Student Learning Platform<br>
          © 2026 All rights reserved
        </p>
      </div>
    </div>
  </body>
</html>`,
      }
      
      const result = await emailTransporter.sendMail(mailOptions)
      console.log(`✅ OTP email sent successfully to ${email} on attempt ${attempt}`)
      return true
    } catch (error: any) {
      lastError = error
      console.error(`❌ OTP email sending failed (Attempt ${attempt}/${maxRetries}):`, error.message)
      
      if (attempt < maxRetries) {
        const waitTime = 300 * attempt
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
  }
  
  throw new Error(`Failed to send OTP email after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`)
}

export async function POST(request: NextRequest) {
  try {
    await ensureTablesExist()
    
    const body = await request.json()
    let { firstName, secondName, email, countryCode, phoneNumber, address, gender, yearOfUniversity, semester, password, action, otp } = body

    // Normalize email to lowercase
    if (email) {
      email = email.toLowerCase().trim()
    }

    // STEP 1: Send OTP
    if (action === 'send-otp') {
      // Validate required fields for form
      if (!firstName || !email || !countryCode || !phoneNumber || !yearOfUniversity || !semester || !password) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        )
      }

      // Validate email format
      if (!email.endsWith('@my.sliit.lk')) {
        return NextResponse.json(
          { error: 'Email must end with @my.sliit.lk' },
          { status: 400 }
        )
      }

      // Validate password length
      if (password.length < 8) {
        return NextResponse.json(
          { error: 'Password must be at least 8 characters' },
          { status: 400 }
        )
      }

      // Check if email already exists (case-insensitive)
      const existingUser = await sql`SELECT id FROM users WHERE LOWER(email) = LOWER(${email})`
      if (existingUser.length > 0) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 409 }
        )
      }

      // Generate OTP
      const newOTP = generateOTP()
      const expiryTime = new Date(Date.now() + 2 * 60 * 1000) // 2 minutes
      console.log(`🔐 Generated OTP: ${newOTP}`)

      // Store OTP in database (for signup verification)
      try {
        await sql`
          INSERT INTO signup_otp (email, otp, expires_at)
          VALUES (${email}, ${newOTP}, ${expiryTime.toISOString()})
        `
        console.log(`✅ OTP stored in database`)
      } catch (dbError: any) {
        console.error('Database error storing OTP:', dbError.message)
        // Continue anyway - we'll try to send email
      }

      // Send OTP email
      try {
        await sendOTPEmailWithRetry(email, newOTP, 3)
      } catch (emailError) {
        console.error('Email sending failed:', emailError)
        throw emailError
      }

      return NextResponse.json(
        {
          message: `OTP sent to ${email}. Please check your inbox.`,
        },
        { status: 200 }
      )
    }

    // STEP 2: Verify OTP and Create Account
    if (action === 'verify-otp-and-create') {
      if (!email || !otp) {
        return NextResponse.json(
          { error: 'Email and OTP are required' },
          { status: 400 }
        )
      }

      // Verify OTP exists and is valid
      const otpRecords = await sql`
        SELECT otp, expires_at FROM signup_otp 
        WHERE LOWER(email) = LOWER(${email}) 
        ORDER BY created_at DESC 
        LIMIT 1
      `

      if (otpRecords.length === 0) {
        return NextResponse.json(
          { error: 'OTP not found. Please request a new one.' },
          { status: 400 }
        )
      }

      const { otp: storedOTP, expires_at } = otpRecords[0] as any

      // Check if OTP is expired
      if (new Date() > new Date(expires_at)) {
        await sql`DELETE FROM signup_otp WHERE LOWER(email) = LOWER(${email})`
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

      // OTP verified - now create the account
      if (!firstName || !email || !countryCode || !phoneNumber || !yearOfUniversity || !semester || !password) {
        return NextResponse.json(
          { error: 'Missing account information' },
          { status: 400 }
        )
      }

      // Check if email already exists (in case it was registered during OTP process)
      const existingUser = await sql`SELECT id FROM users WHERE LOWER(email) = LOWER(${email})`
      if (existingUser.length > 0) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 409 }
        )
      }

      // Combine country code and phone number
      const fullPhoneNumber = `${countryCode} ${phoneNumber}`

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Generate student ID
      const studentId = await generateStudentId()

      // Insert user into database
      const result = await sql`
        INSERT INTO users (id, first_name, second_name, email, phone_number, country_code, address, gender, year_of_university, semester, password, created_at)
        VALUES (${studentId}, ${firstName}, ${secondName}, ${email}, ${fullPhoneNumber}, ${countryCode}, ${address}, ${gender}, ${yearOfUniversity}, ${semester}, ${hashedPassword}, NOW())
        RETURNING id
      `

      // Delete OTP after successful account creation
      await sql`DELETE FROM signup_otp WHERE LOWER(email) = LOWER(${email})`

      return NextResponse.json(
        {
          message: 'Account created successfully',
          studentId: result[0].id,
        },
        { status: 201 }
      )
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Signup error:', error)
    
    let errorMessage = 'An error occurred during signup'
    let statusCode = 500

    if (error.message) {
      const msg = error.message.toLowerCase()
      
      if (msg.includes('connection') || msg.includes('econnrefused')) {
        errorMessage = 'Database connection failed'
        statusCode = 503
      } else if (msg.includes('unique') || msg.includes('duplicate') || msg.includes('email')) {
        errorMessage = 'This email is already registered'
        statusCode = 409
      } else if (msg.includes('column') || msg.includes('does not exist')) {
        errorMessage = 'Database schema error'
        statusCode = 500
      } else {
        errorMessage = error.message || 'An error occurred during signup'
        statusCode = 500
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    )
  }
}
