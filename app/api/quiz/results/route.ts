import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'

export async function GET(req: NextRequest) {
  try {
    await ensureTablesExist()

    const searchParams = req.nextUrl.searchParams
    const quizId = searchParams.get('quizId')
    const participantName = searchParams.get('participantName')

    let results: any[] = []

    if (quizId && participantName) {
      results = await sql`
        SELECT 
          r.id,
          r.quiz_id as quizId,
          q.title as quizTitle,
          r.participant_name as participantName,
          r.score,
          r.total_questions as totalQuestions,
          r.date_taken as dateTaken,
          r.created_at
        FROM quiz_responses r
        JOIN quizzes q ON r.quiz_id = q.id
        WHERE r.quiz_id = ${parseInt(quizId)} AND r.participant_name ILIKE ${`%${participantName}%`}
        ORDER BY r.date_taken DESC LIMIT 100
      `
    } else if (quizId) {
      results = await sql`
        SELECT 
          r.id,
          r.quiz_id as quizId,
          q.title as quizTitle,
          r.participant_name as participantName,
          r.score,
          r.total_questions as totalQuestions,
          r.date_taken as dateTaken,
          r.created_at
        FROM quiz_responses r
        JOIN quizzes q ON r.quiz_id = q.id
        WHERE r.quiz_id = ${parseInt(quizId)}
        ORDER BY r.date_taken DESC LIMIT 100
      `
    } else if (participantName) {
      results = await sql`
        SELECT 
          r.id,
          r.quiz_id as quizId,
          q.title as quizTitle,
          r.participant_name as participantName,
          r.score,
          r.total_questions as totalQuestions,
          r.date_taken as dateTaken,
          r.created_at
        FROM quiz_responses r
        JOIN quizzes q ON r.quiz_id = q.id
        WHERE r.participant_name ILIKE ${`%${participantName}%`}
        ORDER BY r.date_taken DESC LIMIT 100
      `
    } else {
      results = await sql`
        SELECT 
          r.id,
          r.quiz_id as quizId,
          q.title as quizTitle,
          r.participant_name as participantName,
          r.score,
          r.total_questions as totalQuestions,
          r.date_taken as dateTaken,
          r.created_at
        FROM quiz_responses r
        JOIN quizzes q ON r.quiz_id = q.id
        ORDER BY r.date_taken DESC LIMIT 100
      `
    }

    return NextResponse.json({
      status: 'success',
      data: results.map((r) => ({
        quizId: r.quizId,
        quizTitle: r.quizTitle,
        participantName: r.participantName,
        score: r.score,
        totalQuestions: r.totalQuestions,
        dateTaken: r.dateTaken,
      })),
      count: results.length,
    })
  } catch (error: any) {
    console.error('Error fetching results:', error)
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    )
  }
}
