import { sql } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const semester = searchParams.get('semester')

    let subjects
    
    if (year && semester) {
      const yearNum = parseInt(year)
      const semesterNum = parseInt(semester)
      subjects = await sql`SELECT DISTINCT year, semester, subject_code, subject_name 
        FROM subject4years 
        WHERE year = ${yearNum} AND semester = ${semesterNum}
        ORDER BY subject_code ASC`
    } else if (year) {
      const yearNum = parseInt(year)
      subjects = await sql`SELECT DISTINCT year, semester, subject_code, subject_name 
        FROM subject4years 
        WHERE year = ${yearNum}
        ORDER BY semester ASC, subject_code ASC`
    } else {
      subjects = await sql`SELECT DISTINCT year, semester, subject_code, subject_name 
        FROM subject4years 
        ORDER BY year ASC, semester ASC, subject_code ASC`
    }
    
    return Response.json(subjects)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Database error:', errorMessage)
    return Response.json(
      { 
        error: 'Failed to fetch subjects', 
        details: errorMessage
      }, 
      { status: 500 }
    )
  }
}
