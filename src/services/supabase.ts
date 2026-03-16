import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; // Use service role for backend operations

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials missing. Database operations will fail.');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper for common operations
export const db = {
  client: supabase,
  users: () => supabase.from('users'),
  campaigns: () => supabase.from('campaigns'),
  wallets: () => supabase.from('wallets'),
  transactions: () => supabase.from('transactions'),
  routes: () => supabase.from('routes'),
  tracking: () => supabase.from('vehicle_tracking'),
  impressions: () => supabase.from('impressions')
};
