const { neon } = require('@neondatabase/serverless');

const databaseUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_uyD6fYP8pxcz@ep-lucky-fog-adx4lmgy-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const sql = neon(databaseUrl);

async function runMigration() {
  try {
    console.log('🚀 Running migration: fix_negative_likes');
    
    // Check for posts with negative likes
    console.log('Checking for posts with negative likes...');
    const negativeCount = await sql`
      SELECT COUNT(*) as count FROM posts WHERE likes_count < 0
    `;
    
    console.log('Found posts with negative likes:', negativeCount[0].count);
    
    // Reset likes_count for posts with negative values to 0
    console.log('Resetting negative likes to 0...');
    await sql`
      UPDATE posts 
      SET likes_count = 0 
      WHERE likes_count < 0
    `;
    
    // Remove orphaned post_likes (likes for posts that don't exist)
    console.log('Removing orphaned likes...');
    await sql`
      DELETE FROM post_likes 
      WHERE post_id NOT IN (SELECT id FROM posts)
    `;
    
    // Recalculate all likes_count based on actual post_likes table
    console.log('Recalculating likes counts...');
    await sql`
      UPDATE posts p
      SET likes_count = (
        SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id
      )
    `;
    
    console.log('✅ Migration completed successfully!');
    console.log('✅ Fixed negative likes and recalculated all like counts');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
