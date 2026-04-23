import { NextResponse } from 'next/server'
import { sql, sqlWithRetry } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'
import { canonicalCourseRows } from '@/lib/course-catalog'

export async function POST() {
  try {
    await ensureTablesExist()

    console.log('Checking canonical year and semester courses for missing rows...')

    // Get all existing courses
    const existingCourses = await sqlWithRetry(() =>
      sql`
        SELECT year, semester, subject_code, subject_name
        FROM subject4years
        ORDER BY year, semester, subject_code
      `
    )

    console.log('Found', existingCourses?.length || 0, 'existing courses')

    // Create a set of existing course combinations
    const existingSet = new Set(
      (existingCourses || []).map((course: any) => 
        `${course.year}-${course.semester}-${course.subject_code}`
      )
    )

    const coursesToAdd = canonicalCourseRows.filter(course => {
      const courseKey = `${course.year}-${course.semester}-${course.subject_code}`
      return !existingSet.has(courseKey)
    })

    console.log('Found', coursesToAdd.length, 'missing courses to add')

    // Add the missing courses
    let addedCount = 0
    if (coursesToAdd.length > 0) {
      console.log('Adding missing courses...')
      
      for (const course of coursesToAdd) {
        try {
          await sqlWithRetry(() =>
            sql`INSERT INTO subject4years (year, semester, subject_code, subject_name)
               VALUES (${course.year}, ${course.semester}, ${course.subject_code}, ${course.subject_name})
               ON CONFLICT (year, semester, subject_code) DO NOTHING`
          )
          addedCount++
          console.log(`Added: ${course.subject_code} to Year ${course.year} Semester ${course.semester}`)
        } catch (error) {
          console.warn('Failed to add course:', course.subject_code, error)
        }
      }
    }

    // Get final count
    const finalCount = await sqlWithRetry(() =>
      sql`SELECT COUNT(*) as count FROM subject4years`
    )

    return NextResponse.json({
      status: 'success',
      message: 'Missing courses added successfully',
      data: {
        originalCourses: existingCourses?.length || 0,
        missingFound: coursesToAdd.length,
        coursesAdded: addedCount,
        totalCourses: finalCount[0]?.count || 0
      }
    })

  } catch (error) {
    console.error('Error adding missing courses:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to add missing courses',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
