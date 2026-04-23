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

    if (quizId && participantId) {
      results = await sql`
        SELECT 
          r.id,
          r.quiz_id as quizId,
          q.title as quizTitle,
          r.participant_id as participantId,
          r.participant_name as participantName,
          r.score,
          r.total_questions as totalQuestions,
          r.percentage,
          agg.quiz_average_score as quizAverageScore,
          agg.quiz_total_attempts as quizTotalAttempts,
          agg.quiz_total_participants as quizTotalParticipants,
          r.date_taken as dateTaken,
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
        WHERE r.quiz_id = ${parseInt(quizId)} AND r.participant_id = ${participantId}
        ORDER BY r.date_taken DESC LIMIT 100
      `
    } else if (quizId && participantName) {
      results = await sql`
        SELECT 
          r.id,
          r.quiz_id as quizId,
          q.title as quizTitle,
          r.participant_id as participantId,
          r.participant_name as participantName,
          r.score,
          r.total_questions as totalQuestions,
          r.percentage,
          agg.quiz_average_score as quizAverageScore,
          agg.quiz_total_attempts as quizTotalAttempts,
          agg.quiz_total_participants as quizTotalParticipants,
          r.date_taken as dateTaken,
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
          r.quiz_id as quizId,
          q.title as quizTitle,
          r.participant_id as participantId,
          r.participant_name as participantName,
          r.score,
          r.total_questions as totalQuestions,
          r.percentage,
          agg.quiz_average_score as quizAverageScore,
          agg.quiz_total_attempts as quizTotalAttempts,
          agg.quiz_total_participants as quizTotalParticipants,
          r.date_taken as dateTaken,
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
          r.quiz_id as quizId,
          q.title as quizTitle,
          r.participant_id as participantId,
          r.participant_name as participantName,
          r.score,
          r.total_questions as totalQuestions,
          r.percentage,
          agg.quiz_average_score as quizAverageScore,
          agg.quiz_total_attempts as quizTotalAttempts,
          agg.quiz_total_participants as quizTotalParticipants,
          r.date_taken as dateTaken,
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
          r.quiz_id as quizId,
          q.title as quizTitle,
          r.participant_id as participantId,
          r.participant_name as participantName,
          r.score,
          r.total_questions as totalQuestions,
          r.percentage,
          agg.quiz_average_score as quizAverageScore,
          agg.quiz_total_attempts as quizTotalAttempts,
          agg.quiz_total_participants as quizTotalParticipants,
          r.date_taken as dateTaken,
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
          r.quiz_id as quizId,
          q.title as quizTitle,
          r.participant_id as participantId,
          r.participant_name as participantName,
          r.score,
          r.total_questions as totalQuestions,
          r.percentage,
          agg.quiz_average_score as quizAverageScore,
          agg.quiz_total_attempts as quizTotalAttempts,
          agg.quiz_total_participants as quizTotalParticipants,
          r.date_taken as dateTaken,
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
        quizId: r.quizId,
        quizTitle: r.quizTitle,
        participantId: r.participantId,
        participantName: r.participantName,
        score: r.score,
        totalQuestions: r.totalQuestions,
        percentage: Number(r.percentage ?? 0),
        quizAverageScore: Number(r.quizAverageScore ?? 0),
        quizTotalAttempts: Number(r.quizTotalAttempts ?? 0),
        quizTotalParticipants: Number(r.quizTotalParticipants ?? 0),
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
