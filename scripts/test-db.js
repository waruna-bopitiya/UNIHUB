const { neon } = require('@neondatabase/serverless');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not set');
  console.log('\n📋 To set DATABASE_URL in PowerShell:');
  console.log('$env:DATABASE_URL = "your-neon-database-url"');
  console.log('\nThen run: node scripts/check-comments-table.js');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function test() {
  try {
    console.log('🧪 Testing database connection...');
    
    // Test basic connection
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✅ Database connected! Current time:', result[0].current_time);
    
    // Check if answers table exists
    console.log('\n📊 Checking answers table...');
    const answersCheck = await sql`SELECT COUNT(*) as count FROM answers`;
    console.log('✅ Found', answersCheck[0].count, 'answers in database');
    
    // Check if students table exists
    console.log('\n👤 Checking students table...');
    const studentsCheck = await sql`SELECT COUNT(*) as count FROM students`;
    console.log('✅ Found', studentsCheck[0].count, 'students in database');
    
    // Check if answer_comments table exists
    console.log('\n💬 Checking answer_comments table...');
    try {
      const commentsCheck = await sql`SELECT COUNT(*) as count FROM answer_comments`;
      console.log('✅ Found', commentsCheck[0].count, 'comments in database');
    } catch (e) {
      console.log('❌ answer_comments table does NOT exist');
      console.log('Run: node scripts/check-comments-table.js to create it');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

test();
