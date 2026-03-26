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
    const formData = await request.formData()
    const year = formData.get('year') as string
    const semester = formData.get('semester') as string
    const module_name = formData.get('module_name') as string
    const name = formData.get('name') as string
    const resourceType = formData.get('resourceType') as string
    const link = formData.get('link') as string
    const uploaderId = formData.get('uploaderId') as string
    const file = formData.get('file') as File | null

    console.log('Received form data:', {
      year,
      semester,
      module_name,
      name,
      resourceType,
      uploaderId,
      link,
      fileInfo: file ? { name: file.name, size: file.size, type: file.type } : null,
    })

    if (!year || !semester || !module_name || !name || !resourceType || !uploaderId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    let filePath = null

    // Handle file upload
    if (resourceType === 'file' && file) {
      try {
        console.log('Starting file upload:', file.name)
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'resources')
        
        console.log('Upload directory:', uploadDir)
        
        // Create directory if it doesn't exist
        if (!existsSync(uploadDir)) {
          console.log('Directory does not exist, creating...')
          await mkdir(uploadDir, { recursive: true })
          console.log('Directory created successfully')
        }

        // Generate unique filename
        const timestamp = Date.now()
        // Sanitize filename: remove non-ASCII characters and problematic chars
        const sanitized = file.name
          .replace(/[<>:"|?*\\/]/g, '_')  // Remove problematic filesystem characters
          .replace(/[^\x00-\x7F]/g, '_')   // Replace non-ASCII with underscore
        const filename = `${timestamp}_${sanitized}`
        const fullPath = join(uploadDir, filename)

        console.log('Writing file to:', fullPath)

        // Read file and save it
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(fullPath, buffer)

        console.log('File uploaded successfully')

        // Store relative path for serving
        filePath = `/uploads/resources/${filename}`
      } catch (uploadError) {
        console.error('Error uploading file:', uploadError)
        return NextResponse.json(
          { error: `Failed to upload file: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}` },
          { status: 500 }
        )
      }
    } else if (resourceType === 'file' && !file) {
      console.error('File upload requested but no file provided')
      return NextResponse.json(
        { error: 'No file provided for file upload' },
        { status: 400 }
      )
    }

    // Save to database
    try {
      console.log('Saving to database:', {
        year,
        semester,
        module_name,
        name,
        resourceType,
        uploaderId,
        link,
        filePath,
      })

      const result = await sql`
        INSERT INTO resources (uploader_id, year, semester, module_name, name, resource_type, link, file_path, download_count)
        VALUES (${uploaderId}, ${year}, ${semester}, ${module_name}, ${name}, ${resourceType}, ${link || null}, ${filePath}, 0)
        RETURNING *
      `

      console.log('Database insert successful:', result[0])
      return NextResponse.json(result[0], { status: 201 })
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
