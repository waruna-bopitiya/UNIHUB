import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'

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
    const { answers, participantName = 'Anonymous' } = body

    if (!Array.isArray(answers)) {
      return NextResponse.json(
        { status: 'error', message: 'Answers must be an array' },
        { status: 400 }
      )
    }

    // Get quiz and questions
    const quizzes = await sql`
      SELECT id, title FROM quizzes WHERE id = ${quizId}
    `

    if (quizzes.length === 0) {
      return NextResponse.json(
        { status: 'error', message: 'Quiz not found' },
        { status: 404 }
      )
    }

    const quiz = quizzes[0]

    const questions = await sql`
      SELECT 
        id,
        correct_answer as correctAnswer,
        question_order
      FROM quiz_questions
      WHERE quiz_id = ${quizId}
      ORDER BY question_order ASC
    `

    if (questions.length === 0) {
      return NextResponse.json(
        { status: 'error', message: 'Quiz has no questions' },
        { status: 400 }
      )
    }

    if (answers.length !== questions.length) {
      return NextResponse.json(
        {
          status: 'error',
          message: `Expected ${questions.length} answers, got ${answers.length}`,
        },
        { status: 400 }
      )
    }

    // Calculate score
    let score = 0
    for (let i = 0; i < questions.length; i++) {
      if (answers[i] === questions[i].correctAnswer) {
        score++
      }
    }

    // Store response
    const [response] = await sql`
      INSERT INTO quiz_responses
        (quiz_id, participant_name, answers, score, total_questions, date_taken)
      VALUES
        (${quizId}, ${participantName}, ${answers}, ${score}, ${questions.length}, NOW())
      RETURNING id, score, total_questions, date_taken
    `

    // Update participants count
    await sql`
      UPDATE quizzes
      SET participants = participants + 1
      WHERE id = ${quizId}
    `

    return NextResponse.json({
      status: 'success',
      message: 'Quiz submitted successfully',
      data: {
        score: response.score,
        totalQuestions: response.total_questions,
        percentage: Math.round((response.score / response.total_questions) * 100),
        dateTaken: response.date_taken,
      },
    })
  } catch (error: any) {
    console.error('Error submitting quiz:', error)
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    )
  }
}
