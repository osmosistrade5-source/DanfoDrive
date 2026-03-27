import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Users, 
  MousePointer2, 
  Wallet, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  MapPin, 
  Clock, 
  ChevronRight, 
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
  Globe,
  Zap
} from 'lucide-react';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import NewCampaignModal from './NewCampaignModal';
import WalletModal from './WalletModal';
import { MapSearch } from './MapSearch';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';

const data = [
  { name: 'Mon', impressions: 4000, spend: 2400 },
  { name: 'Tue', impressions: 3000, spend: 1398 },
  { name: 'Wed', impressions: 2000, spend: 9800 },
  { name: 'Thu', impressions: 2780, spend: 3908 },
  { name: 'Fri', impressions: 1890, spend: 4800 },
  { name: 'Sat', impressions: 2390, spend: 3800 },
  { name: 'Sun', impressions: 3490, spend: 4300 },
];

export default function AdvertiserDashboard({ user, setUser }: { user: any; setUser: (user: any) => void }) {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ totalSpend: 0, totalImpressions: 0, activeCampaigns: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isNewCampaignModalOpen, setIsNewCampaignModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletModalType, setWalletModalType] = useState<'topup' | 'withdraw'>('topup');
  const navigate = useNavigate();

  const handleWalletSuccess = (amount: number, type: 'topup' | 'withdraw') => {
    if (!user) return;
    const newBalance = type === 'topup' ? user.wallet_balance + amount : user.wallet_balance - amount;
    const updatedUser = { ...user, wallet_balance: newBalance };
    setUser(updatedUser);
    localStorage.setItem('danfo_user', JSON.stringify(updatedUser));
  };

  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('danfo_token');
      if (!token) {
        navigate('/advertiser/login');
        return;
      }

      try {
        const response = await fetch('/api/advertisers/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.ok) {
          localStorage.removeItem('danfo_token');
          localStorage.removeItem('danfo_user');
          navigate('/advertiser/login');
          return;
        }
        
        const userData = await response.json();
        setUser(userData);
        fetchData();
      } catch (err) {
        console.error('Session verification error:', err);
        navigate('/advertiser/login');
      }
    };

    verifySession();
  }, [navigate, setUser]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('danfo_token');
      // Simulate API calls with mock data if they fail
      const [campRes, statsRes] = await Promise.all([
        fetch('/api/campaigns', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ json: () => [] })),
        fetch('/api/stats/advertiser', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ json: () => ({ totalSpend: 1250000, totalImpressions: 450000, activeCampaigns: 12 }) }))
      ]);
      
      const campData = await campRes.json();
      const statsData = await statsRes.json();
      
      setCampaigns(campData.length > 0 ? campData : [
        { id: '1', name: 'Summer Launch', status: 'active', budget: 500000, cpm_rate: 1500, start_date: '2026-03-01', end_date: '2026-04-01' },
        { id: '2', name: 'Brand Awareness', status: 'active', budget: 250000, cpm_rate: 1200, start_date: '2026-03-15', end_date: '2026-04-15' },
        { id: '3', name: 'Flash Sale', status: 'paused', budget: 100000, cpm_rate: 1800, start_date: '2026-03-20', end_date: '2026-03-25' },
      ]);
      setStats(statsData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const CampaignsList = () => (
    <div className="glass-card overflow-hidden">
      <div className="p-8 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-xl font-black uppercase tracking-tight">All Campaigns</h3>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search campaigns..." 
              className="bg-black border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-brand-yellow transition-all"
            />
          </div>
          <button className="p-2 bg-white/5 rounded-xl border border-white/10 text-zinc-400 hover:text-white transition-all">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-500">
              <th className="px-8 py-4">Campaign Name</th>
              <th className="px-8 py-4">Status</th>
              <th className="px-8 py-4">Budget</th>
              <th className="px-8 py-4">CPM</th>
              <th className="px-8 py-4">Impressions</th>
              <th className="px-8 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {campaigns.map((camp) => (
              <tr key={camp.id} className="hover:bg-white/5 transition-all group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-yellow/10 flex items-center justify-center text-brand-yellow">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold">{camp.name}</p>
                      <p className="text-xs text-zinc-500">{camp.start_date} - {camp.end_date}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    camp.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-zinc-500/10 text-zinc-500'
                  }`}>
                    {camp.status}
                  </span>
                </td>
                <td className="px-8 py-6 font-bold">₦{camp.budget?.toLocaleString()}</td>
                <td className="px-8 py-6 text-zinc-400">₦{camp.cpm_rate}</td>
                <td className="px-8 py-6 font-bold">{(Math.random() * 10000).toFixed(0)}</td>
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
  );

  const Analytics = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Users} label="Reach" value="1.2M" trend="+15%" />
        <StatCard icon={MousePointer2} label="CTR" value="2.4%" trend="+0.5%" />
        <StatCard icon={Clock} label="Avg. View" value="12s" trend="+2s" />
        <StatCard icon={Zap} label="Conversions" value="450" trend="+12%" />
      </div>
      <div className="glass-card p-8 h-[400px]">
        <h3 className="text-xl font-black uppercase tracking-tight mb-8">Detailed Performance</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
            <XAxis dataKey="name" stroke="#666" fontSize={12} />
            <YAxis stroke="#666" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333' }} />
            <Bar dataKey="impressions" fill="#FFD700" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const WalletView = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="glass-card p-10 bg-gradient-to-br from-brand-yellow/20 to-transparent border-brand-yellow/20">
        <div className="flex justify-between items-start mb-12">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Available Balance</p>
            <h2 className="text-6xl font-black tracking-tighter">₦{user?.wallet_balance?.toLocaleString()}</h2>
          </div>
          <div className="w-16 h-16 bg-brand-yellow text-brand-black rounded-2xl flex items-center justify-center">
            <Wallet className="w-8 h-8" />
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => { setWalletModalType('topup'); setIsWalletModalOpen(true); }}
            className="flex-1 bg-brand-yellow text-brand-black py-4 rounded-2xl font-black uppercase tracking-tight hover:scale-[1.02] transition-all"
          >
            Top Up Wallet
          </button>
          <button 
            onClick={() => { setWalletModalType('withdraw'); setIsWalletModalOpen(true); }}
            className="flex-1 bg-white/5 border border-white/10 py-4 rounded-2xl font-bold hover:bg-white/10 transition-all"
          >
            Withdraw Funds
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-lg font-black uppercase tracking-tight">Transaction History</h3>
        </div>
        <div className="divide-y divide-white/5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-6 flex items-center justify-between hover:bg-white/5 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold">Wallet Top-up</p>
                  <p className="text-xs text-zinc-500">March {20 - i}, 2026 • 14:30</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-green-500">+₦25,000</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Successful</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  const Overview = () => (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={TrendingUp} 
          label="Total Spend" 
          value={`₦${stats.totalSpend?.toLocaleString()}`} 
          trend="+12.5%" 
        />
        <StatCard 
          icon={Users} 
          label="Total Impressions" 
          value={stats.totalImpressions?.toLocaleString()} 
          trend="+8.2%" 
        />
        <StatCard 
          icon={Zap} 
          label="Active Campaigns" 
          value={stats.activeCampaigns} 
          trend="0" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black uppercase tracking-tight">Performance Over Time</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded-lg bg-brand-yellow text-brand-black text-xs font-bold">Impressions</button>
              <button className="px-3 py-1 rounded-lg bg-white/5 text-zinc-500 text-xs font-bold">Spend</button>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorImp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFD700" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FFD700" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333', borderRadius: '12px' }}
                  itemStyle={{ color: '#FFD700' }}
                />
                <Area type="monotone" dataKey="impressions" stroke="#FFD700" strokeWidth={3} fillOpacity={1} fill="url(#colorImp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-8 flex flex-col">
          <h3 className="text-xl font-black uppercase tracking-tight mb-8">Geofence Reach</h3>
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-40 h-40 rounded-full border-8 border-brand-yellow/20 border-t-brand-yellow flex items-center justify-center relative">
              <div className="text-center">
                <p className="text-3xl font-black">74%</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Ad Fill Rate</p>
              </div>
            </div>
            <div className="space-y-4 w-full">
              <ReachItem label="Ikeja" value="42%" color="bg-brand-yellow" />
              <ReachItem label="Lekki" value="28%" color="bg-brand-yellow/60" />
              <ReachItem label="VI" value="15%" color="bg-brand-yellow/30" />
            </div>
          </div>
        </div>
      </div>

      {/* Campaign List */}
      <div className="glass-card overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-xl font-black uppercase tracking-tight">Active Campaigns</h3>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search campaigns..." 
                className="bg-black border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-brand-yellow transition-all"
              />
            </div>
            <button className="p-2 bg-white/5 rounded-xl border border-white/10 text-zinc-400 hover:text-white transition-all">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                <th className="px-8 py-4">Campaign Name</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Budget</th>
                <th className="px-8 py-4">CPM</th>
                <th className="px-8 py-4">Impressions</th>
                <th className="px-8 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {campaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-white/5 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-yellow/10 flex items-center justify-center text-brand-yellow">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold">{camp.name}</p>
                        <p className="text-xs text-zinc-500">{camp.start_date} - {camp.end_date}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      camp.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-zinc-500/10 text-zinc-500'
                    }`}>
                      {camp.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 font-bold">₦{camp.budget?.toLocaleString()}</td>
                  <td className="px-8 py-6 text-zinc-400">₦{camp.cpm_rate}</td>
                  <td className="px-8 py-6 font-bold">{(Math.random() * 10000).toFixed(0)}</td>
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
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Advertiser Dashboard</h1>
          <p className="text-zinc-500 font-medium">Welcome back, {user?.full_name}. Here's your campaign overview.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/advertiser/wallet')}
            className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <Wallet className="w-5 h-5 text-brand-yellow" /> ₦{user?.wallet_balance?.toLocaleString()}
          </button>
          <button 
            onClick={() => setIsNewCampaignModalOpen(true)}
            className="bg-brand-yellow text-brand-black px-6 py-3 rounded-2xl font-black uppercase tracking-tight hover:scale-105 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> New Campaign
          </button>
        </div>
      </div>

      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/campaigns" element={<CampaignsList />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/wallet" element={<WalletView />} />
        <Route path="/map-search" element={<MapSearch />} />
      </Routes>

      <NewCampaignModal 
        isOpen={isNewCampaignModalOpen} 
        onClose={() => setIsNewCampaignModalOpen(false)}
        onSuccess={(newCamp) => setCampaigns([newCamp, ...campaigns])}
      />

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        type={walletModalType}
        onSuccess={handleWalletSuccess}
      />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, trend }: { icon: any, label: string, value: string, trend: string }) {
  return (
    <div className="glass-card p-8 group hover:border-brand-yellow/30 transition-all">
      <div className="flex items-start justify-between mb-6">
        <div className="w-12 h-12 bg-brand-yellow/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
          <Icon className="w-6 h-6 text-brand-yellow" />
        </div>
        <span className={`text-xs font-black uppercase tracking-widest ${trend.startsWith('+') ? 'text-green-500' : 'text-zinc-500'}`}>
          {trend}
        </span>
      </div>
      <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-black text-white">{value}</p>
    </div>
  );
}

function ReachItem({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
        <span>{label}</span>
        <span className="text-zinc-500">{value}</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: value }} />
      </div>
    </div>
  );
}
