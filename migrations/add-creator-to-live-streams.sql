-- Add creator_id column to live_streams table
ALTER TABLE live_streams
ADD COLUMN IF NOT EXISTS creator_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add foreign key constraint for creator_id
ALTER TABLE live_streams
ADD CONSTRAINT fk_live_streams_creator_id FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE;

-- Create index for faster queries by creator
CREATE INDEX IF NOT EXISTS idx_live_streams_creator_id ON live_streams(creator_id);
