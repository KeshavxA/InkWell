import { createClient } from '@supabase/supabase-js';

/**
 * Lazily initializes a Supabase Admin client with elevated privileges.
 * This is used for operations that need to bypass RLS, like admin management
 * or updating user profiles from the server.
 * 
 * We use a function here instead of a top-level constant to prevent 
 * Vercel build errors caused by missing environment variables during build time.
 */
export const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase Admin environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};
