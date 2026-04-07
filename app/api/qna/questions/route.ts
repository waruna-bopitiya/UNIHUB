import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const subjectCode = searchParams.get('subjectCode')
    const year = searchParams.get('year')
    const semester = searchParams.get('semester')

    let questions

    // Fetch questions with different filters
    if (subjectCode && year && semester) {
      const yearNum = parseInt(year)
      const semesterNum = parseInt(semester)
      questions = await sql`
        SELECT 
          q.id,
          q.title,
          q.content,
          q.subject_code,
          q.year,
          q.semester,
          q.user_id,
          q.created_at,
          q.updated_at,
          u.first_name,
          u.second_name,
          COUNT(a.id) as answer_count,
          COALESCE(SUM(CASE WHEN qv.vote_type = 'upvote' THEN 1 ELSE 0 END), 0) as upvotes,
          COALESCE(SUM(CASE WHEN qv.vote_type = 'downvote' THEN 1 ELSE 0 END), 0) as downvotes
        FROM questions q
        JOIN users u ON q.user_id = u.id
        LEFT JOIN answers a ON q.id = a.question_id
        LEFT JOIN question_votes qv ON q.id = qv.question_id
        WHERE q.subject_code = ${subjectCode} 
          AND q.year = ${yearNum}
          AND q.semester = ${semesterNum}
        GROUP BY q.id, u.id
        ORDER BY q.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    } else if (subjectCode) {
      questions = await sql`
        SELECT 
          q.id,
          q.title,
          q.content,
          q.subject_code,
          q.year,
          q.semester,
          q.user_id,
          q.created_at,
          q.updated_at,
          u.first_name,
          u.second_name,
          COUNT(a.id) as answer_count,
          COALESCE(SUM(CASE WHEN qv.vote_type = 'upvote' THEN 1 ELSE 0 END), 0) as upvotes,
          COALESCE(SUM(CASE WHEN qv.vote_type = 'downvote' THEN 1 ELSE 0 END), 0) as downvotes
        FROM questions q
        JOIN users u ON q.user_id = u.id
        LEFT JOIN answers a ON q.id = a.question_id
        LEFT JOIN question_votes qv ON q.id = qv.question_id
        WHERE q.subject_code = ${subjectCode}
        GROUP BY q.id, u.id
        ORDER BY q.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    } else if (year && semester) {
      const yearNum = parseInt(year)
      const semesterNum = parseInt(semester)
      questions = await sql`
        SELECT 
          q.id,
          q.title,
          q.content,
          q.subject_code,
          q.year,
          q.semester,
          q.user_id,
          q.created_at,
          q.updated_at,
          u.first_name,
          u.second_name,
          COUNT(a.id) as answer_count,
          COALESCE(SUM(CASE WHEN qv.vote_type = 'upvote' THEN 1 ELSE 0 END), 0) as upvotes,
          COALESCE(SUM(CASE WHEN qv.vote_type = 'downvote' THEN 1 ELSE 0 END), 0) as downvotes
        FROM questions q
        JOIN users u ON q.user_id = u.id
        LEFT JOIN answers a ON q.id = a.question_id
        LEFT JOIN question_votes qv ON q.id = qv.question_id
        WHERE q.year = ${yearNum} AND q.semester = ${semesterNum}
        GROUP BY q.id, u.id
        ORDER BY q.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    } else {
      // Fetch all questions
      questions = await sql`
        SELECT 
          q.id,
          q.title,
          q.content,
          q.subject_code,
          q.year,
          q.semester,
          q.user_id,
          q.created_at,
          q.updated_at,
          u.first_name,
          u.second_name,
          COUNT(a.id) as answer_count,
          COALESCE(SUM(CASE WHEN qv.vote_type = 'upvote' THEN 1 ELSE 0 END), 0) as upvotes,
          COALESCE(SUM(CASE WHEN qv.vote_type = 'downvote' THEN 1 ELSE 0 END), 0) as downvotes
        FROM questions q
        JOIN users u ON q.user_id = u.id
        LEFT JOIN answers a ON q.id = a.question_id
        LEFT JOIN question_votes qv ON q.id = qv.question_id
        GROUP BY q.id, u.id
        ORDER BY q.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    }

    const formattedQuestions = questions.map((q: any) => ({
      id: q.id.toString(),
      title: q.title,
      content: q.content,
      author: {
        id: q.user_id,
        name: `${q.first_name}${q.second_name ? ' ' + q.second_name : ''}`,
        avatar: `https://avatar.vercel.sh/${q.first_name.toLowerCase()}`
      },
      category: q.subject_code,
      categoryName: q.subject_code,
      upvotes: parseInt(q.upvotes) || 0,
      downvotes: parseInt(q.downvotes) || 0,
      answers: parseInt(q.answer_count) || 0,
      createdAt: q.created_at
    }))

    return Response.json(formattedQuestions)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Error fetching questions:', errorMessage)
    return Response.json(
      {
        error: 'Failed to fetch questions',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}
