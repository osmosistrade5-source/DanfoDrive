import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials missing. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment variables.');
    }

    supabaseInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return supabaseInstance;
};

// Helper for common operations using lazy initialization
export const db = {
  client: () => getSupabase(),
  users: () => getSupabase().from('users'),
  campaigns: () => getSupabase().from('campaigns'),
  wallets: () => getSupabase().from('wallets'),
  transactions: () => getSupabase().from('transactions'),
  routes: () => getSupabase().from('routes'),
  tracking: () => getSupabase().from('vehicle_tracking'),
  impressions: () => getSupabase().from('impressions'),
  rpc: (name: string, args?: any) => getSupabase().rpc(name, args)
};
