import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Wallet, 
  Smartphone, 
  Car, 
  Zap, 
  TrendingUp, 
  Clock, 
  MapPin, 
  AlertCircle, 
  ChevronRight, 
  Download, 
  ArrowUpRight,
  Monitor
} from 'lucide-react';

export default function DriverPortal({ user }: { user: any }) {
  const [devices, setDevices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('danfo_token');
        const res = await fetch('/api/devices', { headers: { Authorization: `Bearer ${token}` } });
        setDevices(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Driver Portal</h1>
          <p className="text-zinc-500 font-medium">Welcome back, {user?.full_name}. Track your earnings and screen status.</p>
        </div>
        <button className="bg-brand-yellow text-brand-black px-8 py-4 rounded-2xl font-black uppercase tracking-tight hover:scale-105 transition-all flex items-center gap-2">
          <Download className="w-5 h-5" /> Withdraw Funds
        </button>
      </div>

      {/* Verification Warning */}
      {!user?.is_verified && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl bg-brand-yellow/10 border border-brand-yellow/20 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-yellow/20 rounded-2xl flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6 text-brand-yellow" />
            </div>
            <div>
              <p className="font-black uppercase tracking-tight text-brand-yellow">Verification Pending</p>
              <p className="text-sm text-zinc-400 font-medium">Your account is currently under review. Some features like withdrawals and new screen activations are restricted until your license is verified.</p>
            </div>
          </div>
          <button className="whitespace-nowrap px-6 py-3 bg-brand-yellow text-brand-black rounded-xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all">
            Check Status
          </button>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-8 bg-gradient-to-br from-brand-yellow/10 to-transparent border-brand-yellow/20">
          <div className="flex items-start justify-between mb-6">
            <div className="w-12 h-12 bg-brand-yellow/20 rounded-2xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-brand-yellow" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-green-500">+₦2,400 today</span>
          </div>
          <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-1">Total Earnings</p>
          <p className="text-4xl font-black text-white">₦{user?.wallet_balance?.toLocaleString()}</p>
        </div>

        <div className="glass-card p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
              <Monitor className="w-6 h-6 text-blue-500" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-blue-500">2 Active</span>
          </div>
          <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-1">My Screens</p>
          <p className="text-4xl font-black text-white">{devices.length}</p>
        </div>

        <div className="glass-card p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-purple-500" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-purple-500">98% Uptime</span>
          </div>
          <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-1">Performance Score</p>
          <p className="text-4xl font-black text-white">A+</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Device List */}
        <div className="glass-card p-8">
          <h3 className="text-xl font-black uppercase tracking-tight mb-8">My Devices</h3>
          <div className="space-y-4">
            {devices.map((device) => (
              <div key={device.id} className="p-6 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group hover:border-brand-yellow/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    device.status === 'online' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold uppercase tracking-tight">{device.vehicle_type} Screen #{device.id}</p>
                    <p className="text-xs text-zinc-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {device.current_lat.toFixed(4)}, {device.current_lng.toFixed(4)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-black uppercase tracking-widest mb-1 ${
                    device.status === 'online' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {device.status}
                  </p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Last ping: 2m ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payouts */}
        <div className="glass-card p-8">
          <h3 className="text-xl font-black uppercase tracking-tight mb-8">Recent Payouts</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-500">
                    <ArrowUpRight className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold">Weekly Payout</p>
                    <p className="text-xs text-zinc-500">March {15 - i}, 2026</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-white">₦{(5000 + i * 1000).toLocaleString()}</p>
                  <p className="text-[10px] text-green-500 font-black uppercase tracking-widest">Completed</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-4 border border-white/5 rounded-2xl text-sm font-bold text-zinc-500 hover:text-white hover:bg-white/5 transition-all">
            View All Transactions
          </button>
        </div>
      </div>

      {/* Support Banner */}
      <div className="p-10 rounded-[40px] bg-brand-yellow text-brand-black flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-xl">
          <h3 className="text-3xl font-black uppercase tracking-tighter mb-4">Need help with your screen?</h3>
          <p className="font-bold opacity-70">Our support team is available 24/7 to help you with hardware issues, payments, or account setup via WhatsApp or in-app chat.</p>
        </div>
        <button className="bg-brand-black text-brand-yellow px-10 py-5 rounded-3xl font-black uppercase tracking-tight text-lg hover:scale-105 transition-all shadow-2xl">
          Contact Support
        </button>
      </div>
    </div>
  );
}
