/*
  # Create comments table and related functions

  1. New Tables
    - `comments`
      - `id` (uuid, primary key)
      - `post_id` (references posts)
      - `author_name` (text)
      - `author_email` (text)
      - `content` (text)
      - `parent_id` (self-reference for nested comments)
      - `status` (enum: pending, approved, spam, rejected)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on `comments` table
    - Add policies for public comment submission
    - Add policies for admin comment management
*/

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id bigint NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_email text NOT NULL,
  content text NOT NULL,
  parent_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'spam', 'rejected')),
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