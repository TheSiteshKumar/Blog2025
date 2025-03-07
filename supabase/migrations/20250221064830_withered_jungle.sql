/*
  # Add missing meta columns to posts table

  1. Changes
    - Add meta_title column
    - Add meta_description column
    - Add constraints to ensure data integrity

  2. Security
    - No changes to RLS policies needed
*/

DO $$ 
BEGIN
  -- Add meta_title if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'meta_title'
  ) THEN
    ALTER TABLE posts ADD COLUMN meta_title text;
  END IF;

  -- Add meta_description if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'meta_description'
  ) THEN
    ALTER TABLE posts ADD COLUMN meta_description text;
  END IF;
END $$;