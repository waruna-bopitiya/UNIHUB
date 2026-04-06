import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// GET /api/resources/user-filters - Get available years, semesters, modules for current user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const uploaderId = searchParams.get('uploaderId')

    if (!uploaderId) {
      return NextResponse.json(
        { error: 'uploaderId is required' },
        { status: 400 }
      )
    }

    console.log('🔍 Fetching filter options for user:', uploaderId)

    // Get distinct years for this user
    const years = await sql`
      SELECT DISTINCT year FROM resources 
      WHERE uploader_id = ${uploaderId} AND year IS NOT NULL
      ORDER BY year DESC
    `

    // Get distinct semesters for this user
    const semesters = await sql`
      SELECT DISTINCT semester FROM resources 
      WHERE uploader_id = ${uploaderId} AND semester IS NOT NULL
      ORDER BY semester
    `

    // Get distinct modules for this user
    const modules = await sql`
      SELECT DISTINCT module_name FROM resources 
      WHERE uploader_id = ${uploaderId} AND module_name IS NOT NULL
      ORDER BY module_name
    `

    console.log('✅ Filter options fetched:', {
      yearsCount: years.length,
      semestersCount: semesters.length,
      modulesCount: modules.length
    })

    return NextResponse.json({
      years: years.map(y => ({ value: y.year, label: y.year })),
      semesters: semesters.map(s => ({ value: s.semester, label: s.semester })),
      modules: modules.map(m => ({ value: m.module_name, label: m.module_name }))
    })
  } catch (error) {
    console.error('Error fetching user filter options:', error)
    return NextResponse.json({
      years: [],
      semesters: [],
      modules: []
    }, { status: 200 })
  }
}
