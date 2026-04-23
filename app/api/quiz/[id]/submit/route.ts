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
    const { answers, participantName = 'Anonymous', participantId } = body

    console.log('📝 Quiz submission received:', { quizId, participantName, participantId, answersCount: answers?.length })

    if (!Array.isArray(answers)) {
      return NextResponse.json(
        { status: 'error', message: 'Answers must be an array' },
        { status: 400 }
      )
    }

    // Get quiz and questions with retry logic
    const quizzes = await sqlWithRetry(() =>
      sql`SELECT id, title FROM quizzes WHERE id = ${quizId}`
    )

    let quiz: any
    let questions: any[]

    if (quizzes && quizzes.length > 0) {
      quiz = quizzes[0]

      questions = await sqlWithRetry(() =>
        sql`
          SELECT 
            id,
            question_text,
            options,
            correct_answer,
            question_order
          FROM quiz_questions
          WHERE quiz_id = ${quizId}
          ORDER BY question_order ASC
        `
      )

      if (!questions || questions.length === 0) {
        return NextResponse.json(
          { status: 'error', message: 'Quiz has no questions' },
          { status: 400 }
        )
      }
    } else {
      return NextResponse.json(
        { status: 'error', message: `Quiz not found (ID: ${quizId})` },
        { status: 404 }
      )
    }

    let resolvedParticipantId: string | null = null
    let resolvedParticipantName = (participantName || 'Anonymous').trim() || 'Anonymous'

    if (typeof participantId === 'string' && participantId.trim()) {
      const users = await sqlWithRetry(() =>
        sql`
          SELECT id, first_name
          FROM users
          WHERE id = ${participantId.trim()}
          LIMIT 1
        `,
      )

      if (users.length > 0) {
        resolvedParticipantId = users[0].id
        resolvedParticipantName = users[0].first_name || resolvedParticipantName
      }
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

    const normalizedAnswers = answers.map((a: unknown) => {
      const n = Number(a)
      return Number.isInteger(n) && n >= 0 ? n : -1
    })

    // Calculate score
    let score = 0
    for (let i = 0; i < questions.length; i++) {
      const userAnswer = normalizedAnswers[i]
      const rawCorrectAnswer = questions[i].correct_answer
      const correctAnswer = typeof rawCorrectAnswer === 'string'
        ? Number(rawCorrectAnswer)
        : Number(rawCorrectAnswer)
      if (userAnswer === correctAnswer) {
        score++
      }
    }

    const totalQuestions = questions.length
    const percentage = totalQuestions > 0 ? Number(((score / totalQuestions) * 100).toFixed(2)) : 0

    // Build detailed results for each question
    const detailedResults = []
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i]
      const userAnswer = normalizedAnswers[i]
      const correctAnswer = question.correct_answer
      const normalizedUserAnswer = Number(userAnswer)
      const normalizedCorrectAnswer = typeof correctAnswer === 'string'
        ? Number(correctAnswer)
        : Number(correctAnswer)
      const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer

      // Parse options - handle both array and string formats
      const parsedOptions = Array.isArray(question.options)
        ? question.options
        : JSON.parse(question.options || '[]')

      detailedResults.push({
        questionId: question.id,
        questionText: question.question_text || `Question ${i + 1}`,
        userAnswer: normalizedUserAnswer,
        correctAnswer: normalizedCorrectAnswer,
        options: parsedOptions,
        isCorrect: isCorrect,
      })
    }

    const result = await sqlWithRetry(() =>
      sql`
        INSERT INTO quiz_responses
          (quiz_id, participant_id, participant_name, answers, score, total_questions, percentage, submitted_at)
        VALUES
          (${quizId}, ${resolvedParticipantId}, ${resolvedParticipantName}, ${normalizedAnswers}, ${score}, ${totalQuestions}, ${percentage}, NOW())
        RETURNING id, score, total_questions, percentage, date_taken, created_at
      `
    )

    if (!result || result.length === 0) {
      throw new Error('Failed to insert quiz response - no result returned')
    }

    const response = result[0]

    // Keep participants count in sync with distinct takers for this quiz
    await sqlWithRetry(() =>
      sql`
        UPDATE quizzes q
        SET participants = stats.takers
        FROM (
          SELECT
            quiz_id,
            COUNT(DISTINCT COALESCE(participant_id, participant_name))::int AS takers
          FROM quiz_responses
          WHERE quiz_id = ${quizId}
          GROUP BY quiz_id
        ) stats
        WHERE q.id = stats.quiz_id
      `,
    )

    const avgRows = await sqlWithRetry(() =>
      sql`
        SELECT
          COALESCE(ROUND(AVG(percentage), 2), 0)::float AS average_percentage,
          COUNT(*)::int AS attempts,
          COUNT(DISTINCT COALESCE(participant_id, participant_name))::int AS participants
        FROM quiz_responses
        WHERE quiz_id = ${quizId}
      `,
    )

    const quizAverage = avgRows[0] || { average_percentage: 0, attempts: 0, participants: 0 }

    return NextResponse.json({
      status: 'success',
      message: 'Quiz submitted successfully',
      data: {
        score: response.score,
        totalQuestions: response.total_questions,
        percentage: Number(response.percentage ?? percentage),
        dateTaken: response.date_taken,
        results: detailedResults,
        quizStats: {
          averageScore: Number(quizAverage.average_percentage || 0),
          attempts: Number(quizAverage.attempts || 0),
          participants: Number(quizAverage.participants || 0),
        },
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
