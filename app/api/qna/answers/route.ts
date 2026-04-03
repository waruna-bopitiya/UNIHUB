import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const questionId = searchParams.get('questionId')

    if (!questionId) {
      return NextResponse.json(
        { error: 'questionId parameter is required' },
        { status: 400 }
      )
    }

    const questionIdNum = parseInt(questionId)

    // Fetch answers for the question
    const answers = await sql`
      SELECT 
        a.id,
        a.content,
        a.user_id,
        a.created_at,
        u.first_name,
        u.second_name
      FROM answers a
      JOIN users u ON a.user_id = u.id
      WHERE a.question_id = ${questionIdNum}
      ORDER BY a.created_at DESC
    `

    const formattedAnswers = answers.map((a: any) => ({
      id: a.id.toString(),
      content: a.content,
      author: {
        id: a.user_id,
        name: `${a.first_name}${a.second_name ? ' ' + a.second_name : ''}`,
        avatar: `https://avatar.vercel.sh/${a.first_name.toLowerCase()}`
      },
      upvotes: 0,
      downvotes: 0,
      createdAt: a.created_at,
      comments: []
    }))

    return Response.json(formattedAnswers)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Error fetching answers:', errorMessage)
    return Response.json(
      {
        error: 'Failed to fetch answers',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { questionId, userId, content } = body

    // Validate required fields
    if (!questionId || !userId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: questionId, userId, content' },
        { status: 400 }
      )
    }

    // Validate content length
    if (content.trim().length < 10 || content.trim().length > 5000) {
      return NextResponse.json(
        { error: 'Answer must be between 10 and 5000 characters' },
        { status: 400 }
      )
    }

    const questionIdNum = parseInt(questionId)

    // Check if question exists
    const questionExists = await sql`SELECT id FROM questions WHERE id = ${questionIdNum}`

    if (questionExists.length === 0) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    // Check if user exists
    const userExists = await sql`SELECT id FROM users WHERE id = ${userId}`

    if (userExists.length === 0) {
      return NextResponse.json(
        { error: 'User not found. Please log in first.' },
        { status: 401 }
      )
    }

    // Insert answer into database
    const result = await sql`
      INSERT INTO answers (question_id, user_id, content, created_at, updated_at)
      VALUES (${questionIdNum}, ${userId}, ${content.trim()}, NOW(), NOW())
      RETURNING 
        id,
        question_id,
        user_id,
        content,
        created_at
    `

    const newAnswer = result[0]

    // Fetch user details for response
    const userResult = await sql`
      SELECT first_name, second_name FROM users WHERE id = ${userId}
    `

    const user = userResult[0]

    return NextResponse.json(
      {
        success: true,
        message: 'Answer posted successfully',
        answerId: newAnswer.id,
        answer: {
          id: newAnswer.id.toString(),
          content: newAnswer.content,
          author: {
            id: userId,
            name: `${user.first_name}${user.second_name ? ' ' + user.second_name : ''}`,
            avatar: `https://avatar.vercel.sh/${user.first_name.toLowerCase()}`
          },
          upvotes: 0,
          downvotes: 0,
          createdAt: newAnswer.created_at,
          comments: []
        }
      },
      { status: 201 }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Error saving answer:', errorMessage)
    return NextResponse.json(
      {
        error: 'Failed to save answer',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}
