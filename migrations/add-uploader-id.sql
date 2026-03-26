-- SQL Migration Script to add uploader_id support to resources table
-- Run this if you get "uploader_id column not found" errors

-- 1. Add uploader_id column if it doesn't exist
ALTER TABLE resources 
ADD COLUMN IF NOT EXISTS uploader_id VARCHAR(50);

-- 2. For existing resources without an uploader_id, you can set a default (optional)
-- Uncomment and modify if needed:
-- UPDATE resources SET uploader_id = 'unknown' WHERE uploader_id IS NULL;

-- 3. Make uploader_id NOT NULL and add foreign key
ALTER TABLE resources 
ALTER COLUMN uploader_id SET NOT NULL;

-- 4. Add foreign key constraint if it doesn't exist
ALTER TABLE resources 
ADD CONSTRAINT IF NOT EXISTS fk_resources_uploader 
FOREIGN KEY (uploader_id) REFERENCES users(id) ON DELETE CASCADE;

-- 5. Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_resources_uploader_id ON resources(uploader_id);

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'resources' 
AND column_name = 'uploader_id';
