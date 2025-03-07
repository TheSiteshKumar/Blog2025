/*
  # Add Categories and Update Posts Schema

  1. New Tables
    - `categories`
      - `id` (bigint, primary key)
      - `name` (text, unique)
      - `slug` (text, unique)
      - `created_at` (timestamp)

  2. Changes to Posts Table
    - Add `excerpt` column
    - Add `category_id` column with foreign key reference
    - Add `image_alt` column

  3. Security
    - Enable RLS on categories table
    - Add policies for admin access
*/

-- Create categories table
CREATE TABLE categories (
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

-- Add new columns to posts
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS excerpt text,
ADD COLUMN IF NOT EXISTS category_id bigint REFERENCES categories(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS image_alt text;