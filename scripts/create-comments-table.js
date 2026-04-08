#!/usr/bin/env node

/**
 * Direct table creation for answer_comments
 * Run this to create the comments table if it doesn't exist
 */

const { neon } = require('@neondatabase/serverless');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('\n❌ DATABASE_URL is not set!');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function createTable() {
  try {
    console.log('\n📝 Creating answer_comments table...\n');

    // Create the table with IF NOT EXISTS
    await sql`
      CREATE TABLE IF NOT EXISTS answer_comments (
        id SERIAL PRIMARY KEY,
        answer_id INTEGER NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
        user_id VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('✅ Table created successfully\n');

    // Create indexes
    console.log('📝 Creating indexes...\n');

    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_answer_comments_answer_id ON answer_comments(answer_id)`;
      console.log('✅ Index idx_answer_comments_answer_id created');
    } catch (e) {
      console.log('⚠️  Index idx_answer_comments_answer_id already exists');
    }

    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_answer_comments_user_id ON answer_comments(user_id)`;
      console.log('✅ Index idx_answer_comments_user_id created');
    } catch (e) {
      console.log('⚠️  Index idx_answer_comments_user_id already exists');
    }

    // Verify table
    console.log('\n🔍 Verifying table...\n');

    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'answer_comments'
      ORDER BY ordinal_position
    `;

    console.log('Table columns:');
    columns.forEach(col => {
      console.log(`  ✓ ${col.column_name}: ${col.data_type}`);
    });

    const countResult = await sql`SELECT COUNT(*) as total FROM answer_comments`;
    console.log(`\n📊 Total comments in table: ${countResult[0].total}`);

    console.log('\n✅ Comments table is ready to use!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

createTable();
