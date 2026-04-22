import { neon } from '@neondatabase/serverless'
import { ensureTablesExist } from '@/lib/db-init'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set')
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const participantName = searchParams.get('participantName')
  const year = searchParams.get('year')

  console.log('📊 Fetching score statistics...', { participantName, year })

  try {
    await ensureTablesExist()

    const dbUrl = databaseUrl || process.env.DATABASE_URL
    if (!dbUrl) {
      throw new Error('DATABASE_URL is not configured')
    }

    const db = neon(dbUrl)

    const parsedYear = year ? Number.parseInt(year, 10) : null
    const yearFilter = parsedYear && Number.isFinite(parsedYear) ? parsedYear : null
    const responses = await db`
      SELECT
        qr.id,
        qr.quiz_id,
        qr.participant_name,
        qr.score,
        qr.created_at,
        q.title AS quiz_title,
        q.year,
        q.semester,
        q.subject_code,
        q.course,
        COALESCE(s.subject_name, q.course) AS subject_name,
        (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.id) AS total_questions
      FROM quiz_responses qr
      JOIN quizzes q ON qr.quiz_id = q.id
      LEFT JOIN subject4years s
        ON s.year = q.year
       AND s.semester = q.semester
       AND s.subject_code = q.subject_code
      WHERE qr.participant_name IS NOT NULL
        AND (${participantName}::text IS NULL OR qr.participant_name = ${participantName})
        AND (${yearFilter}::int IS NULL OR q.year = ${yearFilter})
      ORDER BY q.year, q.semester, COALESCE(q.subject_code, q.course), qr.created_at DESC
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
      score: Number(r.score) || 0,
      totalQuestions: Number(r.total_questions) || 0,
      year: Number(r.year) || 0,
      semester: Number(r.semester) || 0,
      subjectCode: r.subject_code,
      subjectName: r.subject_name,
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
            subjectCode: string
            course: string
            participants: Set<string>
            attempts: number
            totalPercentage: number
          }
        >
      }
    >()

    scoreData.forEach((data) => {
      const key = `${data.year}-${data.semester}`
      const subjectKey = data.subjectCode || data.course
      if (!courseByYearMap.has(key)) {
        courseByYearMap.set(key, {
          year: data.year,
          semester: data.semester,
          courses: new Map(),
        })
      }

      const yearSemData = courseByYearMap.get(key)!
      if (!yearSemData.courses.has(subjectKey)) {
        yearSemData.courses.set(subjectKey, {
          subjectCode: data.subjectCode || data.course,
          course: data.subjectName || data.course,
          participants: new Set<string>(),
          attempts: 0,
          totalPercentage: 0,
        })
      }

      const courseData = yearSemData.courses.get(subjectKey)!
      courseData.attempts += 1
      courseData.participants.add(data.participantName)
      if (data.totalQuestions > 0) {
        courseData.totalPercentage += (data.score / data.totalQuestions) * 100
      }
    })

    // Convert to array and calculate averages
    const courseByYearArray = Array.from(courseByYearMap.values()).map((yearSemData) => {
      const chartData = Array.from(yearSemData.courses.values()).map((courseData) => {
        const avgScore =
          courseData.attempts > 0
            ? Math.round((courseData.totalPercentage / courseData.attempts) * 10) / 10
            : 0
        return {
          subjectCode: courseData.subjectCode,
          course: courseData.course,
          shortCourse: courseData.course.length > 15 ? `${courseData.course.slice(0, 12)}...` : courseData.course,
          participants: courseData.participants.size,
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
      const key = `${data.year}-${data.semester}-${data.subjectCode || data.course}`
      if (!quizTakerMap.has(key)) {
        quizTakerMap.set(key, {
          year: data.year,
          semester: data.semester,
          course: data.subjectName || data.course,
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
      if (data.totalQuestions > 0) {
        participantData.totalPercentage += (data.score / data.totalQuestions) * 100
      }
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
    const validScoreAttempts = scoreData.filter((d) => d.totalQuestions > 0)
    const averageScore =
      validScoreAttempts.length > 0
        ? Math.round((validScoreAttempts.reduce((sum, d) => sum + (d.score / d.totalQuestions) * 100, 0) / validScoreAttempts.length) * 10) /
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
