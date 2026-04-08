import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    console.log('🔌 Testing database connection...')
    console.log('📍 DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET')
    
    // Simple test query
    const result = await sql`SELECT NOW() as current_time, version() as db_version`
    
    console.log('✅ Database connection successful!')
    return NextResponse.json({
      status: 'success',
      message: 'Database connection is working',
      data: {
        timestamp: new Date().toISOString(),
        databaseTime: result[0].current_time,
        databaseVersion: result[0].db_version,
      },
    })
  } catch (error: any) {
    console.error('❌ Database connection failed:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Database connection failed',
        error: error.message,
        details: {
          code: error.code,
          hint: 'Check if your Neon database is active and the DATABASE_URL is correct',
        },
      },
      { status: 500 }
    )
  }
}
