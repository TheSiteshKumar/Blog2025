/*
  # Fix Categories Relationship

  1. Changes
    - Add foreign key relationship between posts and categories
    - Add RLS policies for categories
    - Update existing posts table structure

  2. Security
    - Enable RLS on categories table
    - Add policies for reading and managing categories
*/

-- Ensure categories table exists with correct structure
CREATE TABLE IF NOT EXISTS categories (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Add category_id to posts if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE posts 
    ADD COLUMN category_id bigint REFERENCES categories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Categories policies
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
CREATE INDEX IF NOT EXISTS posts_category_id_idx ON posts (category_id);