/*
  # Fix increment_view_count function to handle numeric post IDs

  1. Changes
    - Update the function parameter type to numeric
    - Ensure proper numeric comparison in the update query
    - Add error handling with detailed error messages

  2. Reason for Change
    - The posts.id is a numeric type, not UUID
    - Passing numeric IDs without incorrect casting fixes the error
*/

-- Drop existing function to recreate it
DROP FUNCTION IF EXISTS increment_view_count;

-- Create function with numeric parameter type
CREATE OR REPLACE FUNCTION increment_view_count(post_id numeric)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count integer;
BEGIN
  -- Update view count using numeric ID directly
  UPDATE posts
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = post_id
  RETURNING view_count INTO new_count;
  
  RETURN new_count;
EXCEPTION
  WHEN others THEN
    RAISE EXCEPTION 'Error updating view count: %', SQLERRM;
END;
$$;