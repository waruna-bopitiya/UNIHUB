-- Migration: Increase author_avatar column size to support longer values
-- This allows avatars to be names, initials, or URLs

ALTER TABLE posts 
  ALTER COLUMN author_avatar TYPE VARCHAR(500);

-- Verify the change
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'posts' AND column_name = 'author_avatar';
