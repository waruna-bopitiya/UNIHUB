const { neon } = require('@neondatabase/serverless');

const sql = neon(
  'postgresql://neondb_owner:npg_uyD6fYP8pxcz@ep-lucky-fog-adx4lmgy-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
);

async function init() {
  await sql`CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    author_name VARCHAR(255) NOT NULL DEFAULT 'Student',
    author_avatar VARCHAR(500) NOT NULL DEFAULT 'S',
    author_role VARCHAR(255) NOT NULL DEFAULT 'Student',
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'General',
    likes_count INTEGER NOT NULL DEFAULT 0,
    comments_count INTEGER NOT NULL DEFAULT 0,
    shares_count INTEGER NOT NULL DEFAULT 0,
    stream_video_id VARCHAR(100),
    stream_title VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS live_streams (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    year VARCHAR(50),
    semester VARCHAR(50),
    module_name VARCHAR(500),
    video_id VARCHAR(100) NOT NULL,
    stream_key TEXT NOT NULL,
    stream_url TEXT NOT NULL,
    thumbnail_url TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
    scheduled_start_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS live_chat_messages (
    id SERIAL PRIMARY KEY,
    stream_id INTEGER NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL DEFAULT 'Anonymous',
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;

  console.log('✅ Tables created (or already exist)');
}

init().catch(e => { console.error('Error:', e.message); process.exit(1); });
