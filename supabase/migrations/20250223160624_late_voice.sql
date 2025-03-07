/*
  # Fix Categories Table and Relations

  1. New Tables
    - Ensure categories table exists with proper structure
    - Add necessary indexes for performance

  2. Changes
    - Add foreign key constraint from posts to categories
    - Add proper indexes for category lookups

  3. Security
    - Enable RLS on categories table
    - Add policies for reading and managing categories
*/

-- Create categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS categories (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Add policies for categories
CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS categories_name_idx ON categories (name);
CREATE INDEX IF NOT EXISTS categories_slug_idx ON categories (slug);

-- Ensure posts table has category_id column
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE posts ADD COLUMN category_id bigint REFERENCES categories(id) ON DELETE SET NULL;
  END IF;
END $$;