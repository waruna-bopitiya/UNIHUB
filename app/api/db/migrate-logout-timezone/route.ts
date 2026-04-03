import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Altering logouttime column to TIMESTAMP WITH TIME ZONE...')

    // Alter the logouttime column to TIMESTAMP WITH TIME ZONE
    await sql`
      ALTER TABLE users
      ALTER COLUMN logouttime TYPE TIMESTAMP WITH TIME ZONE
    `

    console.log('✅ logouttime column successfully altered to TIMESTAMP WITH TIME ZONE')

    return NextResponse.json(
      {
        success: true,
        message: 'Migration completed: logouttime column is now TIMESTAMP WITH TIME ZONE',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Migration error:', error)

    return NextResponse.json(
      { 
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
