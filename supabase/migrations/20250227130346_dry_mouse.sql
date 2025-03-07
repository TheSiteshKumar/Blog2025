/*
  # Fix increment_view_count function

  1. Changes
    - Update the `increment_view_count` function to properly handle string post IDs
    - Convert the string post ID to an integer before using it in the query
    - Return the updated view count

  2. Reason for Change
    - The current function is receiving a UUID string but expects an integer
    - This causes errors when trying to update view counts
*/

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS increment_view_count(post_id text);

-- Create a new function that properly handles string post IDs
CREATE OR REPLACE FUNCTION increment_view_count(post_id text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count integer;
BEGIN
  -- Convert the post_id string to an integer
  UPDATE posts
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = post_id::integer
  RETURNING view_count INTO new_count;
  
  RETURN new_count;
EXCEPTION
  WHEN others THEN
    RAISE EXCEPTION 'Error updating view count: %', SQLERRM;
END;
$$;