import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'

/**
 * PATCH /api/resources/[id]
 * Update a resource (name, description, resource_type)
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await ensureTablesExist()

    const resourceId = parseInt(params.id, 10)

    if (isNaN(resourceId)) {
      return NextResponse.json(
        { error: 'Invalid resource ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, description, resource_type, updaterId } = body

    console.log('🔄 Updating resource:', {
      resourceId,
      name,
      description,
      resource_type,
      updaterId,
    })

    // Verify the user owns this resource
    const existingResource = await sql`
      SELECT * FROM resources WHERE id = ${resourceId}
    `

    if (existingResource.length === 0) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      )
    }

    const resource = existingResource[0]

    // Check ownership - only the uploader can update
    if (resource.uploader_id !== updaterId) {
      return NextResponse.json(
        { error: 'You do not have permission to update this resource' },
        { status: 403 }
      )
    }

    // Update the resource using conditional checks
    let updatedResource

    if (name !== undefined && description !== undefined && resource_type !== undefined) {
      updatedResource = await sql`
        UPDATE resources 
        SET name = ${name}, description = ${description}, resource_type = ${resource_type}, updated_at = NOW() 
        WHERE id = ${resourceId} 
        RETURNING *
      `
    } else if (name !== undefined && description !== undefined) {
      updatedResource = await sql`
        UPDATE resources 
        SET name = ${name}, description = ${description}, updated_at = NOW() 
        WHERE id = ${resourceId} 
        RETURNING *
      `
    } else if (name !== undefined && resource_type !== undefined) {
      updatedResource = await sql`
        UPDATE resources 
        SET name = ${name}, resource_type = ${resource_type}, updated_at = NOW() 
        WHERE id = ${resourceId} 
        RETURNING *
      `
    } else if (description !== undefined && resource_type !== undefined) {
      updatedResource = await sql`
        UPDATE resources 
        SET description = ${description}, resource_type = ${resource_type}, updated_at = NOW() 
        WHERE id = ${resourceId} 
        RETURNING *
      `
    } else if (name !== undefined) {
      updatedResource = await sql`
        UPDATE resources 
        SET name = ${name}, updated_at = NOW() 
        WHERE id = ${resourceId} 
        RETURNING *
      `
    } else if (description !== undefined) {
      updatedResource = await sql`
        UPDATE resources 
        SET description = ${description}, updated_at = NOW() 
        WHERE id = ${resourceId} 
        RETURNING *
      `
    } else if (resource_type !== undefined) {
      updatedResource = await sql`
        UPDATE resources 
        SET resource_type = ${resource_type}, updated_at = NOW() 
        WHERE id = ${resourceId} 
        RETURNING *
      `
    } else {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    if (updatedResource.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update resource' },
        { status: 500 }
      )
    }

    const result = updatedResource[0]
    console.log('✅ Resource updated:', { id: result.id, name: result.name })

    return NextResponse.json({
      id: result.id,
      uploader_id: result.uploader_id,
      uploader_name: result.uploader_name,
      year: result.year,
      semester: result.semester,
      module_name: result.module_name,
      name: result.name,
      resource_type: result.resource_type,
      file_path: result.file_path,
      shareable_link: result.shareable_link,
      description: result.description,
      download_count: result.download_count,
      created_at: result.created_at,
      updated_at: result.updated_at,
    }, { status: 200 })

  } catch (error) {
    console.error('Error updating resource:', error)
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    )
  }
}
