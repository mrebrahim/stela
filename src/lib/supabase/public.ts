import { createClient } from '@supabase/supabase-js';
import { env } from '../env';

// Anon, no-cookie client for static contexts (generateStaticParams, sitemap).
export function createPublicClient() {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}
