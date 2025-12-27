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

// Available moods
export const MOODS = ['Gratitude', 'Regret', 'Love', 'Apology', 'Hope', 'Others'];

// Helper to check if a confession is from the last 24 hours
export const isLatest = (dateString) => {
  const created = new Date(dateString);
  const now = new Date();
  const diffMs = now - created;
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours <= 24;
};
