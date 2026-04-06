import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureTablesExist()

    const quizId = parseInt(params.id)

    if (isNaN(quizId)) {
      return NextResponse.json(
        { status: 'error', message: 'Invalid quiz ID' },
        { status: 400 }
      )
    }

    // Get quiz
    const quizzes = await sql`
      SELECT 
        id,
        title,
        description,
        creator,
        year,
        semester,
        course,
        category,
        difficulty,
        duration,
        participants,
        created_at,
        updated_at
      FROM quizzes
      WHERE id = ${quizId}
    `

    if (quizzes.length === 0) {
      return NextResponse.json(
        { status: 'error', message: 'Quiz not found' },
        { status: 404 }
      )
    }

    const quiz = quizzes[0]

    // Get questions
    const questions = await sql`
      SELECT 
        id,
        question_text as question,
        options,
        correct_answer as correctAnswer,
        question_order
      FROM quiz_questions
      WHERE quiz_id = ${quizId}
      ORDER BY question_order ASC
    `

    return NextResponse.json({
      status: 'success',
      data: {
        ...quiz,
        questions: questions.map((q) => ({
          id: q.id.toString(),
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
        })),
      },
    })
  } catch (error: any) {
    console.error('Error fetching quiz:', error)
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureTablesExist()

    const quizId = parseInt(params.id)

    if (isNaN(quizId)) {
      return NextResponse.json(
        { status: 'error', message: 'Invalid quiz ID' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const {
      title,
      description,
      creator,
      year,
      semester,
      course,
      category,
      difficulty,
      duration,
      questions,
    } = body

    // Check if quiz exists
    const existingQuiz = await sql`SELECT * FROM quizzes WHERE id = ${quizId}`
    if (existingQuiz.length === 0) {
      return NextResponse.json(
        { status: 'error', message: 'Quiz not found' },
        { status: 404 }
      )
    }

    // Update quiz
    await sql`
      UPDATE quizzes
      SET 
        title = ${title || existingQuiz[0].title},
        description = ${description || existingQuiz[0].description},
        creator = ${creator || existingQuiz[0].creator},
        year = ${year || existingQuiz[0].year},
        semester = ${semester || existingQuiz[0].semester},
        course = ${course || existingQuiz[0].course},
        category = ${category || existingQuiz[0].category},
        difficulty = ${difficulty || existingQuiz[0].difficulty},
        duration = ${duration || existingQuiz[0].duration},
        updated_at = NOW()
      WHERE id = ${quizId}
    `

    // Delete old questions if new questions provided
    if (Array.isArray(questions)) {
      await sql`DELETE FROM quiz_questions WHERE quiz_id = ${quizId}`

      // Insert new questions
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i]
        await sql`
          INSERT INTO quiz_questions
            (quiz_id, question_text, options, correct_answer, question_order)
          VALUES
            (${quizId}, ${q.question}, ${q.options}, ${q.correctAnswer}, ${i})
        `
      }
    }

    return NextResponse.json({
      status: 'success',
      message: 'Quiz updated successfully',
    })
  } catch (error: any) {
    console.error('Error updating quiz:', error)
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    )
  }
}
