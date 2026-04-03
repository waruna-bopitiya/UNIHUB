import { NextRequest, NextResponse } from 'next/server'
import { sendOTPEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { status: 'error', message: 'Email is required' },
        { status: 400 }
      )
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    
    console.log(`📧 Sending OTP to: ${email}`)
    console.log(`🔐 OTP: ${otp}`)

    // Send OTP email
    await sendOTPEmail(email, otp)

    return NextResponse.json({
      status: 'success',
      message: `OTP sent to ${email}`,
      email: email,
      otp: otp, // For testing only - shows in response
      expiresIn: '2 minutes'
    })
  } catch (error: any) {
    console.error('❌ OTP sending error:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to send OTP',
        error: error.message
      },
      { status: 500 }
    )
  }
}
