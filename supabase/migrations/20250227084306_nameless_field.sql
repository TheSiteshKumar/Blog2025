/*
  # Add view count to posts table

  1. Changes
    - Add view_count column to posts table with default value of 0
*/

-- Add view_count column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'view_count'
  ) THEN
    ALTER TABLE posts ADD COLUMN view_count integer DEFAULT 0;
  END IF;
END $$;

-- Create index for better performance on view count queries
CREATE INDEX IF NOT EXISTS posts_view_count_idx ON posts (view_count);