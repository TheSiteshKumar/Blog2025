/*
  # Add slug field to posts table

  1. Changes
    - Add required slug field to posts table
    - Add unique constraint to ensure no duplicate slugs
*/

ALTER TABLE posts
ADD COLUMN IF NOT EXISTS slug text NOT NULL DEFAULT '';

-- Add unique constraint to slug
ALTER TABLE posts
ADD CONSTRAINT posts_slug_key UNIQUE (slug);