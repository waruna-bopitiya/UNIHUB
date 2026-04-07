const { neon } = require('@neondatabase/serverless');

const databaseUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_uyD6fYP8pxcz@ep-lucky-fog-adx4lmgy-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const sql = neon(databaseUrl);

async function diagnoseSystem() {
  try {
    console.log('🔍 Diagnosing Like System...\n');
    
    // 1. Check total posts
    const [postsCount] = await sql`SELECT COUNT(*) as count FROM posts`;
    console.log(`✅ Total posts: ${postsCount.count}`);
    
    // 2. Check total likes
    const [likesCount] = await sql`SELECT COUNT(*) as count FROM post_likes`;
    console.log(`✅ Total likes in post_likes table: ${likesCount.count}`);
    
    // 3. Find inconsistencies
    console.log('\n🔎 Checking for inconsistencies...');
    
    // Posts with invalid likes_count
    const invalidCounts = await sql`
      SELECT id, likes_count, 
             (SELECT COUNT(*) FROM post_likes WHERE post_id = posts.id) as actual_count
      FROM posts 
      WHERE likes_count != (SELECT COUNT(*) FROM post_likes WHERE post_id = posts.id)
    `;
    
    if (invalidCounts.length > 0) {
      console.log(`⚠️  Found ${invalidCounts.length} posts with incorrect likes_count`);
      invalidCounts.forEach(p => {
        console.log(`   Post ${p.id}: stored=${p.likes_count}, actual=${p.actual_count}`);
      });
    } else {
      console.log('✅ All posts have correct likes_count');
    }
    
    // 4. Sample data
    console.log('\n📊 Sample Posts with Likes:');
    const samplePosts = await sql`
      SELECT 
        p.id,
        p.author_name,
        p.likes_count as stored_count,
        COUNT(pl.id) as actual_count
      FROM posts p
      LEFT JOIN post_likes pl ON p.id = pl.post_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT 5
    `;
    
    samplePosts.forEach(p => {
      console.log(`   Post ${p.id} (${p.author_name}): stored=${p.stored_count}, actual=${p.actual_count}`);
    });
    
    // 5. Check for orphaned likes
    console.log('\n🔗 Checking for orphaned likes:');
    const orphaned = await sql`
      SELECT COUNT(*) as count FROM post_likes 
      WHERE post_id NOT IN (SELECT id FROM posts)
    `;
    console.log(`✅ Orphaned likes: ${orphaned[0].count}`);
    
    // 6. Recalculate all like counts
    console.log('\n🔄 Recalculating likes_count from post_likes table...');
    const result = await sql`
      UPDATE posts SET likes_count = (SELECT COUNT(*) FROM post_likes WHERE post_id = posts.id)
    `;
    console.log('✅ Recalculation complete');
    
    // 7. Final verification
    console.log('\n✨ Final Verification:');
    const finalCheck = await sql`
      SELECT COUNT(*) as count FROM posts
      WHERE likes_count != (SELECT COUNT(*) FROM post_likes WHERE post_id = posts.id)
    `;
    
    if (finalCheck[0].count === 0) {
      console.log('✅ All posts have correct like counts!');
    } else {
      console.log(`⚠️  Still have ${finalCheck[0].count} inconsistencies`);
    }
    
    console.log('\n✅ System diagnosis complete!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Diagnosis failed:', error.message);
    process.exit(1);
  }
}

diagnoseSystem();
