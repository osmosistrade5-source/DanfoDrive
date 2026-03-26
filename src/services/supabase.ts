import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  role: 'advertiser' | 'driver' | 'admin';
  full_name: string;
  wallet_balance: number;
};

export type Campaign = {
  id: string;
  advertiser_id: string;
  name: string;
  budget: number;
  cpm_rate: number;
  status: 'draft' | 'active' | 'paused' | 'completed';
  start_date: string;
  end_date: string;
};

export type Ad = {
  id: string;
  campaign_id: string;
  asset_url: string;
  qr_code_url: string;
  duration: number;
};

export type Device = {
  id: string;
  driver_id: string;
  vehicle_type: string;
  status: 'online' | 'offline';
  last_heartbeat: string;
  current_lat: number;
  current_lng: number;
};
