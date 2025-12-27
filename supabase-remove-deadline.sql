-- Remove the deadline constraint from confessions table
-- This allows confessions to be submitted at any time

ALTER TABLE confessions DROP CONSTRAINT IF EXISTS confessions_created_at_check;
