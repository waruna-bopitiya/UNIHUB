const { neon } = require('@neondatabase/serverless');

// Get DATABASE_URL from environment
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.log('Set it using: $env:DATABASE_URL = "your-database-url"');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function checkAndCreateTable() {
  try {
    console.log('🔍 Checking if answer_comments table exists...');
    
    // Check if table exists
    const existsResult = await sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'answer_comments'
      )
    `;
    
    if (existsResult[0].exists) {
      console.log('✅ answer_comments table already exists');
    } else {
      console.log('📝 Creating answer_comments table...');
      
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
      
      // Create indexes
      console.log('📝 Creating indexes...');
      await sql`CREATE INDEX idx_answer_comments_answer_id ON answer_comments(answer_id)`;
      await sql`CREATE INDEX idx_answer_comments_user_id ON answer_comments(user_id)`;
      
      console.log('✅ Table created successfully!');
    }
    
    // Show table info
    const tableInfo = await sql`
      SELECT 
        column_name, 
        data_type, 
        is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'answer_comments'
    `;
    
    console.log('\n📊 Table structure:');
    console.table(tableInfo);
    
    console.log('\n✅ All checks completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

checkAndCreateTable();
