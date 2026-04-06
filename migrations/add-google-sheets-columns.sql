-- Google Sheets Integration Database Update
-- Run this script to add new columns to the resources table

-- Add shareable_link column
ALTER TABLE resources ADD COLUMN IF NOT EXISTS shareable_link VARCHAR(500);

-- Add uploader_name column
ALTER TABLE resources ADD COLUMN IF NOT EXISTS uploader_name VARCHAR(255) DEFAULT 'Anonymous';

-- Add description column
ALTER TABLE resources ADD COLUMN IF NOT EXISTS description TEXT;

-- Add created_at column if it doesn't exist
ALTER TABLE resources ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Update existing resource_type values if needed (for backward compatibility)
-- Uncomment and modify if your resource_type values need mapping:
-- UPDATE resources SET resource_type = 'PDF' WHERE resource_type = 'file';
-- UPDATE resources SET resource_type = 'Link' WHERE resource_type = 'link';

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_resources_year_semester ON resources(year, semester);
CREATE INDEX IF NOT EXISTS idx_resources_uploader ON resources(uploader_id);
CREATE INDEX IF NOT EXISTS idx_resources_resource_type ON resources(resource_type);
