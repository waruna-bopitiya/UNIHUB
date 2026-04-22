import { NextRequest, NextResponse } from 'next/server'
import { sql, sqlWithRetry } from '@/lib/db'
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

    // Get quiz with retry logic
    console.log('🔍 Fetching quiz with ID:', quizId)
    const quizzes = await sqlWithRetry(() =>
      sql`
        SELECT 
          id,
          title,
          description,
          creator,
          year,
          semester,
          subject_code,
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

    // Get questions with retry logic
    console.log('📚 Fetching questions for quiz ID:', quizId)
    const questions = await sqlWithRetry(() =>
      sql`
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
    )

    console.log('✅ Questions fetched:', questions.length, 'questions')

    return NextResponse.json({
      status: 'success',
      data: {
        ...quiz,
        questions: (questions || []).map((q) => ({
          id: q.id.toString(),
          question: q.question,
          options: Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]'),
          correctAnswer: parseInt(q.correctAnswer) || 0,
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
    const {
      title,
      description,
      creator,
      year,
      semester,
      course,
      subjectCode,
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

    // Resolve subject linkage if year/semester/course/subjectCode changed
    const nextYear = year || existingQuiz[0].year
    const nextSemester = semester || existingQuiz[0].semester
    const nextCourse = (course || existingQuiz[0].course || '').trim()
    const nextSubjectCode = typeof subjectCode === 'string' && subjectCode.trim().length > 0
      ? subjectCode.trim()
      : (existingQuiz[0].subject_code || '').trim()

    const subjectRows = nextSubjectCode
      ? await sqlWithRetry(() =>
          sql`
            SELECT subject_code, subject_name
            FROM subject4years
            WHERE year = ${nextYear}
              AND semester = ${nextSemester}
              AND subject_code = ${nextSubjectCode}
            LIMIT 1
          `,
        )
      : await sqlWithRetry(() =>
          sql`
            SELECT subject_code, subject_name
            FROM subject4years
            WHERE year = ${nextYear}
              AND semester = ${nextSemester}
              AND LOWER(TRIM(subject_name)) = LOWER(TRIM(${nextCourse}))
            LIMIT 1
          `,
        )

    if (!subjectRows || subjectRows.length === 0) {
      return NextResponse.json(
        {
          status: 'error',
          message:
            'Selected subject is not valid for the selected year and semester. Please choose a subject from the module list.',
        },
        { status: 400 },
      )
    }

    const subject = subjectRows[0] as any

    // Update quiz
    await sql`
      UPDATE quizzes
      SET 
        title = ${title || existingQuiz[0].title},
        description = ${description || existingQuiz[0].description},
        creator = ${creator || existingQuiz[0].creator},
        year = ${nextYear},
        semester = ${nextSemester},
        subject_code = ${subject.subject_code},
        course = ${subject.subject_name},
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
