import { NextRequest, NextResponse } from 'next/server'
import { sql, sqlWithRetry } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureTablesExist()

    const { id } = await params
    const quizId = parseInt(id)

    if (isNaN(quizId)) {
      return NextResponse.json(
        { status: 'error', message: 'Invalid quiz ID' },
        { status: 400 }
      )
    }

    // Check if quiz exists with retry logic
    const quizzes = await sqlWithRetry(() =>
      sql`SELECT id FROM quizzes WHERE id = ${quizId}`
    )
    if (quizzes.length === 0) {
      return NextResponse.json(
        { status: 'error', message: 'Quiz not found' },
        { status: 404 }
      )
    }

    // Get ratings with retry logic
    const ratings = await sqlWithRetry(() =>
      sql`
        SELECT 
          id,
          name,
          rating,
          created_at
        FROM quiz_ratings
        WHERE quiz_id = ${quizId}
        ORDER BY created_at DESC
      `
    )

    // Calculate average rating
    const avgRating =
      ratings.length > 0
        ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
        : 0

    return NextResponse.json({
      status: 'success',
      data: ratings.map((r) => ({
        name: r.name,
        rating: r.rating,
        date: r.created_at,
      })),
      count: ratings.length,
      averageRating: parseFloat(avgRating as string),
    })
  } catch (error: any) {
    console.error('❌ Error from rating endpoint:', error)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    console.error('Full error object:', JSON.stringify(error, null, 2))
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to save rating', details: error.toString() },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureTablesExist()

    const { id } = await params
    const quizId = parseInt(id)

    if (isNaN(quizId)) {
      return NextResponse.json(
        { status: 'error', message: 'Invalid quiz ID' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { name = 'Anonymous', rating } = body

    console.log('📤 Saving rating:', { quizId, name, rating })

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { status: 'error', message: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Check if quiz exists
    const quizzes = await sqlWithRetry(() =>
      sql`SELECT id FROM quizzes WHERE id = ${quizId}`
    )

    if (quizzes.length === 0) {
      return NextResponse.json(
        { status: 'error', message: 'Quiz not found' },
        { status: 404 }
      )
    }

    // Insert rating with retry logic
    console.log('💾 Attempting to insert rating with data:', {
      quizId,
      name: name?.trim() || 'Anonymous',
      rating,
      ratingIsNumber: typeof rating === 'number',
    })
    const result = await sqlWithRetry(() =>
      sql`
        INSERT INTO quiz_ratings
          (quiz_id, name, rating)
        VALUES
          (${quizId}, ${name?.trim() || 'Anonymous'}, ${rating})
        RETURNING id, name, rating, created_at
      `
    )

    if (!result || result.length === 0) {
      throw new Error('Failed to insert rating - no result returned')
    }

    const newRating = result[0]
    console.log('✅ Rating saved successfully:', newRating)

    return NextResponse.json(
      {
        status: 'success',
        message: 'Rating added successfully',
        data: {
          name: newRating.name,
          rating: newRating.rating,
          date: newRating.created_at,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('❌ Error adding rating:', error.message)
    console.error('Error details:', error)
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    )
  }
}
