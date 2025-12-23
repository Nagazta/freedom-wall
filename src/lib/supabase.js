import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Deadline for posting (Dec 31, 2025, 11:59 PM UTC)
export const POSTING_DEADLINE = new Date('2025-12-31T23:59:59Z');

// Check if posting is still allowed
export const isPostingAllowed = () => {
  return new Date() < POSTING_DEADLINE;
};

// Available moods
export const MOODS = ['Gratitude', 'Regret', 'Love', 'Apology', 'Hope'];
