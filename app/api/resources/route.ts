import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(request: Request) {
  try {
    await ensureTablesExist()
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const semester = searchParams.get('semester')
    const moduleName = searchParams.get('moduleName')

    console.log('📚 Fetching resources with filters:', { year, semester, moduleName })

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

    console.log(`✅ Found ${resources.length} resources`)
    if (resources.length > 0) {
      console.log('📋 Sample resource:', {
        id: resources[0].id,
        name: resources[0].name,
        keys: Object.keys(resources[0]),
      })
    }

    return NextResponse.json(Array.isArray(resources) ? resources : [])
  } catch (error) {
    console.error('Error fetching resources:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: Request) {
  try {
    await ensureTablesExist()
    
    // Handle both FormData (for backward compatibility) and JSON
    let year: string
    let semester: string
    let module_name: string
    let name: string
    let resourceType: string
    let uploader_id: string
    let uploader_name: string
    let shareable_link: string
    let description: string

    const contentType = request.headers.get('content-type') || ''
    
    if (contentType.includes('application/json')) {
      // Handle JSON request
      const body = await request.json()
      year = body.year
      semester = body.semester
      module_name = body.module_name
      name = body.name
      resourceType = body.resource_type || body.resourceType
      shareable_link = body.shareable_link || body.shareableLink
      uploader_id = body.uploader_id
      uploader_name = body.uploader_name || 'Anonymous'
      description = body.description || ''

      console.log('Received JSON request:', {
        year,
        semester,
        module_name,
        name,
        resourceType,
        uploader_id,
        uploader_name,
        shareable_link,
        description,
      })
    } else {
      // Handle FormData for backward compatibility
      const formData = await request.formData()
      year = formData.get('year') as string
      semester = formData.get('semester') as string
      module_name = formData.get('module_name') as string
      name = formData.get('name') as string
      resourceType = formData.get('resourceType') as string
      uploader_id = formData.get('uploaderId') as string
      uploader_name = formData.get('uploaderName') as string || 'Anonymous'
      shareable_link = formData.get('shareableLink') as string || ''
      description = formData.get('description') as string || ''

      console.log('Received FormData request:', {
        year,
        semester,
        module_name,
        name,
        resourceType,
        uploader_id,
        uploader_name,
        shareable_link,
        description,
      })
    }

    // Validate required fields
    if (!year || !semester || !module_name || !name || !resourceType || !uploader_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate shareable_link if provided
    if (shareable_link) {
      try {
        new URL(shareable_link)
      } catch {
        return NextResponse.json(
          { error: 'Invalid shareable link URL' },
          { status: 400 }
        )
      }
    }

    // Save to database
    try {
      console.log('Saving to database:', {
        year,
        semester,
        module_name,
        name,
        resourceType,
        uploader_id,
        uploader_name,
        shareable_link,
        description,
      })

      const result = await sql`
        INSERT INTO resources (uploader_id, uploader_name, year, semester, module_name, name, resource_type, shareable_link, description, download_count, created_at)
        VALUES (${uploader_id}, ${uploader_name}, ${year}, ${semester}, ${module_name}, ${name}, ${resourceType}, ${shareable_link || null}, ${description}, 0, NOW())
        RETURNING *
      `

      const resource = result[0]
      console.log('Database insert successful:', { id: resource.id, name: resource.name })

      // Send to Google Sheets via AppScript (non-blocking)
      sendToGoogleSheet({
        id: resource.id,
        year,
        semester,
        module_name,
        name,
        resource_type: resourceType,
        shareable_link,
        description,
        uploader_id,
        uploader_name,
        created_at: new Date().toISOString(),
      }).catch(err => console.error('Error sending to Google Sheet:', err))

      return NextResponse.json({
        id: resource.id,
        uploader_id: resource.uploader_id,
        uploader_name: resource.uploader_name,
        year: resource.year,
        semester: resource.semester,
        module_name: resource.module_name,
        name: resource.name,
        resource_type: resource.resource_type,
        shareable_link: resource.shareable_link,
        description: resource.description,
        created_at: resource.created_at,
      }, { status: 201 })
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: `Database error: ${dbError instanceof Error ? dbError.message : 'Unknown error'}` },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error creating resource:', error)
    return NextResponse.json({ error: 'Failed to create resource' }, { status: 500 })
  }
}

// Function to send resource to Google Sheet via AppScript
async function sendToGoogleSheet(resource: any) {
  try {
    const APPSCRIPT_URL = process.env.GOOGLE_APPSCRIPT_DEPLOYMENT_URL

    if (!APPSCRIPT_URL) {
      console.warn('⚠️ GOOGLE_APPSCRIPT_DEPLOYMENT_URL not configured - skipping Google Sheets sync')
      return
    }

    console.log('📤 Sending resource to Google Sheet...')
    const response = await fetch(APPSCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'addResource',
        resource: {
          id: resource.id,
          year: resource.year,
          semester: resource.semester,
          module_name: resource.module_name,
          name: resource.name,
          resource_type: resource.resource_type,
          shareable_link: resource.shareable_link,
          description: resource.description,
          uploader_id: resource.uploader_id,
          uploader_name: resource.uploader_name,
          created_at: resource.created_at,
          timestamp: new Date().toLocaleString(),
        },
      }),
    })

    if (!response.ok) {
      console.error('⚠️ Failed to send to Google Sheet:', response.statusText)
    } else {
      console.log('✅ Successfully sent to Google Sheet')
    }
  } catch (error) {
    console.error('⚠️ Error sending to Google Sheet:', error)
    // Don't throw - this is non-blocking
  }
}
