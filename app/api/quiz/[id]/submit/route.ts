import { NextRequest, NextResponse } from 'next/server'
import { sql, sqlWithRetry } from '@/lib/db'
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

    console.log('📝 Quiz submission received:', {
      quizId,
      participantName,
      answersCount: answers?.length,
    })

    if (!Array.isArray(answers)) {
      return NextResponse.json(
        { status: 'error', message: 'Answers must be an array' },
        { status: 400 }
      )
    }

    // Get quiz and questions with retry logic
    console.log('🔍 Fetching quiz details from database...')
    const quizzes = await sqlWithRetry(() =>
      sql`SELECT id, title FROM quizzes WHERE id = ${quizId}`
    )

    if (!quizzes || quizzes.length === 0) {
      console.error('❌ Quiz not found with ID:', quizId)
      return NextResponse.json(
        { status: 'error', message: `Quiz not found (ID: ${quizId})` },
        { status: 404 }
      )
    }

    const quiz = quizzes[0]
    console.log('✅ Quiz found:', { id: quiz.id, title: quiz.title })

    const questions = await sqlWithRetry(() =>
      sql`
        SELECT 
          id,
          correct_answer as correctAnswer,
          question_order
        FROM quiz_questions
        WHERE quiz_id = ${quizId}
        ORDER BY question_order ASC
      `
    )

    if (!questions || questions.length === 0) {
      console.error('❌ Quiz has no questions with ID:', quizId)
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

    console.log('📊 Score calculated:', { score, total: questions.length })

    // Store response with retry logic
    console.log('💾 Attempting to insert quiz response with data:', {
      quizId,
      participantName,
      answersCount: answers.length,
      questionsCount: questions.length,
      score,
      answers: answers.slice(0, 3), // Log first 3 answers for debugging
    })
    const result = await sqlWithRetry(() =>
      sql`
        INSERT INTO quiz_responses
          (quiz_id, participant_name, answers, score, total_questions)
        VALUES
          (${quizId}, ${participantName}, ${answers}, ${score}, ${questions.length})
        RETURNING id, score, total_questions, date_taken, created_at
      `
    )

    if (!result || result.length === 0) {
      throw new Error('Failed to insert quiz response - no result returned')
    }

    const response = result[0]
    console.log('✅ Quiz response saved:', { id: response.id, score: response.score })

    // Update participants count with retry logic
    console.log('📈 Updating participants count...')
    await sqlWithRetry(() =>
      sql`
        UPDATE quizzes
        SET participants = participants + 1
        WHERE id = ${quizId}
      `
    )

    console.log('✅ Participants count updated')

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
    console.error('❌ Error submitting quiz:', error.message)
    console.error('Error details:', error.stack)
    console.error('Full error:', JSON.stringify(error, null, 2))
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to submit quiz', details: error.toString() },
      { status: 500 }
    )
  }
}
