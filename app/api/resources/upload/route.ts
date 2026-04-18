import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'
import { supabaseAdmin, RESOURCES_BUCKET } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    await ensureTablesExist()

    const contentType = request.headers.get('content-type') || ''

    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Content-Type must be multipart/form-data' },
        { status: 400 }
      )
    }

    // Parse FormData
    const formData = await request.formData()

    // Extract fields
    const year = formData.get('year') as string
    const semester = formData.get('semester') as string
    const module_name = formData.get('module_name') as string
    const name = formData.get('name') as string
    const resourceType = formData.get('resourceType') as string
    const uploader_id = formData.get('uploaderId') as string
    const uploader_name = formData.get('uploaderName') as string || 'Anonymous'
    const description = formData.get('description') as string || ''
    const file = formData.get('file') as File

    console.log('📂 Received file upload request:', {
      year,
      semester,
      module_name,
      name,
      resourceType,
      uploader_id,
      uploader_name,
      fileName: file?.name,
      fileSize: file?.size,
    })

    // Validate required fields
    if (!year || !semester || !module_name || !name || !resourceType || !uploader_id) {
      return NextResponse.json(
        { error: 'Missing required fields: year, semester, module_name, name, resourceType, uploaderId' },
        { status: 400 }
      )
    }

    // Validate file
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'No file provided or invalid file format' },
        { status: 400 }
      )
    }

    // Validate file size (max 50MB)
    const MAX_FILE_SIZE = 50 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 400 }
      )
    }

    // Allowed file types
    const ALLOWED_TYPES = [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/mpeg',
      'audio/mpeg',
      'audio/wav',
      'audio/webm',
    ]

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `File type not allowed. Allowed types: PDF, PPT, Word, TXT, Excel, Image, Video, Audio` },
        { status: 400 }
      )
    }

    try {
      // Upload file to Supabase using server-side client (bypasses RLS)
      console.log('📤 Uploading file to Supabase...')
      
      const timestamp = Date.now()
      const fileName = `${uploader_id}/${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      
      const fileBuffer = await file.arrayBuffer()
      
      const { data, error } = await supabaseAdmin.storage
        .from(RESOURCES_BUCKET)
        .upload(fileName, fileBuffer, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false,
        })

      if (error) {
        console.error('❌ Supabase upload error:', error)
        throw new Error(`Upload failed: ${error.message}`)
      }

      console.log('✅ File uploaded successfully:', data)

      // Get public URL
      const { data: publicUrlData } = supabaseAdmin.storage
        .from(RESOURCES_BUCKET)
        .getPublicUrl(fileName)

      const fileUrl = publicUrlData.publicUrl
      console.log('🔗 Public URL:', fileUrl)

      // Save to database with file URL instead of shareable link
      console.log('💾 Saving resource to database...')
      const result = await sql`
        INSERT INTO resources (
          uploader_id, 
          uploader_name, 
          year, 
          semester, 
          module_name, 
          name, 
          resource_type, 
          file_path, 
          shareable_link,
          description, 
          download_count, 
          created_at
        )
        VALUES (
          ${uploader_id}, 
          ${uploader_name}, 
          ${year}, 
          ${semester}, 
          ${module_name}, 
          ${name}, 
          ${resourceType}, 
          ${fileUrl},
          ${null},
          ${description}, 
          0, 
          NOW()
        )
        RETURNING *
      `

      const resource = result[0]
      console.log('✅ Database insert successful:', { id: resource.id, name: resource.name })

      // Send to Google Sheets via AppScript (non-blocking)
      sendToGoogleSheet({
        id: resource.id,
        year,
        semester,
        module_name,
        name,
        resource_type: resourceType,
        file_url: fileUrl,
        description,
        uploader_id,
        uploader_name,
        upload_type: 'file',
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
        file_path: resource.file_path,
        shareable_link: resource.shareable_link,
        description: resource.description,
        created_at: resource.created_at,
        upload_type: 'file',
      }, { status: 201 })

    } catch (uploadError) {
      console.error('❌ File upload error:', uploadError)
      return NextResponse.json(
        { error: `Upload failed: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}` },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('❌ Error in file upload handler:', error)
    return NextResponse.json(
      { error: 'Failed to process file upload' },
      { status: 500 }
    )
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

    console.log('📤 Sending file upload resource to Google Sheet...')
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
          file_url: resource.file_url,
          description: resource.description,
          uploader_id: resource.uploader_id,
          uploader_name: resource.uploader_name,
          upload_type: resource.upload_type,
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
  }
}
