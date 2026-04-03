import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function POST() {
  try {
    console.log('🔄 Starting database migration...')

    // Check if file_path column exists
    const columnCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'resources' AND column_name = 'file_path'
    `

    if (columnCheck.length === 0) {
      console.log('Adding file_path column to resources table...')
      await sql`
        ALTER TABLE resources 
        ADD COLUMN file_path VARCHAR(500)
      `
      console.log('✅ file_path column added successfully')
    } else {
      console.log('✅ file_path column already exists')
    }

    // Check if download_count column exists
    const downloadCountCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'resources' AND column_name = 'download_count'
    `

    if (downloadCountCheck.length === 0) {
      console.log('Adding download_count column to resources table...')
      await sql`
        ALTER TABLE resources 
        ADD COLUMN download_count INTEGER NOT NULL DEFAULT 0
      `
      console.log('✅ download_count column added successfully')
    } else {
      console.log('✅ download_count column already exists')
    }

    // Verify resources table has all columns
    const allColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'resources'
      ORDER BY column_name
    `

    console.log('📋 Resources table columns:', allColumns.map((c: any) => `${c.column_name} (${c.data_type})`))

    return NextResponse.json({
      success: true,
      message: 'Database migration completed successfully',
      columns: allColumns,
    })
  } catch (error) {
    console.error('❌ Migration error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Migration failed',
      },
      { status: 500 }
    )
  }
}
