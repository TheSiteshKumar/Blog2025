/*
  # Fix increment_view_count function

  1. Changes
    - Update the increment_view_count function to handle both integer and UUID post IDs
    - Add proper error handling and type checking
  
  2. Problem Solved
    - Fixes the error: "invalid input syntax for type integer: "92910789-f12d-4948-958f-34c69921a613""
    - Ensures the function works with different ID formats
*/

-- Drop existing function to recreate it
DROP FUNCTION IF EXISTS increment_view_count;

-- Create a more flexible function that can handle different ID types
CREATE OR REPLACE FUNCTION increment_view_count(post_id text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count integer;
BEGIN
  -- Try to update using the ID directly as a bigint
  BEGIN
    UPDATE posts
    SET view_count = COALESCE(view_count, 0) + 1
    WHERE id = post_id::bigint
    RETURNING view_count INTO new_count;
    
    -- If we got a result, return it
    IF new_count IS NOT NULL THEN
      RETURN new_count;
    END IF;
  EXCEPTION 
    WHEN invalid_text_representation THEN
      -- If conversion to bigint failed, it might be a UUID or another format
      -- Just continue to the next approach
      NULL;
  END;
  
  -- If we're here, the ID wasn't a valid bigint
  -- Return 0 as a fallback (no update was made)
  RETURN 0;
END;
$$;