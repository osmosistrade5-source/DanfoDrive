import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Users, Megaphone, Wallet, 
  Settings, LogOut, Bell, Search, Activity,
  TrendingUp, ArrowUpRight, ShieldCheck, Zap,
  BarChart3, Truck, Timer, DollarSign, Lock,
  ChevronRight, MapPin, Clock, Calendar, Building2,
  Menu, X, ChevronDown, MoreVertical, Loader2
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const navigate = useNavigate();

  const userStr = localStorage.getItem('danfodrive_user');
  const user = (userStr && userStr !== 'undefined') ? JSON.parse(userStr) : {};

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Simulate API call for admin stats
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStats({
          revenue: 1250000,
          activeCampaigns: 48,
          totalDrivers: 156,
          impressions: 892400,
          growth: 12.5,
          recentActivity: [
            { id: 1, type: 'campaign', user: 'Coca-Cola', action: 'Launched "Share a Coke" Campaign', time: '2 mins ago' },
            { id: 2, type: 'driver', user: 'Tunde Bakare', action: 'Registered as new driver', time: '15 mins ago' },
            { id: 3, type: 'payment', user: 'PepsiCo', action: 'Deposited ₦500,000 to wallet', time: '1 hour ago' },
          ]
        });
      } catch (err) {
        console.error("Failed to fetch admin stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('danfodrive_token');
    localStorage.removeItem('danfodrive_user');
    localStorage.removeItem('danfodrive_remember');
    onLogout();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-yellow-400" size={48} />
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans flex">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-zinc-900 border-r border-white/10 flex flex-col relative z-50"
      >
        <div className="p-6 flex items-center justify-between">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && 'hidden'}`}>
            <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
              <ShieldCheck className="text-black" size={20} />
            </div>
            <span className="font-black text-xl tracking-tighter">DanfoDrive</span>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/5 rounded-lg text-zinc-500">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
            { id: 'campaigns', icon: Megaphone, label: 'Campaigns' },
            { id: 'drivers', icon: Truck, label: 'Drivers' },
            { id: 'users', icon: Users, label: 'User Management' },
            { id: 'finance', icon: Wallet, label: 'Financials' },
            { id: 'settings', icon: Settings, label: 'System Settings' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                activeTab === item.id ? 'bg-yellow-400 text-black font-black' : 'text-zinc-500 hover:text-white hover:bg-white/5 font-bold'
              }`}
            >
              <item.icon size={22} />
              {isSidebarOpen && <span className="text-sm uppercase tracking-widest">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-4 text-red-400 hover:bg-red-400/10 rounded-2xl transition-all font-bold"
          >
            <LogOut size={22} />
            {isSidebarOpen && <span className="text-sm uppercase tracking-widest">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-black p-8">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-black tracking-tighter mb-2">Admin Dashboard</h2>
            <p className="text-zinc-500 font-medium">Welcome back, {user.name || 'Administrator'}</p>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative p-3 bg-zinc-900 rounded-2xl border border-white/10 text-zinc-400 hover:text-white transition-colors">
              <Bell size={20} />
              <div className="absolute top-3 right-3 w-2 h-2 bg-yellow-400 rounded-full border-2 border-zinc-900" />
            </button>
            <div className="flex items-center gap-4 bg-zinc-900 p-2 pr-6 rounded-2xl border border-white/10">
              <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center font-black text-black">
                {user.name?.[0] || 'A'}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-black uppercase tracking-widest">{user.name || 'Admin'}</p>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Revenue', value: `₦${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
            { label: 'Active Campaigns', value: stats.activeCampaigns, icon: Megaphone, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
            { label: 'Total Drivers', value: stats.totalDrivers, icon: Truck, color: 'text-blue-400', bg: 'bg-blue-400/10' },
            { label: 'Impressions', value: stats.impressions.toLocaleString(), icon: Activity, color: 'text-purple-400', bg: 'bg-purple-400/10' },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-zinc-900 border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden group"
            >
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6`}>
                <stat.icon size={24} />
              </div>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{stat.label}</p>
              <p className="text-3xl font-black tracking-tighter">{stat.value}</p>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-16 -translate-y-16 group-hover:scale-110 transition-transform" />
            </motion.div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black tracking-tight">Recent System Activity</h3>
              <button className="text-xs font-bold text-yellow-400 uppercase tracking-widest hover:underline">View All</button>
            </div>
            <div className="space-y-6">
              {stats.recentActivity.map((activity: any) => (
                <div key={activity.id} className="flex items-center gap-6 p-4 hover:bg-white/5 rounded-3xl transition-colors group">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    activity.type === 'campaign' ? 'bg-yellow-400/10 text-yellow-400' :
                    activity.type === 'driver' ? 'bg-blue-400/10 text-blue-400' :
                    'bg-emerald-400/10 text-emerald-400'
                  }`}>
                    {activity.type === 'campaign' ? <Megaphone size={20} /> :
                     activity.type === 'driver' ? <Truck size={20} /> :
                     <DollarSign size={20} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black tracking-tight">{activity.action}</p>
                    <p className="text-xs text-zinc-500 font-medium">{activity.user} • {activity.time}</p>
                  </div>
                  <ChevronRight size={18} className="text-zinc-700 group-hover:text-white transition-colors" />
                </div>
              ))}
            </div>
          </div>

          {/* System Health */}
          <div className="bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8">
            <h3 className="text-xl font-black tracking-tight mb-8">System Health</h3>
            <div className="space-y-8">
              {[
                { label: 'API Latency', value: '42ms', status: 'optimal' },
                { label: 'DB Connections', value: '12/100', status: 'optimal' },
                { label: 'Storage Usage', value: '14.2 GB', status: 'optimal' },
                { label: 'Active Sockets', value: '248', status: 'optimal' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{item.label}</span>
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{item.status}</span>
                  </div>
                  <div className="w-full h-2 bg-black rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '80%' }}
                      className="h-full bg-yellow-400"
                    />
                  </div>
                  <p className="text-right mt-2 text-xs font-bold">{item.value}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-10 p-6 bg-yellow-400/5 border border-yellow-400/10 rounded-3xl">
              <div className="flex items-center gap-3 text-yellow-400 mb-2">
                <Zap size={18} />
                <span className="text-xs font-black uppercase tracking-widest">AI Insights</span>
              </div>
              <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                System performance is up 14% this week. Consider scaling the tracking worker to handle increased driver registrations.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
