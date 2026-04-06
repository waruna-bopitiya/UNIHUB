import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'

export async function GET(req: NextRequest) {
  try {
    await ensureTablesExist()

    // Get query parameters for filtering
    const searchParams = req.nextUrl.searchParams
    const year = searchParams.get('year')
    const semester = searchParams.get('semester')
    const course = searchParams.get('course')
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')

    let quizzes: any[] = []

    // Build query based on provided filters
    if (year && semester && course && category && difficulty) {
      quizzes = await sql`
        SELECT id, title, description, creator, year, semester, course, category, difficulty, duration, participants, created_at, updated_at
        FROM quizzes
        WHERE year = ${parseInt(year)} AND semester = ${parseInt(semester)} AND course = ${course} AND category = ${category} AND difficulty = ${difficulty}
        ORDER BY created_at DESC LIMIT 100
      `
    } else if (year && semester && course && category) {
      quizzes = await sql`
        SELECT id, title, description, creator, year, semester, course, category, difficulty, duration, participants, created_at, updated_at
        FROM quizzes
        WHERE year = ${parseInt(year)} AND semester = ${parseInt(semester)} AND course = ${course} AND category = ${category}
        ORDER BY created_at DESC LIMIT 100
      `
    } else if (year && semester && course) {
      quizzes = await sql`
        SELECT id, title, description, creator, year, semester, course, category, difficulty, duration, participants, created_at, updated_at
        FROM quizzes
        WHERE year = ${parseInt(year)} AND semester = ${parseInt(semester)} AND course = ${course}
        ORDER BY created_at DESC LIMIT 100
      `
    } else if (year && semester) {
      quizzes = await sql`
        SELECT id, title, description, creator, year, semester, course, category, difficulty, duration, participants, created_at, updated_at
        FROM quizzes
        WHERE year = ${parseInt(year)} AND semester = ${parseInt(semester)}
        ORDER BY created_at DESC LIMIT 100
      `
    } else if (difficulty) {
      quizzes = await sql`
        SELECT id, title, description, creator, year, semester, course, category, difficulty, duration, participants, created_at, updated_at
        FROM quizzes
        WHERE difficulty = ${difficulty}
        ORDER BY created_at DESC LIMIT 100
      `
    } else if (category) {
      quizzes = await sql`
        SELECT id, title, description, creator, year, semester, course, category, difficulty, duration, participants, created_at, updated_at
        FROM quizzes
        WHERE category ILIKE ${`%${category}%`}
        ORDER BY created_at DESC LIMIT 100
      `
    } else {
      quizzes = await sql`
        SELECT id, title, description, creator, year, semester, course, category, difficulty, duration, participants, created_at, updated_at
        FROM quizzes
        ORDER BY created_at DESC LIMIT 100
      `
    }

    return NextResponse.json({
      status: 'success',
      data: quizzes,
      count: quizzes.length,
    })
  } catch (error: any) {
    console.error('Error fetching quizzes:', error)
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureTablesExist()

    const body = await req.json()
    console.log('📝 Creating quiz with data:', JSON.stringify(body, null, 2))
    
    let {
      title,
      description,
      creator,
      creatorId,
      year,
      semester,
      course,
      category,
      difficulty,
      duration,
      questions,
    } = body
    
    // Convert year and semester to numbers
    year = typeof year === 'string' ? parseInt(year) : year
    semester = typeof semester === 'string' ? parseInt(semester) : semester
    
    console.log('📋 Extracted:', { title, creator, creatorId, year, semester, course, difficulty, duration, questionsCount: questions?.length })

    // Validation
    if (!title?.trim()) {
      return NextResponse.json(
        { status: 'error', message: 'Quiz title is required' },
        { status: 400 }
      )
    }

    if (!creator?.trim()) {
      return NextResponse.json(
        { status: 'error', message: 'Creator name is required' },
        { status: 400 }
      )
    }

    // Validate permissions: check if creator has permission to create for this year/semester
    if (creatorId) {
      try {
        console.log('🔐 Validating permissions for creator:', creatorId)
        const creator_users = await sql`
          SELECT year_of_university, semester FROM users WHERE id = ${creatorId}
        `

        if (creator_users.length === 0) {
          console.error('❌ Creator not found:', creatorId)
          return NextResponse.json(
            { status: 'error', message: 'Creator user not found' },
            { status: 404 }
          )
        }

        const creator_user = creator_users[0] as any
        const creatorYear = creator_user.year_of_university
        const creatorSemester = creator_user.semester

        // Calculate allowed years: 1 to creatorYear
        const allowedYears = Array.from({ length: creatorYear }, (_, i) => i + 1)
        
        // Calculate allowed semesters: 1 to creatorSemester
        const allowedSemesters = Array.from({ length: creatorSemester }, (_, i) => i + 1)

        // Check if selected year and semester are allowed
        if (!allowedYears.includes(year)) {
          console.error('❌ Permission denied: User cannot create for Year', year)
          return NextResponse.json(
            { 
              status: 'error', 
              message: `You can only create quizzes for Years ${allowedYears.join(', ')}. You are Year ${creatorYear}.` 
            },
            { status: 403 }
          )
        }

        if (!allowedSemesters.includes(semester)) {
          console.error('❌ Permission denied: User cannot create for Semester', semester)
          return NextResponse.json(
            { 
              status: 'error', 
              message: `You can only create quizzes for Semesters ${allowedSemesters.join(', ')}. You are Semester ${creatorSemester}.` 
            },
            { status: 403 }
          )
        }

        console.log('✅ Permission validated: User can create for Year', year, 'Semester', semester)
      } catch (err) {
        console.error('❌ Permission check error:', err)
        // Continue without permission check in case of DB error
      }
    }

    if (isNaN(year) || year < 1 || year > 4) {
      return NextResponse.json(
        { status: 'error', message: 'Year must be a number between 1 and 4' },
        { status: 400 }
      )
    }

    if (isNaN(semester) || semester < 1 || semester > 2) {
      return NextResponse.json(
        { status: 'error', message: 'Semester must be a number between 1 and 2' },
        { status: 400 }
      )
    }

    if (!course?.trim()) {
      return NextResponse.json(
        { status: 'error', message: 'Course is required' },
        { status: 400 }
      )
    }

    if (!difficulty || !['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      return NextResponse.json(
        { status: 'error', message: 'Valid difficulty level is required' },
        { status: 400 }
      )
    }

    if (!duration || duration <= 0) {
      return NextResponse.json(
        { status: 'error', message: 'Valid duration is required' },
        { status: 400 }
      )
    }

    if (!Array.isArray(questions) || questions.length < 1) {
      return NextResponse.json(
        { status: 'error', message: 'At least one question is required' },
        { status: 400 }
      )
    }

    // Validate questions
    for (const q of questions) {
      if (!q.question?.trim()) {
        return NextResponse.json(
          { status: 'error', message: 'All questions must have text' },
          { status: 400 }
        )
      }

      if (!Array.isArray(q.options) || q.options.length < 2) {
        return NextResponse.json(
          { status: 'error', message: 'Each question must have at least 2 options' },
          { status: 400 }
        )
      }

      if (
        q.correctAnswer === undefined ||
        q.correctAnswer < 0 ||
        q.correctAnswer >= q.options.length
      ) {
        return NextResponse.json(
          { status: 'error', message: 'Invalid correct answer index' },
          { status: 400 }
        )
      }
    }

    // Insert quiz
    console.log('💾 Inserting quiz into database with:', { title: title.trim(), year, semester, course: course.trim(), category: category?.trim() || 'General', difficulty, duration })
    
    let quiz: any
    try {
      const result = await sql`
        INSERT INTO quizzes
          (title, description, creator, year, semester, course, category, difficulty, duration, participants)
        VALUES
          (${title.trim()}, ${description?.trim() || null}, ${creator.trim()}, ${year}, ${semester}, ${course.trim()}, ${category?.trim() || 'General'}, ${difficulty}, ${duration}, 0)
        RETURNING id, title, description, creator, year, semester, course, category, difficulty, duration, participants, created_at, updated_at
      `
      quiz = result[0]
      console.log('✅ Quiz inserted successfully:', { id: quiz.id, title: quiz.title, year: quiz.year, semester: quiz.semester, course: quiz.course })
    } catch (insertError: any) {
      console.error('❌ Error inserting quiz into quizzes table:', insertError.message)
      throw new Error(`Failed to insert quiz: ${insertError.message}`)
    }

    // Insert questions
    console.log('📚 Inserting', questions.length, 'questions for quiz ID:', quiz.id)
    try {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i]
        await sql`
          INSERT INTO quiz_questions
            (quiz_id, question_text, options, correct_answer, question_order)
          VALUES
            (${quiz.id}, ${q.question.trim()}, ${q.options}, ${q.correctAnswer}, ${i})
        `
      }
      console.log('✅ All questions inserted successfully')
    } catch (questionsError: any) {
      console.error('❌ Error inserting quiz questions:', questionsError.message)
      throw new Error(`Failed to insert questions: ${questionsError.message}`)
    }
    
    console.log('🎉 Quiz creation complete with ID:', quiz.id)

    return NextResponse.json(
      {
        status: 'success',
        message: 'Quiz created successfully',
        data: { ...quiz, questions: questions.length },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating quiz:', error)
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    )
  }
}
