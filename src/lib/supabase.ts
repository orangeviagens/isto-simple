// ============================================================
// Orange Messenger — Supabase Client
// ============================================================
// Single instance of the Supabase client, used across the app.
// ============================================================

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { config } from '@/config/env';

if (!config.supabase.url || !config.supabase.anonKey) {
  throw new Error(
    'Missing Supabase credentials. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'
  );
}

export const supabase = createClient<Database>(
  config.supabase.url,
  config.supabase.anonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);
