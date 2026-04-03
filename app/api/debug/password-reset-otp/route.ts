import { sql } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Starting database debug...')

    // Step 1: Ensure tables exist
    console.log('Step 1: Ensuring tables exist...')
    await ensureTablesExist()
    console.log('✅ Tables ensured')

    // Step 2: Check if password_reset_otp table exists
    console.log('Step 2: Checking if password_reset_otp table exists...')
    const tableCheck = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'password_reset_otp'
    `
    console.log('Table exists:', tableCheck.length > 0)

    // Step 3: Try to insert a test OTP
    console.log('Step 3: Testing OTP insertion...')
    const testEmail = 'debug@my.sliit.lk'
    const testOTP = '123456'
    const testExpiry = new Date(Date.now() + 2 * 60 * 1000).toISOString()

    // First delete any existing test OTP
    await sql`DELETE FROM password_reset_otp WHERE email = ${testEmail}`
    console.log('Deleted old test OTP')

    // Insert test OTP
    const insertResult = await sql`
      INSERT INTO password_reset_otp (email, otp, expires_at)
      VALUES (${testEmail}, ${testOTP}, ${testExpiry})
      RETURNING *
    `
    console.log('✅ Test OTP inserted:', insertResult)

    // Step 4: Try to retrieve the test OTP
    console.log('Step 4: Retrieving test OTP...')
    const retrieveResult = await sql`
      SELECT * FROM password_reset_otp WHERE email = ${testEmail}
    `
    console.log('✅ Retrieved OTP:', retrieveResult)

    // Step 5: Clean up
    await sql`DELETE FROM password_reset_otp WHERE email = ${testEmail}`
    console.log('Cleaned up test OTP')

    return NextResponse.json({
      status: 'success',
      message: 'All database tests passed! ✅',
      checks: {
        tableExists: tableCheck.length > 0,
        insertWorked: insertResult.length > 0,
        retrieveWorked: retrieveResult.length > 0,
      },
      details: {
        testEmailUsed: testEmail,
        insertedRecord: insertResult[0],
        retrievedRecord: retrieveResult[0],
      },
    })
  } catch (error: any) {
    console.error('❌ Debug error:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: error.message || 'Database debug failed',
        error: error.toString(),
        details: {
          errorCode: error.code,
          errorMessage: error.message,
          fullError: JSON.stringify(error, null, 2),
        },
      },
      { status: 500 }
    )
  }
}
