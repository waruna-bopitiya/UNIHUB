CREATE TABLE IF NOT EXISTS tutors (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  degree_program VARCHAR(255) NOT NULL,
  cgpa DECIMAL(3, 2) NOT NULL,
  experience_years DECIMAL(4, 2) NOT NULL,
  bio TEXT NOT NULL,
  expertise_areas TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tutors_status ON tutors(status);
CREATE INDEX IF NOT EXISTS idx_tutors_created_at ON tutors(created_at);
