const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Get DATABASE_URL from environment
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function runMigration() {
  try {
    console.log('🚀 Running migration: create-answer-comments-table.sql');
    
    // Create the answer_comments table
    console.log('Creating answer_comments table...');
    await sql`
      CREATE TABLE IF NOT EXISTS answer_comments (
        id SERIAL PRIMARY KEY,
        answer_id INTEGER NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
        user_id VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (answer_id) REFERENCES answers(id) ON DELETE CASCADE
      )
    `;
    
    // Create indexes
    console.log('Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_answer_comments_answer_id ON answer_comments(answer_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_answer_comments_user_id ON answer_comments(user_id)`;
    
    console.log('✅ Migration completed successfully!');
    console.log('✅ Table created: answer_comments');
    console.log('✅ Indexes created for faster queries');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
