import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ resourceId: string }> }
) {
  try {
    // IMPORTANT: In Next.js 16.1.6+, params is a Promise and must be awaited!
    const { resourceId } = await params
    
    console.log(`📥 Download request for resource ID: ${resourceId}`)

    // Parse as integer
    const parsedId = parseInt(resourceId)
    if (isNaN(parsedId)) {
      console.error(`❌ Invalid resource ID format: ${resourceId} (not a number)`)
      return NextResponse.json(
        { error: `Invalid resource ID: ${resourceId}` },
        { status: 400 }
      )
    }

    // Fetch resource from database
    const resources = await sql`
      SELECT * FROM resources WHERE id = ${parsedId}
    `

    if (resources.length === 0) {
      console.error(`❌ Resource not found: ${parsedId}`)
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
    }

    const resource = resources[0]
    console.log(`📋 Resource found:`, {
      id: resource.id,
      name: resource.name,
      type: resource.resource_type,
      file_path: resource.file_path,
      link: resource.link,
    })

    // If it's a file, serve it
    if (resource.resource_type === 'file' && resource.file_path) {
      try {
        const filePath = join(process.cwd(), 'public', resource.file_path)
        console.log(`📂 Attempting to read file from: ${filePath}`)

        const fileContent = await readFile(filePath)
        console.log(`✅ File read successfully, size: ${fileContent.length} bytes`)

        // Record the download in database
        await sql`
          INSERT INTO resource_downloads (resource_id)
          VALUES (${parsedId})
        `

        // Increment download count
        await sql`
          UPDATE resources
          SET download_count = download_count + 1
          WHERE id = ${parsedId}
        `

        console.log(`📊 Download recorded for resource ${parsedId}`)

        // Return file with proper filename and extension from file_path
        // file_path is like: /uploads/resources/1234567890_originalname.pdf
        let downloadFilename = resource.name || 'download'
        if (resource.file_path) {
          // Extract just the filename from the path
          const parts = resource.file_path.split('/')
          const storedFilename = parts[parts.length - 1]
          // Remove timestamp prefix to get original filename
          const withoutTimestamp = storedFilename.replace(/^\d+_/, '')
          if (withoutTimestamp) {
            downloadFilename = withoutTimestamp
          }
        }
        
        console.log(`📥 Sending file download: ${downloadFilename} (${fileContent.length} bytes)`)
        
        // Sanitize filename to ASCII-only for HTTP header safety
        // This removes non-ASCII characters to prevent ByteString encoding errors
        const sanitizedFilename = downloadFilename.replace(/[^\x00-\x7F]/g, '_')
        
        console.log(`📋 Original filename: ${downloadFilename}`)
        console.log(`📋 Sanitized filename: ${sanitizedFilename}`)
        
        // Determine content type based on file extension
        let contentType = 'application/octet-stream'
        if (sanitizedFilename.endsWith('.pdf')) {
          contentType = 'application/pdf'
        } else if (sanitizedFilename.endsWith('.doc') || sanitizedFilename.endsWith('.docx')) {
          contentType = 'application/msword'
        } else if (sanitizedFilename.endsWith('.xls') || sanitizedFilename.endsWith('.xlsx')) {
          contentType = 'application/vnd.ms-excel'
        } else if (sanitizedFilename.endsWith('.jpg') || sanitizedFilename.endsWith('.jpeg')) {
          contentType = 'image/jpeg'
        } else if (sanitizedFilename.endsWith('.png')) {
          contentType = 'image/png'
        }
        
        console.log(`📋 Content-Type: ${contentType}`)
        
        // Return using Response API for proper binary handling
        return new Response(fileContent, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Content-Length': String(fileContent.length),
            'Content-Disposition': `attachment; filename="${sanitizedFilename}"`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        })
      } catch (error) {
        console.error('❌ Error reading file:', error)
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json({ error: `Failed to download file: ${errorMsg}` }, { status: 500 })
      }
    } else if (resource.resource_type === 'link' && resource.link) {
      console.log(`🔗 Serving link: ${resource.link}`)

      // For links, just increment the download count and return the link
      await sql`
        INSERT INTO resource_downloads (resource_id)
        VALUES (${parsedId})
      `

      await sql`
        UPDATE resources
        SET download_count = download_count + 1
        WHERE id = ${parsedId}
      `

      console.log(`📊 Link click recorded for resource ${parsedId}`)
      return NextResponse.json({ url: resource.link })
    } else {
      console.error(`❌ Invalid resource: type=${resource.resource_type}, has_file=${!!resource.file_path}, has_link=${!!resource.link}`)
      return NextResponse.json({ error: 'Invalid resource' }, { status: 400 })
    }
  } catch (error) {
    console.error('❌ Error downloading resource:', error)
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: `Failed to download resource: ${errorMsg}` }, { status: 500 })
  }
}
