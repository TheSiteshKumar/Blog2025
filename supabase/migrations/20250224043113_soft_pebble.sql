/*
  # Add missing columns to posts table

  1. Changes
    - Add category_id column to posts table
    - Add excerpt column
    - Add image_alt column
    - Add foreign key constraint for category_id

  2. Security
    - No changes to RLS policies needed
*/

-- Add missing columns if they don't exist
DO $$ 
BEGIN
  -- Add category_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE posts 
    ADD COLUMN category_id bigint REFERENCES categories(id) ON DELETE SET NULL;
  END IF;

  -- Add excerpt if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'excerpt'
  ) THEN
    ALTER TABLE posts 
    ADD COLUMN excerpt text;
  END IF;

  -- Add image_alt if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'image_alt'
  ) THEN
    ALTER TABLE posts 
    ADD COLUMN image_alt text;
  END IF;
END $$;