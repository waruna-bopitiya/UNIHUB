import { sql } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    await ensureTablesExist()
    const { questionId, userId, voteType } = await request.json()

    console.log('🗳️ Vote request:', { questionId, userId, voteType })

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
      SELECT vote_type FROM question_votes 
      WHERE question_id = ${questionId} AND user_id = ${userId}
    `

    console.log('📋 Existing vote:', existingVote?.[0]?.vote_type)

    if (existingVote && existingVote.length > 0) {
      const currentVoteType = existingVote[0].vote_type
      
      if (currentVoteType === voteType) {
        // Same vote - remove it
        console.log('🗑️ Removing vote')
        
        if (voteType === 'upvote') {
          await sql`
            UPDATE questions 
            SET upvotes = GREATEST(0, upvotes - 1)
            WHERE id = ${questionId}
          `
        } else {
          await sql`
            UPDATE questions 
            SET downvotes = GREATEST(0, downvotes - 1)
            WHERE id = ${questionId}
          `
        }
        
        await sql`
          DELETE FROM question_votes 
          WHERE question_id = ${questionId} AND user_id = ${userId}
        `
        console.log('✅ Vote removed')
        const votes = await getUpdatedVotes(questionId)
        return NextResponse.json({ status: 'removed', ...votes })
      } else {
        // Different vote - change it
        console.log(`🔄 Changing vote from ${currentVoteType} to ${voteType}`)

        // Remove old vote
        if (currentVoteType === 'upvote') {
          await sql`
            UPDATE questions 
            SET upvotes = GREATEST(0, upvotes - 1)
            WHERE id = ${questionId}
          `
        } else {
          await sql`
            UPDATE questions 
            SET downvotes = GREATEST(0, downvotes - 1)
            WHERE id = ${questionId}
          `
        }

        // Add new vote
        if (voteType === 'upvote') {
          await sql`
            UPDATE questions 
            SET upvotes = upvotes + 1
            WHERE id = ${questionId}
          `
        } else {
          await sql`
            UPDATE questions 
            SET downvotes = downvotes + 1
            WHERE id = ${questionId}
          `
        }
        
        await sql`
          UPDATE question_votes 
          SET vote_type = ${voteType}
          WHERE question_id = ${questionId} AND user_id = ${userId}
        `
        console.log('✅ Vote changed')
        const votes = await getUpdatedVotes(questionId)
        return NextResponse.json({ status: 'updated', ...votes })
      }
    } else {
      // Create new vote - increment the count
      console.log('➕ Creating new vote')
      
      if (voteType === 'upvote') {
        await sql`
          UPDATE questions 
          SET upvotes = upvotes + 1
          WHERE id = ${questionId}
        `
      } else {
        await sql`
          UPDATE questions 
          SET downvotes = downvotes + 1
          WHERE id = ${questionId}
        `
      }
      
      await sql`
        INSERT INTO question_votes (question_id, user_id, vote_type)
        VALUES (${questionId}, ${userId}, ${voteType})
      `
      console.log('✅ Vote created')
      const votes = await getUpdatedVotes(questionId)
      return NextResponse.json({ status: 'created', ...votes })
    }
  } catch (error: any) {
    console.error('❌ Vote error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// Helper function to get updated vote counts with safety check
async function getUpdatedVotes(questionId: number) {
  const result = await sql`
    SELECT upvotes, downvotes FROM questions WHERE id = ${questionId}
  `
  const votes = result?.[0] || { upvotes: 0, downvotes: 0 }
  
  // Ensure votes are never negative
  return {
    upvotes: Math.max(0, parseInt(votes.upvotes) || 0),
    downvotes: Math.max(0, parseInt(votes.downvotes) || 0)
  }
}
