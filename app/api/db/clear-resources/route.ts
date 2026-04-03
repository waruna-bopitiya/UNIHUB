import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function POST() {
  try {
    console.log('🗑️ Clearing all resources from database...')

    // First delete all downloads for these resources
    await sql`DELETE FROM resource_downloads`
    console.log('✅ Deleted all download records')

    // Then delete all resources
    const result = await sql`DELETE FROM resources RETURNING id`
    console.log(`✅ Deleted ${result.length} resources`)

    // Verify deletion
    const check = await sql`SELECT COUNT(*) as count FROM resources`
    const count = check[0].count

    return NextResponse.json({
      success: true,
      message: `Cleared all resources. ${result.length} resources deleted. ${count} resources remaining.`,
      deletedCount: result.length,
      remainingCount: count,
    })
  } catch (error) {
    console.error('❌ Error clearing resources:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to clear resources',
      },
      { status: 500 }
    )
  }
}
