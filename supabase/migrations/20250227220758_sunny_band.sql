/*
  # Fix Comments Post Relationship

  1. Changes
    - Adds a foreign key constraint to ensure comments.post_id references posts.id
    - Creates an index on comments.post_id for better query performance
  
  2. Notes
    - This ensures proper relationship between comments and posts tables
    - Helps with joins and foreign key references in queries
*/

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'comments_post_id_fkey'
    AND table_name = 'comments'
  ) THEN
    ALTER TABLE comments 
    ADD CONSTRAINT comments_post_id_fkey 
    FOREIGN KEY (post_id) 
    REFERENCES posts(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Create index on post_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'comments_post_id_idx'
  ) THEN
    CREATE INDEX comments_post_id_idx ON comments(post_id);
  END IF;
END $$;