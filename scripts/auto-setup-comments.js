#!/usr/bin/env node

/**
 * One-click setup for comments system.
 * 
 * Run this after setting DATABASE_URL:
 * node scripts/auto-setup-comments.js
 * 
 * OR with inline DATABASE_URL:
 * DATABASE_URL=... node scripts/auto-setup-comments.js
 */

const { neon } = require('@neondatabase/serverless');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('\n❌ DATABASE_URL environment variable is not set!\n');
  console.log('📌 Set it first:\n');
  console.log('   PowerShell:');
  console.log('   $env:DATABASE_URL = "postgresql://..."');
  console.log('');
  console.log('   Or run with inline URL:');
  console.log('   DATABASE_URL=your_url node scripts/auto-setup-comments.js\n');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function setup() {
  try {
    console.log('\n🚀 Auto-Setup Comments System');
    console.log('═'.repeat(50) + '\n');

    // Step 1: Test connection
    console.log('1️⃣  Testing database connection...');
    try {
      const test = await sql`SELECT NOW()`;
      console.log('   ✅ Connected\n');
    } catch (error) {
      console.error('   ❌ Connection failed:', error.message);
      console.log('   Check your DATABASE_URL\n');
      process.exit(1);
    }

    // Step 2: Check if table exists
    console.log('2️⃣  Checking answer_comments table...');
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'answer_comments'
      )
    `;

    if (tableExists[0].exists) {
      console.log('   ✅ Table already exists\n');
    } else {
      console.log('   ❌ Table does not exist - creating it...\n');
      
      console.log('   💾 Creating answer_comments table...');
      await sql`
        CREATE TABLE answer_comments (
          id SERIAL PRIMARY KEY,
          answer_id INTEGER NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
          user_id VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      console.log('      ✅ Table created\n');

      console.log('   📝 Creating indexes...');
      await sql`CREATE INDEX idx_answer_comments_answer_id ON answer_comments(answer_id)`;
      await sql`CREATE INDEX idx_answer_comments_user_id ON answer_comments(user_id)`;
      console.log('      ✅ Indexes created\n');
    }

    // Step 3: Verify structure
    console.log('3️⃣  Verifying table structure...');
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'answer_comments'
      ORDER BY ordinal_position
    `;
    
    if (columns.length === 0) {
      throw new Error('Table has no columns!');
    }
    
    console.log('   ✅ Table structure verified');
    columns.forEach((col) => {
      console.log(`      • ${col.column_name}: ${col.data_type}`);
    });
    console.log('');

    // Step 4: Test query
    console.log('4️⃣  Testing query...');
    try {
      const result = await sql`
        SELECT COUNT(*) as total 
        FROM answer_comments
      `;
      console.log(`   ✅ Query works - found ${result[0].total} comments\n`);
    } catch (error) {
      console.error('   ❌ Query failed:', error.message);
      process.exit(1);
    }

    // Success!
    console.log('═'.repeat(50));
    console.log('\n✅ Comments system is ready!\n');
    console.log('Features enabled:');
    console.log('  ✓ Create comments');
    console.log('  ✓ Edit comments');
    console.log('  ✓ Delete comments');
    console.log('  ✓ Auto-refresh');
    console.log('  ✓ Toast notifications\n');
    console.log('Next step: Refresh your browser\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Setup failed:', error instanceof Error ? error.message : error);
    console.error('\n📋 Troubleshooting:');
    console.error('  1. Check DATABASE_URL is correct');
    console.error('  2. Make sure the database is accessible');
    console.error('  3. Verify that answers table exists\n');
    process.exit(1);
  }
}

setup();
