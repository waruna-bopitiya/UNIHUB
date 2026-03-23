import { sql } from './db'

let initialized = false

export async function ensureTablesExist() {
  if (initialized) return

  await sql`
    CREATE TABLE IF NOT EXISTS posts (
      id            SERIAL PRIMARY KEY,
      author_name   VARCHAR(255)  NOT NULL DEFAULT 'Student',
      author_avatar VARCHAR(10)   NOT NULL DEFAULT 'S',
      author_role   VARCHAR(255)  NOT NULL DEFAULT 'Student',
      content       TEXT          NOT NULL,
      category      VARCHAR(100)  NOT NULL DEFAULT 'General',
      likes_count   INTEGER       NOT NULL DEFAULT 0,
      comments_count INTEGER      NOT NULL DEFAULT 0,
      shares_count  INTEGER       NOT NULL DEFAULT 0,
      stream_video_id VARCHAR(100),
      stream_title  VARCHAR(500),
      created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS live_streams (
      id                   SERIAL PRIMARY KEY,
      post_id              INTEGER REFERENCES posts(id) ON DELETE SET NULL,
      title                VARCHAR(500)  NOT NULL,
      description          TEXT,
      year                 VARCHAR(50),
      semester             VARCHAR(50),
      module_name          VARCHAR(500),
      video_id             VARCHAR(100)  NOT NULL,
      stream_key           TEXT          NOT NULL,
      stream_url           TEXT          NOT NULL,
      thumbnail_url        TEXT,
      status               VARCHAR(50)   NOT NULL DEFAULT 'scheduled',
      scheduled_start_time TIMESTAMPTZ,
      created_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW()
    )
  `

  initialized = true
}
