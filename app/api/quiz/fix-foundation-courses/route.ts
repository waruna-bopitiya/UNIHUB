import { NextResponse } from 'next/server'
import { sql, sqlWithRetry } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'
import { canonicalCourseKeys } from '@/lib/course-catalog'

export async function POST() {
  try {
    await ensureTablesExist()

    console.log('Fixing foundation courses against the canonical catalog...')

    const existingCourses = await sqlWithRetry(() =>
      sql`
        SELECT year, semester, subject_code
        FROM subject4years
      `
    )

    const coursesToDelete = (existingCourses || []).filter((course: any) => {
      const courseKey = `${course.year}-${course.semester}-${course.subject_code}`
      return !canonicalCourseKeys.has(courseKey)
    })

    let deletedCount = 0

    for (const course of coursesToDelete) {
      try {
        await sqlWithRetry(() =>
          sql`DELETE FROM subject4years 
              WHERE year = ${course.year} 
              AND semester = ${course.semester} 
              AND subject_code = ${course.subject_code}`
        )
        
        deletedCount += 1
        console.log(`Deleted ${course.subject_code} from Year ${course.year} Semester ${course.semester}`)
      } catch (error) {
        console.warn('Failed to delete course:', course.subject_code, error)
      }
    }

    console.log('Foundation course fix completed')

    // Get final count
    const finalCount = await sqlWithRetry(() =>
      sql`SELECT COUNT(*) as count FROM subject4years`
    )

    return NextResponse.json({
      status: 'success',
      message: 'Foundation courses fixed successfully',
      data: {
        deletedCourses: deletedCount,
        remainingCourses: finalCount[0]?.count || 0
      }
    })

  } catch (error) {
    console.error('Error fixing foundation courses:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to fix foundation courses',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
