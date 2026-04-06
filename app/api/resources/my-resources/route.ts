import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// GET /api/resources/my-resources - Get logged-in user's resources
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const uploaderId = searchParams.get('uploaderId')
    const year = searchParams.get('year')
    const semester = searchParams.get('semester')
    const moduleName = searchParams.get('moduleName')

    if (!uploaderId) {
      return NextResponse.json(
        { error: 'uploaderId is required' },
        { status: 400 }
      )
    }

    console.log('📝 Fetching user resources:', { uploaderId, year, semester, moduleName })

    let resources: any[] = []

    // Build dynamic query based on filters
    let query = 'SELECT * FROM resources WHERE uploader_id = $1'
    const params: any[] = [uploaderId]

    if (year) {
      query += ` AND year = $${params.length + 1}`
      params.push(year)
    }
    if (semester) {
      query += ` AND semester = $${params.length + 1}`
      params.push(semester)
    }
    if (moduleName) {
      query += ` AND module_name = $${params.length + 1}`
      params.push(moduleName)
    }

    query += ' ORDER BY created_at DESC'

    // Execute query using template literal
    if (params.length === 1) {
      resources = await sql`SELECT * FROM resources WHERE uploader_id = ${uploaderId} ORDER BY created_at DESC`
    } else if (year && semester && moduleName) {
      resources = await sql`
        SELECT * FROM resources 
        WHERE uploader_id = ${uploaderId} AND year = ${year} AND semester = ${semester} AND module_name = ${moduleName}
        ORDER BY created_at DESC
      `
    } else if (year && semester) {
      resources = await sql`
        SELECT * FROM resources 
        WHERE uploader_id = ${uploaderId} AND year = ${year} AND semester = ${semester}
        ORDER BY created_at DESC
      `
    } else if (year) {
      resources = await sql`
        SELECT * FROM resources 
        WHERE uploader_id = ${uploaderId} AND year = ${year}
        ORDER BY created_at DESC
      `
    } else if (semester) {
      resources = await sql`
        SELECT * FROM resources 
        WHERE uploader_id = ${uploaderId} AND semester = ${semester}
        ORDER BY created_at DESC
      `
    } else if (moduleName) {
      resources = await sql`
        SELECT * FROM resources 
        WHERE uploader_id = ${uploaderId} AND module_name = ${moduleName}
        ORDER BY created_at DESC
      `
    }

    console.log(`✅ Found ${resources.length} user resources`)
    return NextResponse.json(Array.isArray(resources) ? resources : [])
  } catch (error) {
    console.error('Error fetching user resources:', error)
    return NextResponse.json([], { status: 200 })
  }
}
