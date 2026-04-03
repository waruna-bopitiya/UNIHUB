import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Checking if logouttime column exists...')

    // Try to add logouttime column if it doesn't exist
    await sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS logouttime TIMESTAMP
    `

    console.log('✅ logouttime column added successfully (or already exists)')

    return NextResponse.json(
      {
        success: true,
        message: 'Migration completed: logouttime column is ready',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Migration error:', error)
    
    // Check if column already exists
    if (error instanceof Error && error.message.includes('exists')) {
      return NextResponse.json(
        {
          success: true,
          message: 'Column already exists',
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
