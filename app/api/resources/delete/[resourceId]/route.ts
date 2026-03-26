import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ resourceId: string }> }
) {
  try {
    // IMPORTANT: In Next.js 16.1.6+, params is a Promise and must be awaited!
    const { resourceId } = await params
    
    console.log(`🗑️ Deleting resource ${resourceId}`)

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
