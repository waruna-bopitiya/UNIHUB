import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'

export async function GET(req: NextRequest) {
  try {
    await ensureTablesExist()

    const searchParams = req.nextUrl.searchParams
    const quizId = searchParams.get('quizId')
    const participantName = searchParams.get('participantName')
    const participantId = searchParams.get('participantId')

    let results: any[] = []

    if (quizId && participantId && participantName) {
      results = await sql`
        SELECT 
          r.id,
          r.quiz_id,
          q.title,
          r.participant_id,
          r.participant_name,
          r.score,
          r.total_questions,
          r.percentage,
          agg.quiz_average_score,
          agg.quiz_total_attempts,
          agg.quiz_total_participants,
          r.date_taken,
          r.created_at
        FROM quiz_responses r
        JOIN quizzes q ON r.quiz_id = q.id
        JOIN (
          SELECT
            quiz_id,
            ROUND(AVG(percentage), 2) as quiz_average_score,
            COUNT(*) as quiz_total_attempts,
            COUNT(DISTINCT COALESCE(participant_id, participant_name)) as quiz_total_participants
          FROM quiz_responses
          GROUP BY quiz_id
        ) agg ON agg.quiz_id = r.quiz_id
        WHERE r.quiz_id = ${parseInt(quizId)}
          AND (
            r.participant_id = ${participantId}
            OR r.participant_name ILIKE ${`%${participantName}%`}
          )
        ORDER BY r.date_taken DESC LIMIT 100
      `
    } else if (quizId && participantName) {
      results = await sql`
        SELECT 
          r.id,
          r.quiz_id,
          q.title,
          r.participant_id,
          r.participant_name,
          r.score,
          r.total_questions,
          r.percentage,
          agg.quiz_average_score,
          agg.quiz_total_attempts,
          agg.quiz_total_participants,
          r.date_taken,
          r.created_at
        FROM quiz_responses r
        JOIN quizzes q ON r.quiz_id = q.id
        JOIN (
          SELECT
            quiz_id,
            ROUND(AVG(percentage), 2) as quiz_average_score,
            COUNT(*) as quiz_total_attempts,
            COUNT(DISTINCT COALESCE(participant_id, participant_name)) as quiz_total_participants
          FROM quiz_responses
          GROUP BY quiz_id
        ) agg ON agg.quiz_id = r.quiz_id
        WHERE r.quiz_id = ${parseInt(quizId)} AND r.participant_name ILIKE ${`%${participantName}%`}
        ORDER BY r.date_taken DESC LIMIT 100
      `
    } else if (quizId) {
      results = await sql`
        SELECT 
          r.id,
          r.quiz_id,
          q.title,
          r.participant_id,
          r.participant_name,
          r.score,
          r.total_questions,
          r.percentage,
          agg.quiz_average_score,
          agg.quiz_total_attempts,
          agg.quiz_total_participants,
          r.date_taken,
          r.created_at
        FROM quiz_responses r
        JOIN quizzes q ON r.quiz_id = q.id
        JOIN (
          SELECT
            quiz_id,
            ROUND(AVG(percentage), 2) as quiz_average_score,
            COUNT(*) as quiz_total_attempts,
            COUNT(DISTINCT COALESCE(participant_id, participant_name)) as quiz_total_participants
          FROM quiz_responses
          GROUP BY quiz_id
        ) agg ON agg.quiz_id = r.quiz_id
        WHERE r.quiz_id = ${parseInt(quizId)}
        ORDER BY r.date_taken DESC LIMIT 100
      `
    } else if (participantId) {
      results = await sql`
        SELECT 
          r.id,
          r.quiz_id,
          q.title,
          r.participant_id,
          r.participant_name,
          r.score,
          r.total_questions,
          r.percentage,
          agg.quiz_average_score,
          agg.quiz_total_attempts,
          agg.quiz_total_participants,
          r.date_taken,
          r.created_at
        FROM quiz_responses r
        JOIN quizzes q ON r.quiz_id = q.id
        JOIN (
          SELECT
            quiz_id,
            ROUND(AVG(percentage), 2) as quiz_average_score,
            COUNT(*) as quiz_total_attempts,
            COUNT(DISTINCT COALESCE(participant_id, participant_name)) as quiz_total_participants
          FROM quiz_responses
          GROUP BY quiz_id
        ) agg ON agg.quiz_id = r.quiz_id
        WHERE r.participant_id = ${participantId}
        ORDER BY r.date_taken DESC LIMIT 100
      `
    } else if (participantName) {
      results = await sql`
        SELECT 
          r.id,
          r.quiz_id,
          q.title,
          r.participant_id,
          r.participant_name,
          r.score,
          r.total_questions,
          r.percentage,
          agg.quiz_average_score,
          agg.quiz_total_attempts,
          agg.quiz_total_participants,
          r.date_taken,
          r.created_at
        FROM quiz_responses r
        JOIN quizzes q ON r.quiz_id = q.id
        JOIN (
          SELECT
            quiz_id,
            ROUND(AVG(percentage), 2) as quiz_average_score,
            COUNT(*) as quiz_total_attempts,
            COUNT(DISTINCT COALESCE(participant_id, participant_name)) as quiz_total_participants
          FROM quiz_responses
          GROUP BY quiz_id
        ) agg ON agg.quiz_id = r.quiz_id
        WHERE r.participant_name ILIKE ${`%${participantName}%`}
        ORDER BY r.date_taken DESC LIMIT 100
      `
    } else {
      results = await sql`
        SELECT 
          r.id,
          r.quiz_id,
          q.title,
          r.participant_id,
          r.participant_name,
          r.score,
          r.total_questions,
          r.percentage,
          agg.quiz_average_score,
          agg.quiz_total_attempts,
          agg.quiz_total_participants,
          r.date_taken,
          r.created_at
        FROM quiz_responses r
        JOIN quizzes q ON r.quiz_id = q.id
        JOIN (
          SELECT
            quiz_id,
            ROUND(AVG(percentage), 2) as quiz_average_score,
            COUNT(*) as quiz_total_attempts,
            COUNT(DISTINCT COALESCE(participant_id, participant_name)) as quiz_total_participants
          FROM quiz_responses
          GROUP BY quiz_id
        ) agg ON agg.quiz_id = r.quiz_id
        ORDER BY r.date_taken DESC LIMIT 100
      `
    }

    return NextResponse.json({
      status: 'success',
      data: results.map((r) => ({
        quizId: r.quiz_id,
        quizTitle: r.title,
        participantId: r.participant_id,
        participantName: r.participant_name,
        score: r.score,
        totalQuestions: r.total_questions,
        percentage: Number(r.percentage ?? 0),
        quizAverageScore: Number(r.quiz_average_score ?? 0),
        quizTotalAttempts: Number(r.quiz_total_attempts ?? 0),
        quizTotalParticipants: Number(r.quiz_total_participants ?? 0),
        dateTaken: r.date_taken,
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
