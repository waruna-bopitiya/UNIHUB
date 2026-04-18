import { sql } from './db'

let initialized = false
let initializationStarted = false

export async function ensureTablesExist() {
  // If already initialized or in progress, skip silently
  if (initialized || initializationStarted) {
    return
  }

  initializationStarted = true
  console.log('🔧 Initializing database tables...')

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
      creator_id    VARCHAR(50),
      author_name   VARCHAR(255)  NOT NULL DEFAULT 'Student',
      author_avatar VARCHAR(500)  NOT NULL DEFAULT 'S',
      author_role   VARCHAR(255)  NOT NULL DEFAULT 'Student',
      content       TEXT          NOT NULL,
      category      VARCHAR(100)  NOT NULL DEFAULT 'General',
      likes_count   INTEGER       NOT NULL DEFAULT 0,
      comments_count INTEGER      NOT NULL DEFAULT 0,
      shares_count  INTEGER       NOT NULL DEFAULT 0,
      stream_video_id VARCHAR(100),
      stream_title  VARCHAR(500),
      is_private    BOOLEAN       NOT NULL DEFAULT FALSE,
      created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `

  // Add missing columns if they don't exist (for existing databases)
  try {
    await sql`
      ALTER TABLE posts
      ADD COLUMN IF NOT EXISTS creator_id VARCHAR(50)
    `
    console.log('✅ Added creator_id column to posts')
  } catch (e: any) {
    console.log('ℹ️ creator_id column already exists:', e?.message)
  }

  try {
    await sql`
      ALTER TABLE posts
      ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT FALSE
    `
    console.log('✅ Added is_private column to posts')
  } catch (e: any) {
    console.log('ℹ️ is_private column already exists:', e?.message)
  }

  try {
    await sql`
      ALTER TABLE posts
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()
    `
    console.log('✅ Added updated_at column to posts')
  } catch (e: any) {
    console.log('ℹ️ updated_at column already exists:', e?.message)
  }

  // Add foreign key constraint if it doesn't exist
  try {
    await sql`
      ALTER TABLE posts
      ADD CONSTRAINT fk_posts_creator_id FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
    `
    console.log('✅ Added foreign key constraint to posts')
  } catch (e: any) {
    console.log('ℹ️ Foreign key constraint already exists:', e?.message)
  }

  await sql`CREATE INDEX IF NOT EXISTS idx_posts_creator_id ON posts(creator_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_posts_is_private ON posts(is_private)`
  await sql`CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC)`

  await sql`
    CREATE TABLE IF NOT EXISTS post_likes (
      id              SERIAL PRIMARY KEY,
      post_id         INTEGER       NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      user_id         VARCHAR(50)   NOT NULL,
      created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      UNIQUE(post_id, user_id)
    )
  `

  await sql`CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id)`

  await sql`
    CREATE TABLE IF NOT EXISTS post_comments (
      id              SERIAL PRIMARY KEY,
      post_id         INTEGER       NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      user_id         VARCHAR(50)   NOT NULL,
      user_name       VARCHAR(255)  NOT NULL,
      user_avatar     VARCHAR(500)  NOT NULL DEFAULT 'S',
      content         TEXT          NOT NULL,
      created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
    )
  `

  await sql`CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON post_comments(user_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_post_comments_created_at ON post_comments(created_at DESC)`

  await sql`
    CREATE TABLE IF NOT EXISTS live_streams (
      id                   SERIAL PRIMARY KEY,
      post_id              INTEGER REFERENCES posts(id) ON DELETE SET NULL,
      creator_id           VARCHAR(50),
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
      created_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      updated_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `

  // Add missing columns if they don't exist (for existing databases)
  try {
    await sql`
      ALTER TABLE live_streams
      ADD COLUMN IF NOT EXISTS creator_id VARCHAR(50)
    `
    console.log('✅ Added creator_id column to live_streams')
  } catch (e: any) {
    console.log('ℹ️ creator_id column already exists or cannot be added:', e?.message)
  }

  try {
    await sql`
      ALTER TABLE live_streams
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()
    `
    console.log('✅ Added updated_at column to live_streams')
  } catch (e: any) {
    console.log('ℹ️ updated_at column already exists or cannot be added:', e?.message)
  }

  // Add foreign key constraint if it doesn't exist
  try {
    await sql`
      ALTER TABLE live_streams
      ADD CONSTRAINT fk_live_streams_creator_id FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
    `
    console.log('✅ Added foreign key constraint')
  } catch (e: any) {
    console.log('ℹ️ Foreign key constraint already exists:', e?.message)
  }

  await sql`CREATE INDEX IF NOT EXISTS idx_live_streams_creator_id ON live_streams(creator_id)`

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

  // Add missing columns to resources table (for backward compatibility)
  try {
    await sql`
      ALTER TABLE resources 
      ADD COLUMN IF NOT EXISTS uploader_name VARCHAR(255) DEFAULT 'Anonymous',
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS shareable_link TEXT,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()
    `
    console.log('✅ Added missing columns to resources table')
  } catch (e: any) {
    console.log('ℹ️ Resources columns already exist or cannot be added:', e?.message)
  }

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
      upvotes         INTEGER       NOT NULL DEFAULT 0 CHECK (upvotes >= 0),
      downvotes       INTEGER       NOT NULL DEFAULT 0 CHECK (downvotes >= 0),
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
      upvotes         INTEGER       NOT NULL DEFAULT 0 CHECK (upvotes >= 0),
      downvotes       INTEGER       NOT NULL DEFAULT 0 CHECK (downvotes >= 0),
      created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `

  // Migration: Add upvotes and downvotes columns to answers if they don't exist
  try {
    await sql`
      ALTER TABLE answers
      ADD COLUMN IF NOT EXISTS upvotes INTEGER NOT NULL DEFAULT 0 CHECK (upvotes >= 0)
    `
    console.log('✅ upvotes column added to answers table')
  } catch (error: any) {
    if (!error.message.includes('already exists')) {
      console.log('ℹ️ upvotes column already exists:', error?.message)
    }
  }

  try {
    await sql`
      ALTER TABLE answers
      ADD COLUMN IF NOT EXISTS downvotes INTEGER NOT NULL DEFAULT 0 CHECK (downvotes >= 0)
    `
    console.log('✅ downvotes column added to answers table')
  } catch (error: any) {
    if (!error.message.includes('already exists')) {
      console.log('ℹ️ downvotes column already exists:', error?.message)
    }
  }

  await sql`CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_answers_user_id ON answers(user_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_answers_created_at ON answers(created_at DESC)`

  // Table for Q&A Answer Votes
  await sql`
    CREATE TABLE IF NOT EXISTS answer_votes (
      id              SERIAL PRIMARY KEY,
      answer_id       INTEGER       NOT NULL,
      question_id     INTEGER       NOT NULL,
      user_id         VARCHAR(50)   NOT NULL,
      vote_type       VARCHAR(50)   NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
      created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      FOREIGN KEY (answer_id) REFERENCES answers(id) ON DELETE CASCADE,
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(answer_id, user_id)
    )
  `

  await sql`CREATE INDEX IF NOT EXISTS idx_answer_votes_answer_id ON answer_votes(answer_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_answer_votes_question_id ON answer_votes(question_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_answer_votes_user_id ON answer_votes(user_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_answer_votes_created_at ON answer_votes(created_at DESC)`

  // Table for Q&A Question Votes
  await sql`
    CREATE TABLE IF NOT EXISTS question_votes (
      id              SERIAL PRIMARY KEY,
      question_id     INTEGER       NOT NULL,
      user_id         VARCHAR(50)   NOT NULL,
      vote_type       VARCHAR(50)   NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
      created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(question_id, user_id)
    )
  `

  await sql`CREATE INDEX IF NOT EXISTS idx_question_votes_question_id ON question_votes(question_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_question_votes_user_id ON question_votes(user_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_question_votes_created_at ON question_votes(created_at DESC)`

  // Quiz tables
  await sql`
    CREATE TABLE IF NOT EXISTS quizzes (
      id              SERIAL PRIMARY KEY,
      title           VARCHAR(500)  NOT NULL,
      description     TEXT,
      creator         VARCHAR(255)  NOT NULL,
      year            INTEGER       NOT NULL CHECK (year BETWEEN 1 AND 4),
      semester        INTEGER       NOT NULL CHECK (semester BETWEEN 1 AND 2),
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
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
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

  // Chat tables
  await sql`
    CREATE TABLE IF NOT EXISTS chats (
      id              SERIAL PRIMARY KEY,
      user_id         VARCHAR(50)   NOT NULL,
      chat_name       VARCHAR(255)  NOT NULL,
      participant_name VARCHAR(255) NOT NULL,
      participant_id  VARCHAR(50),
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
  await sql`CREATE INDEX IF NOT EXISTS idx_quizzes_created_at ON quizzes(created_at DESC)`
  await sql`CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_quiz_responses_quiz_id ON quiz_responses(quiz_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_quiz_responses_date ON quiz_responses(date_taken DESC)`
  await sql`CREATE INDEX IF NOT EXISTS idx_quiz_comments_quiz_id ON quiz_comments(quiz_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_quiz_comments_created_at ON quiz_comments(created_at DESC)`
  await sql`CREATE INDEX IF NOT EXISTS idx_quiz_ratings_quiz_id ON quiz_ratings(quiz_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_quiz_ratings_created_at ON quiz_ratings(created_at DESC)`

  // Notifications table
  await sql`
    CREATE TABLE IF NOT EXISTS notifications (
      id              SERIAL PRIMARY KEY,
      user_id         VARCHAR(50)   NOT NULL,
      type            VARCHAR(50)   NOT NULL DEFAULT 'live_stream_reminder',
      title           VARCHAR(500)  NOT NULL,
      message         TEXT          NOT NULL,
      related_stream_id INTEGER REFERENCES live_streams(id) ON DELETE CASCADE,
      is_read         BOOLEAN       NOT NULL DEFAULT false,
      read_at         TIMESTAMPTZ,
      created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `

  await sql`CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read)`
  await sql`CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC)`
  await sql`CREATE INDEX IF NOT EXISTS idx_notifications_stream_id ON notifications(related_stream_id)`

  // Notification status tracking for 15-minute reminders
  await sql`
    CREATE TABLE IF NOT EXISTS live_stream_notification_status (
      id              SERIAL PRIMARY KEY,
      stream_id       INTEGER       NOT NULL UNIQUE,
      reminder_sent   BOOLEAN       NOT NULL DEFAULT false,
      reminder_sent_at TIMESTAMPTZ,
      FOREIGN KEY (stream_id) REFERENCES live_streams(id) ON DELETE CASCADE
    )
  `

  await sql`CREATE INDEX IF NOT EXISTS idx_stream_notification_status_stream_id ON live_stream_notification_status(stream_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_stream_notification_status_reminder_sent ON live_stream_notification_status(reminder_sent)`

  // Table for tracking user reminders on live streams
  await sql`
    CREATE TABLE IF NOT EXISTS live_stream_reminders (
      id              SERIAL PRIMARY KEY,
      user_id         VARCHAR(50)   NOT NULL,
      stream_id       INTEGER       NOT NULL,
      created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, stream_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (stream_id) REFERENCES live_streams(id) ON DELETE CASCADE
    )
  `

  await sql`CREATE INDEX IF NOT EXISTS idx_live_stream_reminders_user_id ON live_stream_reminders(user_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_live_stream_reminders_stream_id ON live_stream_reminders(stream_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_live_stream_reminders_created_at ON live_stream_reminders(created_at DESC)`

  initialized = true
  console.log('✅ Database tables initialized successfully')
}
