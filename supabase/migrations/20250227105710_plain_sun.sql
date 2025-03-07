/*
  # Fix view count increment function

  1. Changes
    - Update the increment_view_count function to properly handle post IDs
    - Add error handling to prevent invalid input syntax errors
  
  2. Bug Fix
    - Fix the issue where the function was receiving a UUID instead of an integer
*/

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS increment_view_count(bigint);

-- Create a new function with proper type handling
CREATE OR REPLACE FUNCTION increment_view_count(post_id text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  post_id_int bigint;
  new_count integer;
BEGIN
  -- Try to convert the input to bigint
  BEGIN
    post_id_int := post_id::bigint;
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Invalid post ID format: %', post_id;
    RETURN 0;
  END;

  -- Update the view count
  UPDATE posts
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = post_id_int
  RETURNING view_count INTO new_count;
  
  RETURN COALESCE(new_count, 0);
END;
$$;