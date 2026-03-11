import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Tablet, 
  CheckCircle, 
  Map as MapIcon, 
  Wallet, 
  Search, 
  Bell, 
  User, 
  TrendingUp, 
  AlertCircle, 
  Check, 
  X,
  Eye,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(cn(inputs));
}

// Mock Data for Charts
const revenueData = [
  { name: 'Mon', value: 4000 },
  { name: 'Tue', value: 3000 },
  { name: 'Wed', value: 2000 },
  { name: 'Thu', value: 2780 },
  { name: 'Fri', value: 1890 },
  { name: 'Sat', value: 2390 },
  { name: 'Sun', value: 3490 },
];

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<any>(null);
  const [devices, setDevices] = useState<any[]>([]);
  const [pendingAds, setPendingAds] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchStats();
    fetchDevices();
    fetchPendingAds();
    fetchPayouts();
  }, []);

  const fetchStats = async () => {
    const res = await fetch('/api/admin/stats');
    const data = await res.json();
    setStats(data);
  };

  const fetchDevices = async () => {
    const res = await fetch('/api/admin/devices');
    const data = await res.json();
    setDevices(data);
  };

  const fetchPendingAds = async () => {
    const res = await fetch('/api/admin/ads/pending');
    const data = await res.json();
    setPendingAds(data);
  };

  const fetchPayouts = async () => {
    const res = await fetch('/api/admin/payouts/eligible');
    const data = await res.json();
    setPayouts(data);
  };

  const handleAdAction = async (id: number, status: 'approved' | 'rejected') => {
    await fetch(`/api/ads/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchPendingAds();
  };

  const sidebarItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'devices', icon: Tablet, label: 'IoT Monitor' },
    { id: 'ads', icon: CheckCircle, label: 'Ad Approvals' },
    { id: 'map', icon: MapIcon, label: 'Live Tracking' },
    { id: 'payouts', icon: Wallet, label: 'Payouts' },
  ];

  return (
    <div className="flex h-screen bg-[#050505] text-zinc-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
              <span className="text-black font-black text-xl">D</span>
            </div>
            <span className="text-xl font-black tracking-tighter">DANFODRIVE</span>
          </div>
          
          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={twMerge(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  activeTab === item.id 
                    ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/10" 
                    : "text-zinc-500 hover:text-zinc-100 hover:bg-zinc-900"
                )}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto p-6 border-t border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden">
              <img src="https://i.pravatar.cc/150?u=admin" alt="Admin" />
            </div>
            <div>
              <p className="text-sm font-bold">Admin User</p>
              <p className="text-xs text-zinc-500">Super Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-[#050505]/50 backdrop-blur-xl z-10">
          <h1 className="text-lg font-bold capitalize">{activeTab.replace('-', ' ')}</h1>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input 
                type="text" 
                placeholder="Search fleet..." 
                className="bg-zinc-900 border border-zinc-800 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-yellow-400 transition-colors w-64"
              />
            </div>
            <button className="relative text-zinc-500 hover:text-zinc-100 transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full border-2 border-[#050505]" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Active Screens', value: stats?.totalScreens || 0, icon: Tablet, color: 'text-blue-400' },
                    { label: 'Online Devices', value: stats?.onlineDevices || 0, icon: Zap, color: 'text-green-400' },
                    { label: 'Offline (Critical)', value: stats?.offlineDevices || 0, icon: AlertCircle, color: 'text-red-400' },
                    { label: 'Monthly Revenue', value: `₦${(stats?.monthlyRevenue || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-yellow-400' },
                  ].map((kpi, i) => (
                    <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-zinc-500 text-sm font-medium">{kpi.label}</span>
                        <kpi.icon className={kpi.color} size={20} />
                      </div>
                      <div className="text-2xl font-black">{kpi.value}</div>
                      <div className="mt-2 text-xs text-zinc-500 flex items-center gap-1">
                        <TrendingUp size={12} className="text-green-400" />
                        <span className="text-green-400 font-bold">+12%</span> from last month
                      </div>
                    </div>
                  ))}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
                    <h3 className="text-sm font-bold mb-6 text-zinc-400 uppercase tracking-widest">Revenue Growth</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueData}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#facc15" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#facc15" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                          <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₦${v}`} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                            itemStyle={{ color: '#facc15' }}
                          />
                          <Area type="monotone" dataKey="value" stroke="#facc15" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
                    <h3 className="text-sm font-bold mb-6 text-zinc-400 uppercase tracking-widest">Recent Activity</h3>
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-800/50 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                            <Tablet size={18} className="text-yellow-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold">Device #DF-202{i} connected</p>
                            <p className="text-xs text-zinc-500">Ikeja, Lagos • 2 mins ago</p>
                          </div>
                          <div className="text-xs text-green-400 font-bold">LIVE</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'devices' && (
              <motion.div 
                key="devices"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden"
              >
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/80">
                      <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Device ID</th>
                      <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Driver</th>
                      <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Last Ping</th>
                      <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Battery</th>
                      <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {devices.map((device) => (
                      <tr key={device.id} className="border-b border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                        <td className="p-4 font-mono text-sm text-yellow-400">#{device.device_id}</td>
                        <td className="p-4 text-sm font-medium">{device.driver_name || 'Unassigned'}</td>
                        <td className="p-4 text-sm text-zinc-500">{new Date(device.last_ping).toLocaleString()}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-2 bg-zinc-800 rounded-full overflow-hidden">
                              <div 
                                className={twMerge(
                                  "h-full rounded-full",
                                  device.battery_level > 20 ? "bg-green-400" : "bg-red-400"
                                )}
                                style={{ width: `${device.battery_level}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold">{device.battery_level}%</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={twMerge(
                            "px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                            device.status === 'online' ? "bg-green-400/10 text-green-400" : "bg-red-400/10 text-red-400"
                          )}>
                            {device.status === 'online' ? 'LIVE' : 'DEAD'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}

            {activeTab === 'ads' && (
              <motion.div 
                key="ads"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {pendingAds.length === 0 ? (
                  <div className="col-span-full py-24 text-center">
                    <CheckCircle size={48} className="mx-auto text-zinc-800 mb-4" />
                    <p className="text-zinc-500 font-bold">Queue is empty. Good job!</p>
                  </div>
                ) : (
                  pendingAds.map((ad) => (
                    <div key={ad.id} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden group">
                      <div className="aspect-video bg-zinc-800 relative">
                        <img src={ad.asset_url} className="w-full h-full object-cover" alt="Ad Preview" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                          <button className="p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors">
                            <Eye size={20} />
                          </button>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold">{ad.campaign_name}</h3>
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{ad.type}</span>
                        </div>
                        <p className="text-xs text-zinc-500 mb-6">By {ad.advertiser_name}</p>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => handleAdAction(ad.id, 'approved')}
                            className="flex-1 bg-green-500/10 text-green-500 py-2 rounded-xl font-bold text-sm hover:bg-green-500 hover:text-white transition-all flex items-center justify-center gap-2"
                          >
                            <Check size={16} /> Approve
                          </button>
                          <button 
                            onClick={() => handleAdAction(ad.id, 'rejected')}
                            className="flex-1 bg-red-500/10 text-red-500 py-2 rounded-xl font-bold text-sm hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                          >
                            <X size={16} /> Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'payouts' && (
              <motion.div 
                key="payouts"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-yellow-400/10 border border-yellow-400/20 p-6 rounded-2xl flex items-center justify-between">
                  <div>
                    <h3 className="text-yellow-400 font-bold mb-1">Payout Threshold Reached</h3>
                    <p className="text-sm text-yellow-400/60">There are {payouts.length} drivers eligible for payout today.</p>
                  </div>
                  <button className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-black text-sm hover:scale-105 transition-transform">
                    Trigger All Payouts
                  </button>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-900/80">
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Driver</th>
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Balance</th>
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Bank Details</th>
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payouts.map((payout) => (
                        <tr key={payout.id} className="border-b border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                          <td className="p-4 font-bold">{payout.name}</td>
                          <td className="p-4 text-sm font-black text-green-400">₦{payout.balance.toLocaleString()}</td>
                          <td className="p-4">
                            <p className="text-sm font-medium">{payout.bank_name}</p>
                            <p className="text-xs text-zinc-500">{payout.account_number}</p>
                          </td>
                          <td className="p-4">
                            <button className="bg-zinc-800 text-zinc-100 px-4 py-2 rounded-lg text-xs font-bold hover:bg-zinc-700 transition-colors">
                              Trigger Payout
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'map' && (
              <motion.div 
                key="map"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden relative"
              >
                {/* Simulated Map for now, Mapbox requires token */}
                <div className="absolute inset-0 grayscale opacity-50">
                  <img src="https://picsum.photos/seed/lagos-map-admin/1920/1080" className="w-full h-full object-cover" alt="Map" />
                </div>
                
                {/* Live Markers */}
                {devices.filter(d => d.status === 'online').map((d, i) => (
                  <motion.div
                    key={d.id}
                    className="absolute w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg shadow-yellow-400/20"
                    style={{
                      top: `${30 + Math.random() * 40}%`,
                      left: `${30 + Math.random() * 40}%`,
                    }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Tablet size={12} className="text-black" />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-[10px] font-bold px-2 py-1 rounded border border-zinc-800 whitespace-nowrap">
                      {d.driver_name}
                    </div>
                  </motion.div>
                ))}

                <div className="absolute top-6 left-6 bg-black/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-widest">Live Tracking</span>
                  </div>
                  <p className="text-sm text-zinc-400">{devices.filter(d => d.status === 'online').length} Vehicles Active</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
