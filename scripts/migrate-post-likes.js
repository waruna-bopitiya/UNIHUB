const { neon } = require('@neondatabase/serverless');

const databaseUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_uyD6fYP8pxcz@ep-lucky-fog-adx4lmgy-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const sql = neon(databaseUrl);

async function runMigration() {
  try {
    console.log('🚀 Running migration: create_post_likes_table');
    
    // Create post_likes table
    console.log('Creating post_likes table...');
    await sql`
      CREATE TABLE IF NOT EXISTS post_likes (
        id              SERIAL PRIMARY KEY,
        post_id         INTEGER       NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id         VARCHAR(50)   NOT NULL,
        created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        UNIQUE(post_id, user_id)
      )
    `;
    
    // Create indexes
    console.log('Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id)`;
    
    console.log('✅ Migration completed successfully!');
    console.log('✅ Created post_likes table with proper constraints and indexes');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
