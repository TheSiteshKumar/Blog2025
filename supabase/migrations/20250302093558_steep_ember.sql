/*
  # Create contact submissions table

  1. New Tables
    - `contact_submissions`
      - `id` (bigint, primary key)
      - `name` (text, not null)
      - `email` (text, not null)
      - `subject` (text)
      - `message` (text, not null)
      - `status` (text, default 'new')
      - `created_at` (timestamptz, default now())
  2. Security
    - Enable RLS on `contact_submissions` table
    - Add policy for authenticated admins to read/manage submissions
    - Add policy for public to insert submissions
*/

-- Create contact submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS contact_submissions_status_idx ON contact_submissions (status);
CREATE INDEX IF NOT EXISTS contact_submissions_created_at_idx ON contact_submissions (created_at);

-- Policies for contact submissions
-- Anyone can submit a contact form
CREATE POLICY "Anyone can submit contact form"
  ON contact_submissions
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Only admins can read and manage contact submissions
CREATE POLICY "Admins can manage contact submissions"
  ON contact_submissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );