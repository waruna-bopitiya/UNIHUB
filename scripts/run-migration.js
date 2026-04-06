const { neon } = require('@neondatabase/serverless');

// Get DATABASE_URL from environment or use default
const databaseUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_uyD6fYP8pxcz@ep-lucky-fog-adx4lmgy-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const sql = neon(databaseUrl);

async function runMigration() {
  try {
    console.log('🚀 Running migration: add-google-sheets-columns.sql');
    
    // Add shareable_link column
    console.log('Adding shareable_link column...');
    await sql`ALTER TABLE resources ADD COLUMN IF NOT EXISTS shareable_link VARCHAR(500)`;
    
    // Add uploader_name column
    console.log('Adding uploader_name column...');
    await sql`ALTER TABLE resources ADD COLUMN IF NOT EXISTS uploader_name VARCHAR(255) DEFAULT 'Anonymous'`;
    
    // Add description column
    console.log('Adding description column...');
    await sql`ALTER TABLE resources ADD COLUMN IF NOT EXISTS description TEXT`;
    
    // Add created_at column
    console.log('Adding created_at column...');
    await sql`ALTER TABLE resources ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;
    
    // Create indexes
    console.log('Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_resources_uploader ON resources(uploader_name)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_resources_resource_type ON resources(resource_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_resources_year_semester ON resources(year, semester)`;
    
    console.log('✅ Migration completed successfully!');
    console.log('✅ New columns added: shareable_link, uploader_name, description, created_at');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
