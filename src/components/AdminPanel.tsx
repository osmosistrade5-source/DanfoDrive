import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Monitor, 
  TrendingUp, 
  Users, 
  AlertCircle, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  MoreVertical, 
  Search, 
  Filter, 
  Plus, 
  Zap, 
  Smartphone, 
  MapPin, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity, 
  Database, 
  Server, 
  Cpu 
} from 'lucide-react';

export default function AdminPanel({ user }: { user: any }) {
  const [devices, setDevices] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('danfo_token');
        const [devRes, campRes] = await Promise.all([
          fetch('/api/devices', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/campaigns', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setDevices(await devRes.json());
        setCampaigns(await campRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (user?.role !== 'admin') {
    return (
      <div className="h-screen flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">Access Denied</h2>
          <p className="text-zinc-500 font-medium">You do not have administrative privileges to access this panel. Please contact the system administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">System Admin</h1>
          <p className="text-zinc-500 font-medium">Global overview of DanfoDrive network and infrastructure.</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-yellow" /> System Health: 99.9%
          </button>
          <button className="bg-brand-yellow text-brand-black px-6 py-3 rounded-2xl font-black uppercase tracking-tight hover:scale-105 transition-all flex items-center gap-2">
            <Plus className="w-5 h-5" /> Add Device
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AdminStatCard icon={Monitor} label="Total Screens" value={devices.length} trend="+4" />
        <AdminStatCard icon={TrendingUp} label="Total Ad Spend" value="₦4.2M" trend="+12%" />
        <AdminStatCard icon={Users} label="Total Drivers" value="128" trend="+8" />
        <AdminStatCard icon={Zap} label="Impressions" value="1.2M" trend="+24%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Device Management */}
        <div className="lg:col-span-2 glass-card overflow-hidden">
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-xl font-black uppercase tracking-tight">Device Management</h3>
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                  type="text" 
                  placeholder="Search devices..." 
                  className="bg-black border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-brand-yellow transition-all"
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  <th className="px-8 py-4">Device ID</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Driver</th>
                  <th className="px-8 py-4">Last Ping</th>
                  <th className="px-8 py-4">Uptime</th>
                  <th className="px-8 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {devices.map((device) => (
                  <tr key={device.id} className="hover:bg-white/5 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-yellow/10 flex items-center justify-center text-brand-yellow">
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <p className="font-bold uppercase tracking-tight">#{device.id}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        device.status === 'online' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {device.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-zinc-400">Emeka Nwosu</td>
                    <td className="px-8 py-6 text-zinc-400 text-xs">2m ago</td>
                    <td className="px-8 py-6 font-bold">98.4%</td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-2 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-white transition-all">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Logs */}
        <div className="glass-card p-8 flex flex-col">
          <h3 className="text-xl font-black uppercase tracking-tight mb-8">System Logs</h3>
          <div className="flex-1 space-y-6">
            <LogItem type="success" label="Campaign Approved" time="2m ago" details="Indomie Morning Rush (c1)" />
            <LogItem type="error" label="Device Offline" time="15m ago" details="Device #d42 disconnected" />
            <LogItem type="warning" label="Low Wallet Balance" time="45m ago" details="Advertiser Tunde Okafor" />
            <LogItem type="info" label="New Driver Registered" time="1h ago" details="Chidi Azikiwe (Lagos)" />
            <LogItem type="success" label="Payout Completed" time="3h ago" details="₦12,400 to Emeka Nwosu" />
          </div>
          <button className="w-full mt-8 py-4 border border-white/5 rounded-2xl text-sm font-bold text-zinc-500 hover:text-white hover:bg-white/5 transition-all">
            View All Logs
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminStatCard({ icon: Icon, label, value, trend }: { icon: any, label: string, value: any, trend: string }) {
  return (
    <div className="glass-card p-6 group hover:border-brand-yellow/30 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 bg-brand-yellow/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
          <Icon className="w-5 h-5 text-brand-yellow" />
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest ${trend.startsWith('+') ? 'text-green-500' : 'text-zinc-500'}`}>
          {trend}
        </span>
      </div>
      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function LogItem({ type, label, time, details }: { type: 'success' | 'error' | 'warning' | 'info', label: string, time: string, details: string }) {
  const colors = {
    success: 'text-green-500 bg-green-500/10',
    error: 'text-red-500 bg-red-500/10',
    warning: 'text-yellow-500 bg-yellow-500/10',
    info: 'text-blue-500 bg-blue-500/10'
  };

  return (
    <div className="flex gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[type]}`}>
        <Activity className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-sm font-bold truncate">{label}</p>
          <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest whitespace-nowrap">{time}</span>
        </div>
        <p className="text-xs text-zinc-500 truncate">{details}</p>
      </div>
    </div>
  );
}
