import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const semester = searchParams.get('semester')
    const moduleName = searchParams.get('moduleName')

    let resources: any[] = []

    if (year && semester && moduleName) {
      resources = await sql`
        SELECT * FROM resources 
        WHERE year = ${year} AND semester = ${semester} AND module_name = ${moduleName}
        ORDER BY created_at DESC
      `
    } else if (year && semester) {
      resources = await sql`
        SELECT * FROM resources 
        WHERE year = ${year} AND semester = ${semester}
        ORDER BY created_at DESC
      `
    } else if (year) {
      resources = await sql`
        SELECT * FROM resources 
        WHERE year = ${year}
        ORDER BY created_at DESC
      `
    } else {
      resources = await sql`
        SELECT * FROM resources 
        ORDER BY created_at DESC
      `
    }

    return NextResponse.json(Array.isArray(resources) ? resources : [])
  } catch (error) {
    console.error('Error fetching resources:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { year, semester, module_name, name, resourceType, link } = body

    if (!year || !semester || !module_name || !name || !resourceType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = await sql`
      INSERT INTO resources (year, semester, module_name, name, resource_type, link)
      VALUES (${year}, ${semester}, ${module_name}, ${name}, ${resourceType}, ${link || null})
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Error creating resource:', error)
    return NextResponse.json({ error: 'Failed to create resource' }, { status: 500 })
  }
}
