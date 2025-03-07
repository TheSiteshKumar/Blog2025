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

-- Create a function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count(post_id bigint)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count integer;
BEGIN
  UPDATE posts
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = post_id
  RETURNING view_count INTO new_count;
  
  RETURN new_count;
END;
$$;