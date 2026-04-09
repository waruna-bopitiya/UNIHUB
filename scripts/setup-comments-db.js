const { neon } = require('@neondatabase/serverless');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not set!');
  console.log('\n📋 Set DATABASE_URL first:');
  console.log('$env:DATABASE_URL = "postgresql://user:pass@host/db?sslmode=require"');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function setupDatabase() {
  try {
    console.log('🔐 Connecting to Neon database...');
    
    // Test connection
    const connTest = await sql`SELECT NOW()`;
    console.log('✅ Connected to database\n');

    // Check if answer_comments table exists
    console.log('📋 Checking answer_comments table...');
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'answer_comments'
      )
    `;

    if (!tableExists[0].exists) {
      console.log('❌ Table does NOT exist. Creating it now...\n');
      
      // Create the table
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
      console.log('✅ Created answer_comments table\n');

      // Create indexes
      console.log('📝 Creating indexes...');
      await sql`CREATE INDEX idx_answer_comments_answer_id ON answer_comments(answer_id)`;
      await sql`CREATE INDEX idx_answer_comments_user_id ON answer_comments(user_id)`;
      console.log('✅ Created indexes\n');
    } else {
      console.log('✅ answer_comments table exists\n');
    }

    // Show table structure
    console.log('📊 Table Structure:');
    const columns = await sql`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'answer_comments'
      ORDER BY ordinal_position
    `;
    console.table(columns);

    // Show comment count
    console.log('\n📈 Table Statistics:');
    const count = await sql`SELECT COUNT(*) as total FROM answer_comments`;
    console.log(`Total comments: ${count[0].total}`);

    console.log('\n✅ Database setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Make sure DATABASE_URL is set correctly');
    console.error('2. Check that answers table exists');
    console.error('3. Make sure students table exists');
    process.exit(1);
  }
}

setupDatabase();
