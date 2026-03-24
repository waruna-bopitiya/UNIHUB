import { sql } from './db'

let initialized = false

export async function ensureTablesExist() {
  if (initialized) return

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id                   VARCHAR(50)  PRIMARY KEY,
      first_name           VARCHAR(255) NOT NULL,
      second_name          VARCHAR(255),
      email                VARCHAR(255) NOT NULL UNIQUE,
      phone_number         VARCHAR(20)  NOT NULL,
      country_code         VARCHAR(10),
      address              TEXT,
      gender               VARCHAR(50),
      year_of_university   INTEGER      NOT NULL CHECK (year_of_university BETWEEN 1 AND 4),
      semester             INTEGER      NOT NULL CHECK (semester BETWEEN 1 AND 2),
      password             TEXT         NOT NULL,
      created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      last_login           TIMESTAMPTZ
    )
  `

  // Create indexes for performance
  await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`
  await sql`CREATE INDEX IF NOT EXISTS idx_users_year_semester ON users(year_of_university, semester)`
  await sql`CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC)`
  await sql`CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login DESC NULLS LAST)`

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

  await sql`
    CREATE TABLE IF NOT EXISTS subject4years (
      id              SERIAL PRIMARY KEY,
      year            INTEGER       NOT NULL CHECK (year BETWEEN 1 AND 4),
      semester        INTEGER       NOT NULL CHECK (semester BETWEEN 1 AND 2),
      subject_code    VARCHAR(50)   NOT NULL,
      subject_name    VARCHAR(500)  NOT NULL,
      created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      UNIQUE(year, semester, subject_code)
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS resources (
      id              SERIAL PRIMARY KEY,
      year            VARCHAR(50)   NOT NULL,
      semester        VARCHAR(50)   NOT NULL,
      module_name     VARCHAR(500)  NOT NULL,
      name            VARCHAR(500)  NOT NULL,
      resource_type   VARCHAR(50)   NOT NULL,
      link            TEXT,
      created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
    )
  `

  initialized = true
}
