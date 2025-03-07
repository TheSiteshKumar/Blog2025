/*
  # Fix Comments Function

  1. New Functions
    - Recreate the get_post_comments function to ensure it exists in the database
    - This function retrieves comments for a post with their replies
  
  2. Changes
    - Ensures the function is properly defined with the correct parameter type
    - Maintains the same functionality as the original function
*/

-- Drop the function if it exists to avoid conflicts
DROP FUNCTION IF EXISTS get_post_comments(bigint);

-- Recreate the function with the correct parameter type
CREATE OR REPLACE FUNCTION get_post_comments(post_id_param bigint)
RETURNS TABLE (
  id uuid,
  post_id bigint,
  author_name text,
  author_email text,
  content text,
  parent_id uuid,
  status text,
  created_at timestamptz,
  replies jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH root_comments AS (
    SELECT c.*
    FROM comments c
    WHERE c.post_id = post_id_param
    AND c.parent_id IS NULL
    AND c.status = 'approved'
  ),
  comment_replies AS (
    SELECT 
      c.parent_id,
      jsonb_agg(
        jsonb_build_object(
          'id', c.id,
          'author_name', c.author_name,
          'content', c.content,
          'created_at', c.created_at
        ) ORDER BY c.created_at
      ) AS replies
    FROM comments c
    WHERE c.post_id = post_id_param
    AND c.parent_id IS NOT NULL
    AND c.status = 'approved'
    GROUP BY c.parent_id
  )
  SELECT 
    rc.id,
    rc.post_id,
    rc.author_name,
    rc.author_email,
    rc.content,
    rc.parent_id,
    rc.status,
    rc.created_at,
    COALESCE(cr.replies, '[]'::jsonb) AS replies
  FROM root_comments rc
  LEFT JOIN comment_replies cr ON rc.id = cr.parent_id
  ORDER BY rc.created_at DESC;
END;
$$;