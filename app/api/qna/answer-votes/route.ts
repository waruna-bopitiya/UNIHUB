import { sql } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    await ensureTablesExist()
    const { answerId, questionId, userId, voteType } = await request.json()

    console.log('🗳️ Answer Vote request:', { answerId, questionId, userId, voteType })

    if (!answerId || !questionId || !userId || !voteType) {
      return NextResponse.json(
        { error: 'Missing required fields: answerId, questionId, userId, voteType' },
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
      SELECT vote_type FROM answer_votes 
      WHERE answer_id = ${answerId} AND user_id = ${userId}
    `

    console.log('📋 Existing answer vote:', existingVote?.[0]?.vote_type)

    if (existingVote && existingVote.length > 0) {
      const currentVoteType = existingVote[0].vote_type
      
      if (currentVoteType === voteType) {
        // Same vote - remove it
        console.log('🗑️ Removing answer vote')
        
        if (voteType === 'upvote') {
          await sql`
            UPDATE answers 
            SET upvotes = GREATEST(0, upvotes - 1)
            WHERE id = ${answerId}
          `
        } else {
          await sql`
            UPDATE answers 
            SET downvotes = GREATEST(0, downvotes - 1)
            WHERE id = ${answerId}
          `
        }
        
        await sql`
          DELETE FROM answer_votes 
          WHERE answer_id = ${answerId} AND user_id = ${userId}
        `
        console.log('✅ Answer vote removed')
        const votes = await getUpdatedVotes(answerId)
        return NextResponse.json({ status: 'removed', ...votes })
      } else {
        // Different vote - change it
        console.log(`🔄 Changing answer vote from ${currentVoteType} to ${voteType}`)

        // Remove old vote
        if (currentVoteType === 'upvote') {
          await sql`
            UPDATE answers 
            SET upvotes = GREATEST(0, upvotes - 1)
            WHERE id = ${answerId}
          `
        } else {
          await sql`
            UPDATE answers 
            SET downvotes = GREATEST(0, downvotes - 1)
            WHERE id = ${answerId}
          `
        }

        // Add new vote
        if (voteType === 'upvote') {
          await sql`
            UPDATE answers 
            SET upvotes = upvotes + 1
            WHERE id = ${answerId}
          `
        } else {
          await sql`
            UPDATE answers 
            SET downvotes = downvotes + 1
            WHERE id = ${answerId}
          `
        }
        
        await sql`
          UPDATE answer_votes 
          SET vote_type = ${voteType}
          WHERE answer_id = ${answerId} AND user_id = ${userId}
        `
        console.log('✅ Answer vote changed')
        const votes = await getUpdatedVotes(answerId)
        return NextResponse.json({ status: 'updated', ...votes })
      }
    } else {
      // Create new vote - increment the count
      console.log('➕ Creating new answer vote')
      
      if (voteType === 'upvote') {
        await sql`
          UPDATE answers 
          SET upvotes = upvotes + 1
          WHERE id = ${answerId}
        `
      } else {
        await sql`
          UPDATE answers 
          SET downvotes = downvotes + 1
          WHERE id = ${answerId}
        `
      }
      
      await sql`
        INSERT INTO answer_votes (answer_id, question_id, user_id, vote_type)
        VALUES (${answerId}, ${questionId}, ${userId}, ${voteType})
      `
      console.log('✅ Answer vote created')
      const votes = await getUpdatedVotes(answerId)
      return NextResponse.json({ status: 'created', ...votes })
    }
  } catch (error: any) {
    console.error('❌ Answer vote error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// Helper function to get updated vote counts with safety check
async function getUpdatedVotes(answerId: number) {
  const result = await sql`
    SELECT upvotes, downvotes FROM answers WHERE id = ${answerId}
  `
  const votes = result?.[0] || { upvotes: 0, downvotes: 0 }
  
  // Ensure votes are never negative
  return {
    upvotes: Math.max(0, parseInt(votes.upvotes) || 0),
    downvotes: Math.max(0, parseInt(votes.downvotes) || 0)
  }
}
