import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@neondatabase/serverless'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json(
        { status: 'error', message: 'Email and OTP required' },
        { status: 400 }
      )
    }

    console.log(`🔍 Verifying OTP for ${email}...`)

    // Check if OTP exists in database
    const otpRecord = await db.query(
      sql`SELECT * FROM password_reset_otp WHERE email = ${email} AND otp = ${otp}`
    )

    if (otpRecord.rows.length === 0) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'OTP not found or incorrect',
          email: email,
        },
        { status: 404 }
      )
    }

    const record = otpRecord.rows[0]
    const now = new Date()
    const expiresAt = new Date(record.expires_at)

    console.log(`📋 OTP Record found:`)
    console.log(`  - Email: ${record.email}`)
    console.log(`  - OTP: ${record.otp}`)
    console.log(`  - Expires at: ${record.expires_at}`)
    console.log(`  - Now: ${now.toISOString()}`)
    console.log(`  - Expired: ${now > expiresAt}`)

    if (now > expiresAt) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'OTP has expired',
          email: email,
          expiresAt: record.expires_at,
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      status: 'success',
      message: 'OTP is valid and not expired! ✅',
      email: email,
      otp: otp,
      expiresAt: record.expires_at,
      createdAt: record.created_at,
    })
  } catch (error: any) {
    console.error('❌ OTP verification error:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to verify OTP',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
