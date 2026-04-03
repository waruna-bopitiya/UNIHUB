import { sql } from '@/lib/db';
import { ensureTablesExist } from '@/lib/db-init';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await ensureTablesExist();

    // Get feedback statistics for all resources
    const stats = await sql`
      SELECT 
        resource_id,
        COUNT(*) as feedback_count,
        AVG(rating) as average_rating,
        MIN(rating) as min_rating,
        MAX(rating) as max_rating
      FROM resource_feedback
      GROUP BY resource_id
    `;

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    return NextResponse.json({ error: 'Failed to fetch feedback stats' }, { status: 500 });
  }
}
