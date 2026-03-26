import { sql } from '@/lib/db';
import { ensureTablesExist } from '@/lib/db-init';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await ensureTablesExist();
    const { searchParams } = new URL(request.url);
    const resourceId = searchParams.get('resourceId');

    if (!resourceId) {
      return NextResponse.json({ error: 'Resource ID is required' }, { status: 400 });
    }

    const feedback = await sql`
      SELECT * FROM resource_feedback 
      WHERE resource_id = ${parseInt(resourceId)}
      ORDER BY created_at DESC
    `;

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureTablesExist();
    const body = await request.json();
    const { resourceId, rating, comment, userName } = body;

    if (!resourceId || !rating) {
      return NextResponse.json(
        { error: 'Resource ID and rating are required' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO resource_feedback (resource_id, rating, comment, user_name, created_at)
      VALUES (${parseInt(resourceId)}, ${rating}, ${comment || null}, ${userName || 'Anonymous'}, NOW())
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error saving feedback:', error);
    return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
  }
}
