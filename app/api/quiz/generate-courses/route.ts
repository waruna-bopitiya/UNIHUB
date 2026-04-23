import { NextResponse } from 'next/server'
import { sql, sqlWithRetry } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'
import { canonicalCourseRows } from '@/lib/course-catalog'


export async function POST() {
  try {
    await ensureTablesExist()

    console.log('🎓 Starting course generation for the canonical year and semester catalog...')

    const existingCourses = await sqlWithRetry(() =>
      sql`
        SELECT year, semester, subject_code, subject_name
        FROM subject4years
      `
    )

    console.log('Found', existingCourses?.length || 0, 'existing courses')

    const existingSet = new Set((existingCourses || []).map((course: any) => `${course.year}-${course.semester}-${course.subject_code}`))

    const coursesToInsert = canonicalCourseRows.filter((course) => !existingSet.has(`${course.year}-${course.semester}-${course.subject_code}`))

    console.log('📝 Generated', coursesToInsert.length, 'new canonical course combinations')

    let totalGenerated = 0

    if (coursesToInsert.length > 0) {
      console.log('Inserting courses one by one...')
      for (const course of coursesToInsert) {
        try {
          await sqlWithRetry(() =>
            sql`INSERT INTO subject4years (year, semester, subject_code, subject_name)
               VALUES (${course.year}, ${course.semester}, ${course.subject_code}, ${course.subject_name})
               ON CONFLICT (year, semester, subject_code) DO NOTHING`
          )
          totalGenerated++
        } catch (error) {
          console.warn('Failed to insert course:', course.subject_code, error)
        }
      }
      console.log('Course insertion completed')
    }

    // Get final count
    const finalCount = await sqlWithRetry(() =>
      sql`SELECT COUNT(*) as count FROM subject4years`
    )

    return NextResponse.json({
      status: 'success',
      message: 'Canonical courses generated successfully',
      data: {
        existingCourses: existingCourses?.length || 0,
        newCoursesGenerated: totalGenerated,
        totalCourses: finalCount[0]?.count || 0
      }
    })

  } catch (error) {
    console.error('❌ Error generating courses:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to generate courses',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    await ensureTablesExist()

    // Get current course distribution
    const distribution = await sqlWithRetry(() =>
      sql`
        SELECT 
          year,
          semester,
          COUNT(*) as course_count
        FROM subject4years
        GROUP BY year, semester
        ORDER BY year, semester
      `
    )

    const totalCourses = await sqlWithRetry(() =>
      sql`SELECT COUNT(*) as count FROM subject4years`
    )

    return NextResponse.json({
      status: 'success',
      data: {
        totalCourses: totalCourses[0]?.count || 0,
        distribution: distribution || []
      }
    })

  } catch (error) {
    console.error('❌ Error fetching course distribution:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to fetch course distribution',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
