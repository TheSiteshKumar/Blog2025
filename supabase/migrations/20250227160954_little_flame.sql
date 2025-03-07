/*
  # Remove view count functionality and add comment queries

  1. Changes
    - Drop the increment_view_count function
    - Remove view_count column from posts table
    - Add indexes and functions for comment management
  
  2. Comment System
    - Add functions to get comments with replies
    - Add functions to manage comment status
*/

-- Drop the view count function
DROP FUNCTION IF EXISTS increment_view_count;

-- Remove view_count column if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'view_count'
  ) THEN
    ALTER TABLE posts DROP COLUMN view_count;
  END IF;
END $$;

-- Function to get comments for a post with their replies
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

-- Function to approve a comment
CREATE OR REPLACE FUNCTION approve_comment(comment_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE comments
  SET status = 'approved'
  WHERE id = comment_id_param;
  
  RETURN FOUND;
END;
$$;

-- Function to reject a comment
CREATE OR REPLACE FUNCTION reject_comment(comment_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE comments
  SET status = 'rejected'
  WHERE id = comment_id_param;
  
  RETURN FOUND;
END;
$$;

-- Function to mark a comment as spam
CREATE OR REPLACE FUNCTION mark_comment_as_spam(comment_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE comments
  SET status = 'spam'
  WHERE id = comment_id_param;
  
  RETURN FOUND;
END;
$$;

-- Function to get pending comments count
CREATE OR REPLACE FUNCTION get_pending_comments_count()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  count_result integer;
BEGIN
  SELECT COUNT(*) INTO count_result
  FROM comments
  WHERE status = 'pending';
  
  RETURN count_result;
END;
$$;