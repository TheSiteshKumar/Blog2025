/*
  # Make specific user an admin

  1. Changes
    - Update role to 'admin' for user with email 'thesiteshkumar@gmail.com'

  2. Security
    - No changes to RLS policies
    - Only updates role for a specific user
*/

DO $$ 
BEGIN
  UPDATE profiles
  SET role = 'admin'
  WHERE email = 'thesiteshkumar@gmail.com';
END $$;