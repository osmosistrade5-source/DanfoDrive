import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    const isPlaceholder = (val: string, isUrl: boolean = false) => 
      !val || 
      val.includes('your-project-id') || 
      val.includes('your-service-role-key') || 
      val.includes('your_supabase_project_url') ||
      val.includes('your_supabase_service_role_key') ||
      (isUrl && !val.startsWith('http'));

    if (isPlaceholder(supabaseUrl, true) || isPlaceholder(supabaseKey)) {
      throw new Error('SUPABASE_NOT_CONFIGURED');
    }

    try {
      supabaseInstance = createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error);
      throw new Error('SUPABASE_NOT_CONFIGURED');
    }
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
