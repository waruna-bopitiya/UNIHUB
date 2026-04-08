-- Create answer_comments table for storing comments on answers
CREATE TABLE IF NOT EXISTS answer_comments (
    id SERIAL PRIMARY KEY,
    answer_id INTEGER NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (answer_id) REFERENCES answers(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_answer_comments_answer_id ON answer_comments(answer_id);
CREATE INDEX IF NOT EXISTS idx_answer_comments_user_id ON answer_comments(user_id);
