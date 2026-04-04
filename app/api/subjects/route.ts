import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const semester = searchParams.get('semester')

    // Get all years if no filter
    if (!year && !semester) {
      const years = await sql`
        SELECT DISTINCT year FROM subject4years ORDER BY year
      `
      return NextResponse.json(
        years.map((y: any) => ({ value: y.year.toString(), label: `${y.year}${y.year === 1 ? 'st' : y.year === 2 ? 'nd' : y.year === 3 ? 'rd' : 'th'} Year` }))
      )
    }

    // Get semesters for a year
    if (year && !semester) {
      const semesters = await sql`
        SELECT DISTINCT semester FROM subject4years WHERE year = ${parseInt(year)} ORDER BY semester
      `
      return NextResponse.json(
        semesters.map((s: any) => ({ value: s.semester.toString(), label: `${s.semester}${s.semester === 1 ? 'st' : 'nd'} Semester` }))
      )
    }

    // Get subjects for year and semester
    if (year && semester) {
      const subjects = await sql`
        SELECT subject_code, subject_name 
        FROM subject4years 
        WHERE year = ${parseInt(year)} 
          AND semester = ${parseInt(semester)}
        ORDER BY subject_code
      `
      return NextResponse.json(
        subjects.map((s: any) => ({ value: s.subject_code, label: s.subject_name }))
      )
    }

    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
  } catch (error) {
    console.error('Error fetching subjects:', error)
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 })
  }
}
