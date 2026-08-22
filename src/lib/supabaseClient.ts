import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
      supabaseKey &&
      !supabaseUrl.includes('YOUR_PROJECT_ID') &&
      !supabaseKey.includes('YOUR_KEY')
  );
};

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('YOUR_PROJECT_ID') || supabaseKey.includes('YOUR_KEY')) {
  console.warn(
    "Missing Supabase configuration. Please add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env.local"
  );
}

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
