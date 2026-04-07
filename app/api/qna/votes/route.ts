import { sql } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    await ensureTablesExist()
    const { questionId, userId, voteType } = await request.json()

    if (!questionId || !userId || !voteType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!['upvote', 'downvote'].includes(voteType)) {
      return NextResponse.json(
        { error: 'Invalid voteType' },
        { status: 400 }
      )
    }

    // Check if user already voted
    const existingVote = await sql`
      SELECT * FROM question_votes 
      WHERE question_id = ${questionId} AND user_id = ${userId}
    `

    if (existingVote && existingVote.length > 0) {
      if (existingVote[0].vote_type === voteType) {
        // Remove vote
        await sql`
          DELETE FROM question_votes 
          WHERE question_id = ${questionId} AND user_id = ${userId}
        `
        return NextResponse.json({ status: 'removed' })
      } else {
        // Update vote
        await sql`
          UPDATE question_votes 
          SET vote_type = ${voteType}
          WHERE question_id = ${questionId} AND user_id = ${userId}
        `
        return NextResponse.json({ status: 'updated' })
      }
    } else {
      // Create new vote
      await sql`
        INSERT INTO question_votes (question_id, user_id, vote_type)
        VALUES (${questionId}, ${userId}, ${voteType})
      `
      return NextResponse.json({ status: 'created' })
    }
  } catch (error: any) {
    console.error('Vote error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
