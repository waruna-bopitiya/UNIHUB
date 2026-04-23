import { NextResponse } from 'next/server'
import { sql, sqlWithRetry } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'

export async function GET() {
  try {
    await ensureTablesExist()

    console.log('📚 Fetching all courses from subject4years...')

    // Get all courses grouped by year and semester from database
    const results = await sqlWithRetry(() =>
      sql`
        SELECT 
          year,
          semester,
          subject_code,
          subject_name
        FROM subject4years
        ORDER BY year, semester, subject_code
      `
    )

    console.log('✅ Retrieved', results?.length || 0, 'courses from database')

    const courses = (results || []).map((row: any) => ({
      year: row.year,
      semester: row.semester,
      code: row.subject_code,
      name: row.subject_name,
    }))

    return NextResponse.json({
      status: 'success',
      data: courses,
    })
  } catch (error) {
    console.error('❌ Error fetching courses from database:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to fetch courses',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
