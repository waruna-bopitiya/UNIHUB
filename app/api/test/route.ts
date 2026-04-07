import { sql } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🧪 Running test endpoint...')
    
    // Ensure tables exist
    await ensureTablesExist()
    
    // Test: Check if questions table exists
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    
    console.log('📋 Tables in database:', tables.map((t: any) => t.table_name))
    
    // Test: Check questions table structure
    const questionColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'questions'
    `
    
    console.log('📝 Questions table columns:', questionColumns)
    
    // Test: Count questions
    const questionCount = await sql`
      SELECT COUNT(*) as count FROM questions
    `
    
    console.log('❓ Questions count:', questionCount)
    
    // Test: Fetch all questions with details
    const questions = await sql`
      SELECT 
        q.id,
        q.title,
        q.upvotes,
        q.downvotes,
        u.first_name,
        COUNT(a.id) as answer_count
      FROM questions q
      JOIN users u ON q.user_id = u.id
      LEFT JOIN answers a ON q.id = a.question_id
      GROUP BY q.id, q.user_id, q.upvotes, q.downvotes, u.id, u.first_name
      LIMIT 5
    `
    
    console.log('📚 Sample questions:', questions)
    
    return NextResponse.json({
      success: true,
      tables: tables.map((t: any) => t.table_name),
      questionColumns: questionColumns,
      questionCount: questionCount[0],
      sampleQuestions: questions
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('❌ Test error:', errorMessage)
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 })
  }
}
