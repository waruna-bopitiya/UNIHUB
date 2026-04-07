import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// Check if question is within 7 days of creation
function isWithinEditWindow(createdAt: Date): boolean {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  return createdAt >= sevenDaysAgo
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const questionId = parseInt(id)
    if (isNaN(questionId)) {
      return NextResponse.json(
        { error: 'Invalid question ID' },
        { status: 400 }
      )
    }

    const questions = await sql`
      SELECT 
        q.id,
        q.title,
        q.content,
        q.subject_code,
        q.year,
        q.semester,
        q.user_id,
        q.created_at,
        q.updated_at,
        q.upvotes,
        q.downvotes,
        u.first_name,
        u.second_name,
        u.email,
        COUNT(a.id) as answer_count
      FROM questions q
      JOIN users u ON q.user_id = u.id
      LEFT JOIN answers a ON q.id = a.question_id
      WHERE q.id = ${questionId}
      GROUP BY q.id, q.user_id, q.upvotes, q.downvotes, u.id, u.first_name, u.second_name, u.email
    `

    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    const q = questions[0]
    const createdAt = new Date(q.created_at)
    const isEditable = isWithinEditWindow(createdAt)

    const question = {
      id: q.id,
      title: q.title,
      content: q.content,
      subject_code: q.subject_code,
      year: q.year,
      semester: q.semester,
      user_id: q.user_id,
      author: {
        id: q.user_id,
        name: `${q.first_name}${q.second_name ? ' ' + q.second_name : ''}`,
        email: q.email,
        avatar: `https://avatar.vercel.sh/${q.first_name.toLowerCase()}`
      },
      upvotes: q.upvotes || 0,
      downvotes: q.downvotes || 0,
      answers: parseInt(q.answer_count) || 0,
      createdAt: q.created_at,
      updatedAt: q.updated_at,
      isEditable,
      editWindowExpiresAt: new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000)
    }

    return NextResponse.json({
      status: 'success',
      data: question
    })
  } catch (error: any) {
    console.error('❌ Error fetching question:', error.message)
    return NextResponse.json(
      { error: 'Failed to fetch question', details: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const questionId = parseInt(id)
    if (isNaN(questionId)) {
      return NextResponse.json(
        { error: 'Invalid question ID' },
        { status: 400 }
      )
    }

    // Get authenticated user ID from Authorization header or studentId header
    let studentIdCookie = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!studentIdCookie) {
      studentIdCookie = request.headers.get('X-Student-Id')
    }
    if (!studentIdCookie) {
      studentIdCookie = request.cookies.get('studentId')?.value
    }

    if (!studentIdCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, content } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Fetch the question to verify ownership and check edit window
    const questions = await sql`
      SELECT id, user_id, created_at
      FROM questions
      WHERE id = ${questionId}
    `

    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    const question = questions[0]

    // Verify the user is the owner
    if (question.user_id !== studentIdCookie) {
      return NextResponse.json(
        { error: 'You can only edit your own questions' },
        { status: 403 }
      )
    }

    // Check if question is within 7-day edit window
    const createdAt = new Date(question.created_at)
    if (!isWithinEditWindow(createdAt)) {
      return NextResponse.json(
        { error: 'Questions can only be edited within 7 days of creation' },
        { status: 403 }
      )
    }

    // Update the question
    await sql`
      UPDATE questions
      SET title = ${title}, content = ${content}, updated_at = NOW()
      WHERE id = ${questionId}
    `

    console.log(`✅ Question ${questionId} updated by user ${studentIdCookie}`)

    return NextResponse.json({
      status: 'success',
      message: 'Question updated successfully',
      data: {
        id: questionId,
        title,
        content
      }
    })
  } catch (error: any) {
    console.error('❌ Error updating question:', error.message)
    return NextResponse.json(
      { error: 'Failed to update question', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const questionId = parseInt(id)
    if (isNaN(questionId)) {
      return NextResponse.json(
        { error: 'Invalid question ID' },
        { status: 400 }
      )
    }

    // Get authenticated user ID from Authorization header or studentId header
    let studentIdCookie = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!studentIdCookie) {
      studentIdCookie = request.headers.get('X-Student-Id')
    }
    if (!studentIdCookie) {
      studentIdCookie = request.cookies.get('studentId')?.value
    }

    if (!studentIdCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch the question to verify ownership and check delete window
    const questions = await sql`
      SELECT id, user_id, created_at
      FROM questions
      WHERE id = ${questionId}
    `

    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    const question = questions[0]

    // Verify the user is the owner
    if (question.user_id !== studentIdCookie) {
      return NextResponse.json(
        { error: 'You can only delete your own questions' },
        { status: 403 }
      )
    }

    // Check if question is within 7-day delete window
    const createdAt = new Date(question.created_at)
    if (!isWithinEditWindow(createdAt)) {
      return NextResponse.json(
        { error: 'Questions can only be deleted within 7 days of creation' },
        { status: 403 }
      )
    }

    // Delete the question (answers will be deleted via cascade)
    await sql`
      DELETE FROM questions
      WHERE id = ${questionId}
    `

    console.log(`✅ Question ${questionId} deleted by user ${studentIdCookie}`)

    return NextResponse.json({
      status: 'success',
      message: 'Question deleted successfully'
    })
  } catch (error: any) {
    console.error('❌ Error deleting question:', error.message)
    return NextResponse.json(
      { error: 'Failed to delete question', details: error.message },
      { status: 500 }
    )
  }
}
