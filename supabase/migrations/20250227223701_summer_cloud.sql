/*
  # Fix comments status check constraint

  1. Changes
    - Ensures the comments table has the correct status check constraint
    - Validates that status can only be 'pending', 'approved', 'rejected', or 'spam'
*/

-- First, drop the existing constraint if it exists
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_status_check;

-- Add the correct constraint
ALTER TABLE comments 
ADD CONSTRAINT comments_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'spam'));