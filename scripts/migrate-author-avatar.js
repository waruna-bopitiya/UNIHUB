const { neon } = require('@neondatabase/serverless');

const databaseUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_uyD6fYP8pxcz@ep-lucky-fog-adx4lmgy-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const sql = neon(databaseUrl);

async function runMigration() {
  try {
    console.log('🚀 Running migration: increase_author_avatar_size');
    
    // Check current column size
    console.log('Checking current author_avatar column size...');
    const columnInfo = await sql`
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'posts' AND column_name = 'author_avatar'
    `;
    
    if (columnInfo.length > 0) {
      console.log('Current column info:', columnInfo[0]);
    }
    
    // Increase avatar column size
    console.log('Updating author_avatar column to VARCHAR(500)...');
    await sql`ALTER TABLE posts ALTER COLUMN author_avatar TYPE VARCHAR(500)`;
    
    console.log('✅ Migration completed successfully!');
    console.log('✅ author_avatar column updated from VARCHAR(10) to VARCHAR(500)');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
