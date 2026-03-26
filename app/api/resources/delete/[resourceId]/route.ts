import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ resourceId: string }> }
) {
  try {
    // Ensure tables exist
    await ensureTablesExist()
    
    // IMPORTANT: In Next.js 16.1.6+, params is a Promise and must be awaited!
    const { resourceId } = await params
    
    // Get user ID from query params
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    
    console.log(`🗑️ Deleting resource ${resourceId} by user ${userId}`)

    if (!userId) {
      console.error(`❌ User ID is required to delete`)
      return NextResponse.json(
        { error: 'User must be logged in to delete resources' },
        { status: 401 }
      )
    }

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

    // Check if user is the uploader (normalize strings for comparison)
    const normalizedUserId = String(userId).trim().toLowerCase()
    const normalizedUploaderId = String(resource.uploader_id).trim().toLowerCase()
    
    console.log(`🔍 Comparing: userId="${normalizedUserId}" vs uploader_id="${normalizedUploaderId}"`)
    
    if (normalizedUserId !== normalizedUploaderId) {
      console.error(`❌ User ${normalizedUserId} is not the uploader of resource ${parsedId} (uploader: ${normalizedUploaderId})`)
      return NextResponse.json(
        { error: 'Only the uploader can delete this resource' },
        { status: 403 }
      )
    }

    console.log(`✅ User ${normalizedUserId} is authorized to delete resource ${parsedId}`)

    // Delete file if it exists
    if (resource.resource_type === 'file' && resource.file_path) {
      try {
        const filePath = join(process.cwd(), 'public', resource.file_path)
        if (existsSync(filePath)) {
          await unlink(filePath)
        }
      } catch (error) {
        console.error('Error deleting file:', error)
        // Continue with database deletion even if file deletion fails
      }
    }

    // Delete from database (cascade will delete downloads)
    await sql`
      DELETE FROM resources WHERE id = ${parsedId}
    `

    console.log(`✅ Resource ${parsedId} deleted successfully`)
    return NextResponse.json({ success: true, message: 'Resource deleted successfully' })
  } catch (error) {
    console.error('❌ Error deleting resource:', error)
    return NextResponse.json({ error: 'Failed to delete resource' }, { status: 500 })
  }
}
