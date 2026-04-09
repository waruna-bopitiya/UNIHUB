import { neon } from '@neondatabase/serverless'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set')
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const participantName = searchParams.get('participantName')
  const viewType = searchParams.get('viewType') || 'courseByYear' // 'courseByYear' or 'quizTakers'
  const year = searchParams.get('year')

  console.log('📊 Fetching score statistics...', { participantName, viewType, year })

  try {
    const dbUrl = databaseUrl || process.env.DATABASE_URL
    if (!dbUrl) {
      throw new Error('DATABASE_URL is not configured')
    }

    const db = neon(dbUrl)

    // Fetch all quiz responses with related quiz information
    const responses = await db`
      SELECT 
        qr.id,
        qr.quiz_id,
        qr.participant_name,
        qr.score,
        qr.created_at,
        q.title as quiz_title,
        q.year,
        q.semester,
        q.course,
        (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.id) as total_questions
      FROM quiz_responses qr
      JOIN quizzes q ON qr.quiz_id = q.id
      WHERE qr.participant_name IS NOT NULL
      ORDER BY q.year, q.semester, q.course
    `

    if (!Array.isArray(responses) || responses.length === 0) {
      console.log('✅ No score data found')
      return Response.json({
        status: 'success',
        data: {
          courseByYear: [],
          quizTakers: [],
          summary: {
            totalAttempts: 0,
            averageScore: 0,
            totalParticipants: 0,
          },
        },
      })
    }

    console.log(`✅ Fetched ${responses.length} quiz responses for score calculation`)

    // Parse and organize data
    const scoreData = responses.map((r: any) => ({
      quizId: r.quiz_id,
      quizTitle: r.quiz_title,
      participantName: r.participant_name,
      score: r.score,
      totalQuestions: r.total_questions,
      year: r.year,
      semester: r.semester,
      course: r.course,
      dateTaken: r.created_at,
    }))

    // Calculate course-by-year scores
    const courseByYearMap = new Map<
      string,
      {
        year: number
        semester: number
        courses: Map<
          string,
          {
            course: string
            participants: number
            attempts: number
            avgScore: number
            quizIds: string[]
          }
        >
      }
    >()

    scoreData.forEach((data) => {
      const key = `${data.year}-${data.semester}`
      if (!courseByYearMap.has(key)) {
        courseByYearMap.set(key, {
          year: data.year,
          semester: data.semester,
          courses: new Map(),
        })
      }

      const yearSemData = courseByYearMap.get(key)!
      if (!yearSemData.courses.has(data.course)) {
        yearSemData.courses.set(data.course, {
          course: data.course,
          participants: 0,
          attempts: 0,
          avgScore: 0,
          quizIds: [],
        })
      }

      const courseData = yearSemData.courses.get(data.course)!
      courseData.attempts += 1
      courseData.participants = new Set([...new Set([courseData.participants]), data.participantName]).size
      if (!courseData.quizIds.includes(data.quizId)) {
        courseData.quizIds.push(data.quizId)
      }
    })

    // Convert to array and calculate averages
    const courseByYearArray = Array.from(courseByYearMap.values()).map((yearSemData) => {
      const chartData = Array.from(yearSemData.courses.values()).map((courseData) => {
        const courseAttempts = scoreData.filter((d) => d.course === courseData.course)
        const avgScore =
          courseAttempts.length > 0
            ? Math.round(
                (courseAttempts.reduce((sum, d) => sum + (d.score / d.totalQuestions) * 100, 0) /
                  courseAttempts.length) *
                  10,
              ) / 10
            : 0

        return {
          course: courseData.course,
          shortCourse: courseData.course.length > 15 ? `${courseData.course.slice(0, 12)}...` : courseData.course,
          participants: courseData.participants,
          attempts: courseData.attempts,
          avgScore,
        }
      })

      return {
        year: yearSemData.year,
        semester: yearSemData.semester,
        chartData: chartData.sort((a, b) => a.course.localeCompare(b.course)),
      }
    })

    // Calculate quiz takers scores
    const quizTakerMap = new Map<
      string,
      {
        year: number
        semester: number
        course: string
        participants: Map<string, { name: string; attempts: number; totalPercentage: number }>
      }
    >()

    scoreData.forEach((data) => {
      const key = `${data.year}-${data.semester}-${data.course}`
      if (!quizTakerMap.has(key)) {
        quizTakerMap.set(key, {
          year: data.year,
          semester: data.semester,
          course: data.course,
          participants: new Map(),
        })
      }

      const groupData = quizTakerMap.get(key)!
      if (!groupData.participants.has(data.participantName)) {
        groupData.participants.set(data.participantName, {
          name: data.participantName,
          attempts: 0,
          totalPercentage: 0,
        })
      }

      const participantData = groupData.participants.get(data.participantName)!
      participantData.attempts += 1
      participantData.totalPercentage += (data.score / data.totalQuestions) * 100
    })

    // Convert to array
    const quizTakersArray = Array.from(quizTakerMap.values())
      .map((groupData) => ({
        year: groupData.year,
        semester: groupData.semester,
        course: groupData.course,
        rows: Array.from(groupData.participants.values())
          .map((p) => ({
            name: p.name,
            attempts: p.attempts,
            averageScore: Math.round((p.totalPercentage / p.attempts) * 10) / 10,
          }))
          .sort((a, b) => b.averageScore - a.averageScore),
      }))
      .sort((a, b) => (a.year === b.year ? (a.semester === b.semester ? a.course.localeCompare(b.course) : a.semester - b.semester) : a.year - b.year))

    // Calculate summary
    const totalAttempts = scoreData.length
    const averageScore =
      scoreData.length > 0
        ? Math.round((scoreData.reduce((sum, d) => sum + (d.score / d.totalQuestions) * 100, 0) / scoreData.length) * 10) /
          10
        : 0
    const totalParticipants = new Set(scoreData.map((d) => d.participantName)).size

    console.log('✅ Score statistics calculated successfully')

    return Response.json({
      status: 'success',
      data: {
        courseByYear: courseByYearArray,
        quizTakers: quizTakersArray,
        summary: {
          totalAttempts,
          averageScore,
          totalParticipants,
        },
      },
    })
  } catch (error) {
    console.error('❌ Error fetching score statistics:', error)
    return Response.json(
      {
        status: 'error',
        message: 'Failed to fetch score statistics',
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
