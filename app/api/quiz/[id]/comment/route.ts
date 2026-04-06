import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
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

    // Check if quiz exists
    const quizzes = await sql`SELECT id FROM quizzes WHERE id = ${quizId}`
    if (quizzes.length === 0) {
      return NextResponse.json(
        { status: 'error', message: 'Quiz not found' },
        { status: 404 }
      )
    }

    // Get comments
    const comments = await sql`
      SELECT 
        id,
        name,
        message,
        created_at
      FROM quiz_comments
      WHERE quiz_id = ${quizId}
      ORDER BY created_at DESC
    `

    return NextResponse.json({
      status: 'success',
      data: comments.map((c) => ({
        name: c.name,
        message: c.message,
        date: c.created_at,
      })),
      count: comments.length,
    })
  } catch (error: any) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { status: 'error', message: error.message },
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
    const { name = 'Anonymous', message } = body

    if (!message?.trim()) {
      return NextResponse.json(
        { status: 'error', message: 'Comment message is required' },
        { status: 400 }
      )
    }

    // Check if quiz exists
    const quizzes = await sql`SELECT id FROM quizzes WHERE id = ${quizId}`
    if (quizzes.length === 0) {
      return NextResponse.json(
        { status: 'error', message: 'Quiz not found' },
        { status: 404 }
      )
    }

    // Insert comment
    const [comment] = await sql`
      INSERT INTO quiz_comments
        (quiz_id, name, message)
      VALUES
        (${quizId}, ${name?.trim() || 'Anonymous'}, ${message.trim()})
      RETURNING id, name, message, created_at
    `

    return NextResponse.json(
      {
        status: 'success',
        message: 'Comment added successfully',
        data: {
          name: comment.name,
          message: comment.message,
          date: comment.created_at,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error adding comment:', error)
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    )
  }
}
