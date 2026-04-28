import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || url.includes('placeholder')) {
    console.error('CRITICAL: NEXT_PUBLIC_SUPABASE_URL is missing or using placeholder!');
  }

  return createBrowserClient(
    url || 'https://placeholder.supabase.co',
    anonKey || 'placeholder_api_key'
  )
}
