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
    const { answers, participantName = 'Anonymous', quizData } = body

    console.log('📝 Quiz submission received:', {
      quizId,
      participantName,
      answersCount: answers?.length,
      hasQuizData: !!quizData,
    })

    if (!Array.isArray(answers)) {
      return NextResponse.json(
        { status: 'error', message: 'Answers must be an array' },
        { status: 400 }
      )
    }

    // Debug: Log all available quizzes
    console.log('🔍 Debugging: Listing all quizzes in database...')
    const allQuizzes = await sqlWithRetry(() =>
      sql`SELECT id, title FROM quizzes LIMIT 10`
    )
    console.log('📊 Quizzes in database:', allQuizzes.map((q: any) => ({ id: q.id, title: q.title })))

    // Get quiz and questions with retry logic
    console.log('🔍 Fetching quiz details from database for ID:', quizId, 'Type:', typeof quizId)
    const quizzes = await sqlWithRetry(() =>
      sql`SELECT id, title FROM quizzes WHERE id = ${quizId}`
    )

    let quiz: any
    let questions: any[]

    if (quizzes && quizzes.length > 0) {
      // Quiz found in database
      quiz = quizzes[0]
      console.log('✅ Quiz found in database:', { id: quiz.id, title: quiz.title })

      questions = await sqlWithRetry(() =>
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
    } else if (quizData && Array.isArray(quizData.questions)) {
      // Quiz not in database - use quiz data from request (for mock quizzes)
      console.log('⚠️  Quiz not found in database, using quiz data from request (mock quiz)')
      quiz = { id: quizId, title: quizData.title || 'Quiz' }
      questions = quizData.questions.map((q: any) => ({
        id: q.id,
        correctAnswer: q.correctAnswer,
      }))
    } else {
      console.error('❌ Quiz not found with ID:', quizId)
      console.error('⚠️  Available quizzes:', allQuizzes.length > 0 ? allQuizzes : 'No quizzes in database')
      return NextResponse.json(
        { status: 'error', message: `Quiz not found (ID: ${quizId})` },
        { status: 404 }
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

    // Build detailed results for each question
    const detailedResults = []
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i]
      const userAnswer = answers[i]
      const correctAnswer = question.correctAnswer
      const isCorrect = userAnswer === correctAnswer

      detailedResults.push({
        questionId: question.id,
        questionText: quizData?.questions?.[i]?.question || `Question ${i + 1}`,
        userAnswer: userAnswer,
        correctAnswer: correctAnswer,
        options: quizData?.questions?.[i]?.options || [],
        isCorrect: isCorrect,
      })
    }

    console.log('📋 Detailed results prepared:', detailedResults.length, 'questions')

    // Only store response in database if quiz is a real database quiz (not a mock quiz)
    let response: any = null
    if (quizzes && quizzes.length > 0) {
      // This is a database quiz, store the response
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

      response = result[0]
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
    } else {
      // This is a mock quiz - don't store in database
      console.log('⚠️  Mock quiz submission - not storing in database')
      response = {
        score,
        total_questions: questions.length,
        date_taken: new Date().toISOString(),
      }
    }

    return NextResponse.json({
      status: 'success',
      message: 'Quiz submitted successfully',
      data: {
        score: response.score,
        totalQuestions: response.total_questions,
        percentage: Math.round((response.score / response.total_questions) * 100),
        dateTaken: response.date_taken,
        results: detailedResults,
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
