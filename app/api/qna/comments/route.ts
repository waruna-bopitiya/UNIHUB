import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// POST - Create a new comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { answerId, userId, content } = body

    console.log('📝 POST /api/qna/comments - payload:', { answerId, userId, contentLength: content?.length })

    if (!answerId || !userId || !content) {
      console.error('❌ Missing fields:', { answerId, userId, content: !!content })
      return NextResponse.json(
        { error: 'Missing required fields: answerId, userId, content' },
        { status: 400 }
      )
    }

    if (content.trim().length < 1) {
      return NextResponse.json(
        { error: 'Comment cannot be empty' },
        { status: 400 }
      )
    }

    const answerIdInt = parseInt(String(answerId), 10)
    if (isNaN(answerIdInt)) {
      return NextResponse.json(
        { error: 'Invalid answerId - must be a number' },
        { status: 400 }
      )
    }

    console.log('👤 Looking for user:', userId)

    try {
      // First verify the answer exists
      const answerCheck = await sql`SELECT id FROM answers WHERE id = ${answerIdInt}`
      if (answerCheck.length === 0) {
        console.error('❌ Answer not found:', answerIdInt)
        return NextResponse.json(
          { error: 'Answer not found' },
          { status: 404 }
        )
      }

      // Get user details from users table
      const studentResult = await sql`SELECT id, first_name FROM users WHERE id = ${userId}`

      if (studentResult.length === 0) {
        console.error('❌ User not found:', userId)
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      const student = studentResult[0]
      console.log('✅ Found user:', student.id)

      // Create the comment
      console.log('💾 Creating comment in answer_comments table...')
      const result = await sql`
        INSERT INTO answer_comments (answer_id, user_id, content, created_at, updated_at)
        VALUES (${answerIdInt}, ${userId}, ${content.trim()}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id, answer_id, user_id, content, created_at, updated_at
      `

      if (result.length === 0) {
        throw new Error('Failed to insert comment - no result returned')
      }

      const comment = result[0]
      console.log('✅ Comment created with ID:', comment.id)

      return NextResponse.json({
        id: comment.id.toString(),
        content: comment.content,
        author: {
          id: userId,
          name: student.first_name || 'Anonymous',
          avatar: `https://avatar.vercel.sh/${userId}`
        },
        createdAt: comment.created_at,
        updatedAt: comment.updated_at
      })
    } catch (dbError: any) {
      console.error('❌ Database error details:', {
        message: dbError.message,
        code: dbError.code,
        constraint: dbError.constraint
      })
      
      // Only show table not found if it's specifically about answer_comments table
      if (dbError.message && dbError.message.includes('answer_comments') && dbError.message.includes('does not exist')) {
        console.error('❌ answer_comments table does not exist')
        return NextResponse.json(
          { error: 'Comments table not yet created. Please run setup script.', details: 'Run: node scripts/create-comments-table.js' },
          { status: 500 }
        )
      }
      
      // For other errors, show the actual error message
      throw dbError
    }
  } catch (error) {
    console.error('❌ Error creating comment:', error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: 'Failed to create comment', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// PUT - Update a comment
export async function PUT(request: NextRequest) {
  try {
    const { commentId, userId, content } = await request.json()

    if (!commentId || !userId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (content.trim().length < 1) {
      return NextResponse.json(
        { error: 'Comment cannot be empty' },
        { status: 400 }
      )
    }

    const commentIdInt = parseInt(String(commentId), 10)
    if (isNaN(commentIdInt)) {
      return NextResponse.json(
        { error: 'Invalid commentId' },
        { status: 400 }
      )
    }

    // Verify user owns the comment
    const checkResult = await sql`SELECT user_id FROM answer_comments WHERE id = ${commentIdInt}`

    if (checkResult.length === 0) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    if (checkResult[0].user_id !== userId) {
      return NextResponse.json(
        { error: 'You can only edit your own comments' },
        { status: 403 }
      )
    }

    // Update the comment
    const result = await sql`
      UPDATE answer_comments 
      SET content = ${content.trim()}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${commentIdInt}
      RETURNING id, content, updated_at
    `

    const comment = result[0]

    return NextResponse.json({
      id: comment.id.toString(),
      content: comment.content,
      updatedAt: comment.updated_at
    })
  } catch (error) {
    console.error('Error updating comment:', error)
    return NextResponse.json(
      { error: 'Failed to update comment', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a comment
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get('commentId')
    const userId = searchParams.get('userId')

    if (!commentId || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const commentIdInt = parseInt(commentId, 10)
    if (isNaN(commentIdInt)) {
      return NextResponse.json(
        { error: 'Invalid commentId' },
        { status: 400 }
      )
    }

    // Verify user owns the comment
    const checkResult = await sql`SELECT user_id FROM answer_comments WHERE id = ${commentIdInt}`

    if (checkResult.length === 0) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    if (checkResult[0].user_id !== userId) {
      return NextResponse.json(
        { error: 'You can only delete your own comments' },
        { status: 403 }
      )
    }

    // Delete the comment
    await sql`DELETE FROM answer_comments WHERE id = ${commentIdInt}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json(
      { error: 'Failed to delete comment', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// GET - Fetch comments for an answer
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const answerId = searchParams.get('answerId')
    const userId = searchParams.get('userId')

    console.log('🔍 GET /api/qna/comments')
    console.log('   answerId:', answerId)
    console.log('   userId:', userId)

    if (!answerId) {
      console.error('❌ Missing answerId parameter')
      return NextResponse.json(
        { error: 'Missing answerId parameter' },
        { status: 400 }
      )
    }

    const answerIdInt = parseInt(answerId, 10)
    if (isNaN(answerIdInt)) {
      console.error('❌ Invalid answerId:', answerId)
      return NextResponse.json(
        { error: 'Invalid answerId - must be a number' },
        { status: 400 }
      )
    }

    console.log('💾 Querying comments for answer ID:', answerIdInt)

    try {
      // First check if table exists
      const tableCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'answer_comments'
        )
      `

      if (!tableCheck[0].exists) {
        console.warn('⚠️ answer_comments table does not exist')
        return NextResponse.json([])
      }

      // Fetch comments with user details
      const result = await sql`
        SELECT 
          ac.id, 
          ac.content, 
          ac.user_id, 
          ac.created_at,
          ac.updated_at,
          u.first_name
        FROM answer_comments ac
        LEFT JOIN users u ON ac.user_id = u.id
        WHERE ac.answer_id = ${answerIdInt}
        ORDER BY ac.created_at ASC
      `

      console.log(`✅ Query successful - found ${result.length} comments`)

      const comments = result.map((comment: any) => ({
        id: comment.id.toString(),
        content: comment.content,
        author: {
          id: comment.user_id,
          name: comment.first_name || 'Anonymous',
          avatar: `https://avatar.vercel.sh/${comment.user_id}`
        },
        createdAt: comment.created_at,
        updatedAt: comment.updated_at,
        isOwnComment: userId === comment.user_id
      }))

      return NextResponse.json(comments)
    } catch (dbError: any) {
      console.error('❌ Database error:', dbError)
      
      // Handle table not existing
      if (dbError.message && (dbError.message.includes('does not exist') || dbError.message.includes('relation'))) {
        console.log('⚠️ answer_comments table does not exist - returning empty array')
        return NextResponse.json([])
      }
      
      throw dbError
    }
  } catch (error) {
    console.error('❌ Error in GET /api/qna/comments:', error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: 'Failed to fetch comments', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
