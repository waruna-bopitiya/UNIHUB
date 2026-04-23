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
      bio                  TEXT,
      avatar               VARCHAR(500),
      password             TEXT         NOT NULL,
      created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      last_login           TIMESTAMPTZ,
      logouttime           TIMESTAMPTZ
    )
  `

  // Create indexes for performance
  await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`
  await sql`CREATE INDEX IF NOT EXISTS idx_users_year_semester ON users(year_of_university, semester)`
  await sql`CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC)`
  await sql`CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login DESC NULLS LAST)`

  // Table for storing OTP for password reset
  await sql`
    CREATE TABLE IF NOT EXISTS password_reset_otp (
      id          SERIAL PRIMARY KEY,
      email       VARCHAR(255) NOT NULL,
      otp         VARCHAR(6)   NOT NULL,
      expires_at  TIMESTAMPTZ  NOT NULL,
      created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `

  await sql`CREATE INDEX IF NOT EXISTS idx_password_reset_otp_email ON password_reset_otp(email)`
  await sql`CREATE INDEX IF NOT EXISTS idx_password_reset_otp_expires_at ON password_reset_otp(expires_at)`

  // Table for storing OTP for signup email verification
  await sql`
    CREATE TABLE IF NOT EXISTS signup_otp (
      id          SERIAL PRIMARY KEY,
      email       VARCHAR(255) NOT NULL,
      otp         VARCHAR(6)   NOT NULL,
      expires_at  TIMESTAMPTZ  NOT NULL,
      created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `

  await sql`CREATE INDEX IF NOT EXISTS idx_signup_otp_email ON signup_otp(email)`
  await sql`CREATE INDEX IF NOT EXISTS idx_signup_otp_expires_at ON signup_otp(expires_at)`

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
    CREATE TABLE IF NOT EXISTS live_chat_messages (
      id              SERIAL PRIMARY KEY,
      stream_id       INTEGER       NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
      author_name     VARCHAR(255)  NOT NULL DEFAULT 'Anonymous',
      message         TEXT          NOT NULL,
      created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
    )
  `

  await sql`CREATE INDEX IF NOT EXISTS idx_live_chat_messages_stream_id ON live_chat_messages(stream_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_live_chat_messages_created_at ON live_chat_messages(created_at DESC)`

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
      uploader_id     VARCHAR(50)   NOT NULL,
      year            VARCHAR(50)   NOT NULL,
      semester        VARCHAR(50)   NOT NULL,
      module_name     VARCHAR(500)  NOT NULL,
      name            VARCHAR(500)  NOT NULL,
      resource_type   VARCHAR(50)   NOT NULL,
      link            TEXT,
      file_path       VARCHAR(500),
      download_count  INTEGER       NOT NULL DEFAULT 0,
      created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      FOREIGN KEY (uploader_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `

  await sql`CREATE INDEX IF NOT EXISTS idx_resources_uploader_id ON resources(uploader_id)`

  await sql`
    CREATE TABLE IF NOT EXISTS resource_downloads (
      id              SERIAL PRIMARY KEY,
      resource_id     INTEGER       NOT NULL,
      downloaded_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS resource_feedback (
      id              SERIAL PRIMARY KEY,
      resource_id     INTEGER       NOT NULL,
      rating          INTEGER       NOT NULL CHECK (rating BETWEEN 1 AND 5),
      comment         TEXT,
      user_name       VARCHAR(255)  DEFAULT 'Anonymous',
      created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
    )
  `

  await sql`CREATE INDEX IF NOT EXISTS idx_resource_downloads_resource_id ON resource_downloads(resource_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_resource_downloads_downloaded_at ON resource_downloads(downloaded_at DESC)`
  await sql`CREATE INDEX IF NOT EXISTS idx_resources_created_at ON resources(created_at DESC)`
  await sql`CREATE INDEX IF NOT EXISTS idx_resource_feedback_resource_id ON resource_feedback(resource_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_resource_feedback_created_at ON resource_feedback(created_at DESC)`

  // Table for Q&A Questions
  await sql`
    CREATE TABLE IF NOT EXISTS questions (
      id              SERIAL PRIMARY KEY,
      user_id         VARCHAR(50)   NOT NULL,
      title           VARCHAR(500)  NOT NULL,
      content         TEXT          NOT NULL,
      subject_code    VARCHAR(50)   NOT NULL,
      year            INTEGER       NOT NULL CHECK (year BETWEEN 1 AND 4),
      semester        INTEGER       NOT NULL CHECK (semester BETWEEN 1 AND 2),
      created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `

  await sql`CREATE INDEX IF NOT EXISTS idx_questions_user_id ON questions(user_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_questions_subject_code ON questions(subject_code)`
  await sql`CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at DESC)`
  await sql`CREATE INDEX IF NOT EXISTS idx_questions_year_semester ON questions(year, semester)`

  // Table for Q&A Answers
  await sql`
    CREATE TABLE IF NOT EXISTS answers (
      id              SERIAL PRIMARY KEY,
      question_id     INTEGER       NOT NULL,
      user_id         VARCHAR(50)   NOT NULL,
      content         TEXT          NOT NULL,
      created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `

  await sql`CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_answers_user_id ON answers(user_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_answers_created_at ON answers(created_at DESC)`

  // Quiz tables
  await sql`
    CREATE TABLE IF NOT EXISTS quizzes (
      id              SERIAL PRIMARY KEY,
      title           VARCHAR(500)  NOT NULL,
      description     TEXT,
      creator         VARCHAR(255)  NOT NULL,
      year            INTEGER       NOT NULL CHECK (year BETWEEN 1 AND 4),
      semester        INTEGER       NOT NULL CHECK (semester BETWEEN 1 AND 2),
      subject_code    VARCHAR(50),
      course          VARCHAR(500)  NOT NULL,
      category        VARCHAR(100)  NOT NULL,
      difficulty      VARCHAR(50)   NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
      duration        INTEGER       NOT NULL,
      participants    INTEGER       NOT NULL DEFAULT 0,
      created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS quiz_questions (
      id              SERIAL PRIMARY KEY,
      quiz_id         INTEGER       NOT NULL,
      question_text   TEXT          NOT NULL,
      options         TEXT[]        NOT NULL,
      correct_answer  INTEGER       NOT NULL CHECK (correct_answer >= 0),
      question_order  INTEGER       NOT NULL,
      created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS quiz_responses (
      id              SERIAL PRIMARY KEY,
      quiz_id         INTEGER       NOT NULL,
      participant_name VARCHAR(255) NOT NULL DEFAULT 'Anonymous',
      answers         INTEGER[]     NOT NULL,
      score           INTEGER       NOT NULL,
      total_questions INTEGER       NOT NULL,
      date_taken      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      participant_id  VARCHAR(50),
      percentage      NUMERIC(5,2),
      submitted_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
      FOREIGN KEY (participant_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS quiz_comments (
      id              SERIAL PRIMARY KEY,
      quiz_id         INTEGER       NOT NULL,
      name            VARCHAR(255)  NOT NULL DEFAULT 'Anonymous',
      message         TEXT          NOT NULL,
      created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
    )
  `

  // Migration: ensure professional response tracking columns and indexes exist
  await sql`ALTER TABLE quiz_responses ADD COLUMN IF NOT EXISTS participant_id VARCHAR(50)`
  await sql`ALTER TABLE quiz_responses ADD COLUMN IF NOT EXISTS percentage NUMERIC(5,2)`
  await sql`ALTER TABLE quiz_responses ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_quiz_responses_participant_id'
      ) THEN
        ALTER TABLE quiz_responses
        ADD CONSTRAINT fk_quiz_responses_participant_id
        FOREIGN KEY (participant_id) REFERENCES users(id) ON DELETE SET NULL;
      END IF;
    END $$;
  `

  await sql`CREATE INDEX IF NOT EXISTS idx_quiz_responses_quiz_id_date ON quiz_responses(quiz_id, date_taken DESC)`
  await sql`CREATE INDEX IF NOT EXISTS idx_quiz_responses_participant_id ON quiz_responses(participant_id)`

  await sql`
    CREATE TABLE IF NOT EXISTS quiz_ratings (
      id              SERIAL PRIMARY KEY,
      quiz_id         INTEGER       NOT NULL,
      name            VARCHAR(255)  NOT NULL DEFAULT 'Anonymous',
      rating          INTEGER       NOT NULL CHECK (rating BETWEEN 1 AND 5),
      created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
    )
  `

  // Migration: connect quizzes to subject4years via subject_code
  try {
    await sql`
      ALTER TABLE quizzes
      ADD COLUMN IF NOT EXISTS subject_code VARCHAR(50)
    `
    console.log('✅ subject_code column added to quizzes table')
  } catch (error: any) {
    if (!error.message.includes('already exists')) {
      console.warn('⚠️ Could not add subject_code column to quizzes:', error.message)
    }
  }

  // Backfill missing subject_code values for existing quizzes where course matches subject name
  try {
    await sql`
      UPDATE quizzes q
      SET subject_code = s.subject_code
      FROM subject4years s
      WHERE q.subject_code IS NULL
        AND q.year = s.year
        AND q.semester = s.semester
        AND LOWER(TRIM(q.course)) = LOWER(TRIM(s.subject_name))
    `
    console.log('✅ Backfilled subject_code values for quizzes')
  } catch (error: any) {
    console.warn('⚠️ Could not backfill quiz subject_code values:', error.message)
  }

  try {
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'fk_quizzes_subject4years'
        ) THEN
          ALTER TABLE quizzes
          ADD CONSTRAINT fk_quizzes_subject4years
          FOREIGN KEY (year, semester, subject_code)
          REFERENCES subject4years(year, semester, subject_code)
          ON UPDATE CASCADE
          ON DELETE RESTRICT;
        END IF;
      END $$;
    `
    console.log('✅ Foreign key fk_quizzes_subject4years ensured')
  } catch (error: any) {
    console.warn('⚠️ Could not add fk_quizzes_subject4years:', error.message)
  }

  // Chat tables
  await sql`
    CREATE TABLE IF NOT EXISTS chats (
      id              SERIAL PRIMARY KEY,
      user_id         VARCHAR(50)   NOT NULL,
      chat_name       VARCHAR(255)  NOT NULL,
      participant_name VARCHAR(255) NOT NULL,
      avatar          VARCHAR(10)   NOT NULL DEFAULT 'U',
      created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id              SERIAL PRIMARY KEY,
      chat_id         INTEGER       NOT NULL,
      sender          VARCHAR(255)  NOT NULL,
      sender_avatar   VARCHAR(10)   NOT NULL,
      sender_id       VARCHAR(50),
      content         TEXT          NOT NULL,
      is_own          BOOLEAN       NOT NULL DEFAULT false,
      is_read         BOOLEAN       NOT NULL DEFAULT false,
      status          VARCHAR(20)   NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read')),
      edited_content  TEXT,
      edited_at       TIMESTAMPTZ,
      deleted_at      TIMESTAMPTZ,
      created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `

  // Chat table indexes
  // Migration: Add WhatsApp-like columns to chat_messages
  try {
    await sql`
      ALTER TABLE chat_messages
      ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT false
    `
    console.log('✅ is_read column added to chat_messages table')
  } catch (error: any) {
    if (!error.message.includes('already exists')) {
      console.warn('⚠️ Could not add is_read column:', error.message)
    }
  }

  try {
    await sql`
      ALTER TABLE chat_messages
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'sent' CHECK (status IN ('pending', 'sent', 'delivered', 'read'))
    `
    console.log('✅ status column added to chat_messages table')
  } catch (error: any) {
    if (!error.message.includes('already exists')) {
      console.warn('⚠️ Could not add status column:', error.message)
    }
  }

  try {
    await sql`
      ALTER TABLE chat_messages
      ADD COLUMN IF NOT EXISTS sender_id VARCHAR(50)
    `
    console.log('✅ sender_id column added to chat_messages table')
  } catch (error: any) {
    if (!error.message.includes('already exists')) {
      console.warn('⚠️ Could not add sender_id column:', error.message)
    }
  }

  try {
    await sql`
      ALTER TABLE chat_messages
      ADD COLUMN IF NOT EXISTS edited_content TEXT
    `
    console.log('✅ edited_content column added to chat_messages table')
  } catch (error: any) {
    if (!error.message.includes('already exists')) {
      console.warn('⚠️ Could not add edited_content column:', error.message)
    }
  }

  try {
    await sql`
      ALTER TABLE chat_messages
      ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ
    `
    console.log('✅ edited_at column added to chat_messages table')
  } catch (error: any) {
    if (!error.message.includes('already exists')) {
      console.warn('⚠️ Could not add edited_at column:', error.message)
    }
  }

  try {
    await sql`
      ALTER TABLE chat_messages
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ
    `
    console.log('✅ deleted_at column added to chat_messages table')
  } catch (error: any) {
    if (!error.message.includes('already exists')) {
      console.warn('⚠️ Could not add deleted_at column:', error.message)
    }
  }
  // Migration: Add participant_id column to chats table
  try {
    await sql`
      ALTER TABLE chats
      ADD COLUMN IF NOT EXISTS participant_id VARCHAR(50)
    `
    console.log('✅ participant_id column added to chats table')
  } catch (error: any) {
    if (!error.message.includes('already exists')) {
      console.warn('Could not add participant_id column:', error.message)
    }
  }
  await sql`CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_chats_created_at ON chats(created_at DESC)`
  await sql`CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON chat_messages(chat_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC)`
  await sql`CREATE INDEX IF NOT EXISTS idx_chat_messages_is_read ON chat_messages(is_read)`
  await sql`CREATE INDEX IF NOT EXISTS idx_chat_messages_status ON chat_messages(status)`
  await sql`CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_chat_messages_deleted_at ON chat_messages(deleted_at)`

  // Quiz table indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_quizzes_year_semester ON quizzes(year, semester)`
  await sql`CREATE INDEX IF NOT EXISTS idx_quizzes_course ON quizzes(course)`
  await sql`CREATE INDEX IF NOT EXISTS idx_quizzes_subject_code ON quizzes(subject_code)`
  await sql`CREATE INDEX IF NOT EXISTS idx_quizzes_year_semester_subject_code ON quizzes(year, semester, subject_code)`
  await sql`CREATE INDEX IF NOT EXISTS idx_quizzes_created_at ON quizzes(created_at DESC)`
  await sql`CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_quiz_responses_quiz_id ON quiz_responses(quiz_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_quiz_responses_date ON quiz_responses(date_taken DESC)`
  await sql`CREATE INDEX IF NOT EXISTS idx_quiz_comments_quiz_id ON quiz_comments(quiz_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_quiz_comments_created_at ON quiz_comments(created_at DESC)`
  await sql`CREATE INDEX IF NOT EXISTS idx_quiz_ratings_quiz_id ON quiz_ratings(quiz_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_quiz_ratings_created_at ON quiz_ratings(created_at DESC)`

  initialized = true
}
