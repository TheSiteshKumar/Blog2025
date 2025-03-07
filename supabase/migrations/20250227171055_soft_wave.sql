/*
  # Add Comments System

  1. New Tables
    - `comments` table for storing user comments on blog posts
      - `id` (uuid, primary key)
      - `post_id` (bigint, foreign key to posts)
      - `author_name` (text)
      - `author_email` (text)
      - `content` (text)
      - `parent_id` (uuid, self-reference for nested comments)
      - `status` (text, for moderation: pending/approved/rejected/spam)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `comments` table
    - Add policies for public read access to approved comments
    - Add policies for public submission of comments (as pending)
    - Add policies for admin management of all comments

  3. Functions
    - Function to get comments for a post with their replies
    - Functions for comment moderation (approve, reject, mark as spam)
    - Function to count pending comments
*/

-- Create comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id bigint NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_email text NOT NULL,
  content text NOT NULL,
  parent_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'spam')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS comments_post_id_idx ON comments (post_id);
CREATE INDEX IF NOT EXISTS comments_parent_id_idx ON comments (parent_id);
CREATE INDEX IF NOT EXISTS comments_status_idx ON comments (status);

-- Policies for comments
-- Anyone can read approved comments
CREATE POLICY "Anyone can read approved comments"
  ON comments
  FOR SELECT
  TO public
  USING (status = 'approved');

-- Anyone can submit comments
CREATE POLICY "Anyone can submit comments"
  ON comments
  FOR INSERT
  TO public
  WITH CHECK (status = 'pending');

-- Admins can manage all comments
CREATE POLICY "Admins can manage all comments"
  ON comments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

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