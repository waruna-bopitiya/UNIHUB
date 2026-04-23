import { NextResponse } from 'next/server'
import { sql, sqlWithRetry } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'
import { canonicalCourseKeys } from '@/lib/course-catalog'

export async function POST() {
  try {
    await ensureTablesExist()

    console.log('Cleaning up courses that are outside the canonical year and semester map...')

    // Get all courses to analyze patterns
    const allCourses = await sqlWithRetry(() =>
      sql`
        SELECT year, semester, subject_code, subject_name
        FROM subject4years
        ORDER BY subject_code, year, semester
      `
    )

    console.log('Found', allCourses?.length || 0, 'total courses')

    const coursesToDelete: any[] = []
    for (const course of allCourses || []) {
      const courseKey = `${course.year}-${course.semester}-${course.subject_code}`

      if (!canonicalCourseKeys.has(courseKey)) {
        coursesToDelete.push(course)
      }
    }

    const totalToDelete = coursesToDelete.length

    console.log('Total courses to delete:', totalToDelete)

    // Delete the invalid courses
    if (coursesToDelete.length > 0) {
      for (const course of coursesToDelete) {
        try {
          await sqlWithRetry(() =>
            sql`DELETE FROM subject4years 
                WHERE year = ${course.year} 
                AND semester = ${course.semester} 
                AND subject_code = ${course.subject_code}`
          )
        } catch (error) {
          console.warn('Failed to delete course:', course.subject_code, error)
        }
      }
      console.log('Course cleanup completed')
    }

    // Get final count
    const finalCount = await sqlWithRetry(() =>
      sql`SELECT COUNT(*) as count FROM subject4years`
    )

    return NextResponse.json({
      status: 'success',
      message: 'Course cleanup completed',
      data: {
        originalCourses: allCourses?.length || 0,
        deletedCourses: totalToDelete,
        remainingCourses: finalCount[0]?.count || 0
      }
    })

  } catch (error) {
    console.error('Error during course cleanup:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to cleanup courses',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
