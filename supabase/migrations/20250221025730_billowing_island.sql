/*
  # Fix CMS Schema

  1. Changes
    - Ensure all columns are properly created
    - Recreate posts table with correct schema
    - Maintain all policies and triggers
*/

-- Drop existing table and related objects
DROP TABLE IF EXISTS posts CASCADE;
DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Recreate posts table with all required columns
CREATE TABLE posts (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title text NOT NULL,
  content text NOT NULL,
  slug text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  tags text[] DEFAULT '{}',
  meta_title text,
  meta_description text,
  image_url text,
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Recreate posts policies
CREATE POLICY "Anyone can read posts"
  ON posts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can create posts"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Ensure storage bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Ensure storage policies exist
DROP POLICY IF EXISTS "Allow public viewing of blog images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to blog images" ON storage.objects;

CREATE POLICY "Allow public viewing of blog images"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'blog-images' );

CREATE POLICY "Allow authenticated uploads to blog images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'blog-images' );