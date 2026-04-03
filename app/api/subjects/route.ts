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
      subjects = await sql`SELECT DISTINCT subject_code, subject_name FROM subject4years 
        WHERE year = ${yearNum} AND semester = ${semesterNum} 
        ORDER BY subject_code ASC`
    } else {
      subjects = await sql`SELECT DISTINCT subject_code, subject_name FROM subject4years ORDER BY subject_code ASC`
    }
    
    // Transform the data to match the format expected by the frontend
    const formattedSubjects = subjects.map((subject: any) => {
      return {
        id: subject.subject_code || '',
        name: subject.subject_name || '',
      }
    })

    return Response.json(formattedSubjects)
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
