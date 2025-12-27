-- Allow DELETE on confessions table for anonymous users (admin access)
-- WARNING: This is permissive. In production, use proper authentication with roles.

-- Drop existing DELETE policy if it exists
DROP POLICY IF EXISTS "Allow DELETE on confessions for admins" ON confessions;

-- Create permissive DELETE policy for admin operations
-- In production, you should check for authenticated admin users
CREATE POLICY "Allow DELETE on confessions for admins"
  ON confessions FOR DELETE TO anon
  USING (true);

-- Also ensure UPDATE policy exists for flagged column
DROP POLICY IF EXISTS "Allow UPDATE on confessions for flagging" ON confessions;

CREATE POLICY "Allow UPDATE on confessions for flagging"
  ON confessions FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- Add DELETE policy for reports table
DROP POLICY IF EXISTS "Allow DELETE on reports" ON reports;

CREATE POLICY "Allow DELETE on reports"
  ON reports FOR DELETE TO anon
  USING (true);
