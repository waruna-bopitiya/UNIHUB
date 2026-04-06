import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { userId, title, content, subjectCode, year, semester } = body

    // Validate required fields
    if (!userId || !title || !content || !subjectCode || !year || !semester) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, title, content, subjectCode, year, semester' },
        { status: 400 }
      )
    }

    // Validate string lengths
    if (title.trim().length < 10 || title.trim().length > 500) {
      return NextResponse.json(
        { error: 'Title must be between 10 and 500 characters' },
        { status: 400 }
      )
    }

    if (content.trim().length < 20 || content.trim().length > 5000) {
      return NextResponse.json(
        { error: 'Content must be between 20 and 5000 characters' },
        { status: 400 }
      )
    }

    // Validate year and semester
    const yearNum = parseInt(year)
    const semesterNum = parseInt(semester)

    if (isNaN(yearNum) || yearNum < 1 || yearNum > 4) {
      return NextResponse.json(
        { error: 'Year must be between 1 and 4' },
        { status: 400 }
      )
    }

    if (isNaN(semesterNum) || semesterNum < 1 || semesterNum > 2) {
      return NextResponse.json(
        { error: 'Semester must be between 1 and 2' },
        { status: 400 }
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

    // Insert question into database
    const result = await sql`
      INSERT INTO questions (user_id, title, content, subject_code, year, semester, created_at, updated_at)
      VALUES (${userId}, ${title.trim()}, ${content.trim()}, ${subjectCode}, ${yearNum}, ${semesterNum}, NOW(), NOW())
      RETURNING id, user_id, title, content, subject_code, year, semester, created_at
    `

    const newQuestion = result[0]

    return NextResponse.json(
      {
        success: true,
        message: 'Question posted successfully',
        questionId: newQuestion.id,
        question: newQuestion
      },
      { status: 201 }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Error saving question:', errorMessage)
    return NextResponse.json(
      {
        error: 'Failed to save question',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}
