import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Truck, 
  Megaphone, 
  Map as MapIcon, 
  Wallet, 
  BarChart3, 
  Settings, 
  Bell, 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  CheckCircle2, 
  XCircle, 
  Pause, 
  Play, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  Eye, 
  Clock,
  ChevronRight,
  UserCheck,
  UserX,
  Activity,
  Navigation,
  Plus,
  Info,
  Shield,
  LogOut,
  Zap,
  MapPin,
  ArrowUpRight
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import { searchWithAiMaps, MapGroundingResult } from '../services/geminiMapsService';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY' && API_KEY !== 'DUMMY_KEY';

// --- AI Maps Search Component ---
const AiMapsSearch = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<MapGroundingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    try {
      const data = await searchWithAiMaps(query);
      setResult(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4 mb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-yellow-400/10 text-yellow-400 rounded-xl">
          <Zap size={20} />
        </div>
        <h3 className="text-lg font-black tracking-tight">AI Fleet Intelligence</h3>
      </div>
      
      <div className="flex gap-2">
        <input 
          type="text" 
          placeholder="Ask about fleet distribution, traffic hotzones, or route efficiency..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1 bg-zinc-800 border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-yellow-400"
        />
        <button 
          onClick={handleSearch}
          disabled={isLoading}
          className="bg-yellow-400 text-black px-4 py-3 rounded-xl font-black text-sm hover:scale-105 transition-transform disabled:opacity-50"
        >
          {isLoading ? 'Thinking...' : 'Search'}
        </button>
      </div>

      {result && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 pt-4 border-t border-zinc-800"
        >
          <div className="text-sm text-zinc-300 leading-relaxed font-medium">
            {result.text}
          </div>
          
          {result.links.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Verified Locations</p>
              <div className="flex flex-wrap gap-2">
                {result.links.map((link, i) => (
                  <a 
                    key={i}
                    href={link.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-bold text-yellow-400 transition-colors border border-zinc-700"
                  >
                    <MapPin size={12} />
                    {link.title}
                    <ArrowUpRight size={12} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};
import api from '../services/api';

// --- Admin Map Component ---
const AdminMap = ({ drivers }: { drivers: any[] }) => {
  return (
    <div className="w-full h-full bg-zinc-950 rounded-3xl overflow-hidden border border-zinc-800">
      {hasValidKey ? (
        <Map
          defaultCenter={{ lat: 6.5244, lng: 3.3792 }}
          defaultZoom={11}
          mapId="ADMIN_DASHBOARD_MAP"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%' }}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
        >
          {drivers.map((driver: any) => (
            <AdvancedMarker
              key={driver.id}
              position={{ lat: driver.last_lat, lng: driver.last_lng }}
            >
              <Pin 
                background={driver.device_status === 'online' ? '#22c55e' : '#ef4444'} 
                glyphColor="#fff" 
                borderColor="white" 
              />
            </AdvancedMarker>
          ))}
        </Map>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-4 bg-zinc-900/50">
          <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500">
            <MapIcon size={32} />
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-black tracking-tight uppercase">Fleet Map Offline</h4>
            <p className="text-zinc-500 text-sm max-w-xs mx-auto uppercase font-bold">
              API key missing. Use AI search for fleet intelligence.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

interface AdminStats {
  metrics: {
    advertisers: number;
    drivers: number;
    campaigns: number;
    vehicles: number;
    revenueToday: number;
    pendingPayouts: number;
    totalImpressions: number;
  };
  revenueTrend: any[];
  routePerformance: any[];
}

interface Advertiser {
  id: number;
  name: string;
  email: string;
  subscription_tier: string;
  campaign_count: number;
  total_budget: number;
  created_at: string;
}

interface Driver {
  id: number;
  name: string;
  email: string;
  overall_score: number;
  rank_category: string;
  campaigns_accepted: number;
  balance: number;
  device_id: string;
  device_status: string;
  last_lat: number;
  last_lng: number;
}

interface Campaign {
  id: number;
  name: string;
  advertiser_name: string;
  route_name: string;
  status: string;
  budget: number;
  budget_remaining: number;
  total_impressions: number;
  total_minutes: number;
  created_at: string;
}

interface Notification {
  id: number;
  type: string;
  message: string;
  time: string;
}

// --- Components ---

const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
  <div className="bg-[#1A1A1A] border border-white/5 p-6 rounded-2xl">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-500`}>
        <Icon size={24} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-sm ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
          <TrendingUp size={14} className={trend < 0 ? 'rotate-180' : ''} />
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div className="text-white/50 text-sm mb-1">{title}</div>
    <div className="text-2xl font-bold text-white">{value}</div>
  </div>
);

const AdminPanel: React.FC<{ onLogout?: () => void }> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAdvertiser, setSelectedAdvertiser] = useState<Advertiser | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, adsRes, driversRes, campaignsRes, notifsRes] = await Promise.all([
        api.get('/admin/overview'),
        api.get('/admin/advertisers'),
        api.get('/admin/drivers'),
        api.get('/admin/campaigns'),
        api.get('/admin/notifications')
      ]);

      setStats(statsRes.data);
      setAdvertisers(adsRes.data);
      setDrivers(driversRes.data);
      setCampaigns(campaignsRes.data);
      setNotifications(notifsRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (type: 'users' | 'campaigns', id: number, status: string) => {
    try {
      await api.post(`/admin/${type}/${id}/status`, { status });
      fetchData();
    } catch (error) {
      console.error(`Error updating ${type} status:`, error);
    }
  };

  const renderOverview = () => {
    if (!stats) return null;

    return (
      <div className="space-y-6">
        {/* AI Maps Search Integration */}
        <AiMapsSearch />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Advertisers" 
            value={stats.metrics.advertisers} 
            icon={Users} 
            trend={12} 
            color="indigo" 
          />
          <StatCard 
            title="Active Drivers" 
            value={stats.metrics.drivers} 
            icon={Truck} 
            trend={8} 
            color="emerald" 
          />
          <StatCard 
            title="Active Campaigns" 
            value={stats.metrics.campaigns} 
            icon={Megaphone} 
            trend={-2} 
            color="amber" 
          />
          <StatCard 
            title="Total Ad Spend" 
            value={`₦${(stats.metrics.revenueToday * 30).toLocaleString()}`} 
            icon={DollarSign} 
            trend={15} 
            color="violet" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#1A1A1A] border border-white/5 p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-6">Revenue & Ad Spend Trend</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <AreaChart data={stats.revenueTrend}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#666" 
                    fontSize={12} 
                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                  />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#8B5CF6" 
                    fillOpacity={1} 
                    fill="url(#colorRev)" 
                    strokeWidth={2} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#1A1A1A] border border-white/5 p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {notifications.map((n) => (
                <div key={n.id} className="flex gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    n.type === 'subscription' ? 'bg-indigo-500/20 text-indigo-500' :
                    n.type === 'campaign' ? 'bg-amber-500/20 text-amber-500' :
                    n.type === 'alert' ? 'bg-rose-500/20 text-rose-500' :
                    'bg-emerald-500/20 text-emerald-500'
                  }`}>
                    {n.type === 'subscription' ? <Users size={14} /> :
                     n.type === 'campaign' ? <Megaphone size={14} /> :
                     n.type === 'alert' ? <AlertTriangle size={14} /> :
                     <DollarSign size={14} />}
                  </div>
                  <div>
                    <div className="text-xs text-white font-medium">{n.message}</div>
                    <div className="text-[10px] text-white/30 mt-1">{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-xs text-indigo-400 font-bold hover:bg-white/5 rounded-lg transition-all">
              View All Activity
            </button>
          </div>
        </div>

          <div className="bg-[#1A1A1A] border border-white/5 p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-6">Active Screens per Route</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={stats.routePerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                  <XAxis type="number" stroke="#666" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="#666" fontSize={10} width={120} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="active_screens" fill="#10B981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Platform Performance KPIs</h3>
            <div className="flex gap-4">
              <div className="text-right">
                <div className="text-[10px] text-white/30 uppercase font-bold tracking-wider">Total Impressions</div>
                <div className="text-sm font-bold text-white">{stats.metrics.totalImpressions.toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-white/30 uppercase font-bold tracking-wider">Avg. CPM</div>
                <div className="text-sm font-bold text-white">₦1,200</div>
              </div>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
              <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-500">
                <Activity size={20} />
              </div>
              <div>
                <div className="text-xs text-white/50">System Uptime</div>
                <div className="text-sm font-bold text-white">99.98%</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
              <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <div className="text-xs text-white/50">Ad Verification Rate</div>
                <div className="text-sm font-bold text-white">94.5%</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
              <div className="p-3 rounded-lg bg-amber-500/10 text-amber-500">
                <Clock size={20} />
              </div>
              <div>
                <div className="text-xs text-white/50">Avg. Playback Duration</div>
                <div className="text-sm font-bold text-white">6.4 hrs/day</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAdvertisers = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
          <input 
            type="text" 
            placeholder="Search advertisers..." 
            className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#1A1A1A] border border-white/10 text-white px-4 py-2 rounded-xl hover:bg-white/5 transition-colors">
            <Filter size={18} />
            Filter
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#1A1A1A] border border-white/10 text-white px-4 py-2 rounded-xl hover:bg-white/5 transition-colors">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-white/50 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-medium">Advertiser</th>
              <th className="px-6 py-4 font-medium">Subscription</th>
              <th className="px-6 py-4 font-medium">Campaigns</th>
              <th className="px-6 py-4 font-medium">Total Budget</th>
              <th className="px-6 py-4 font-medium">Joined</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {advertisers
              .filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.email.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((ad) => (
              <tr key={ad.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-500 font-bold">
                      {ad.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-white font-medium">{ad.name}</div>
                      <div className="text-white/30 text-xs">{ad.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                    ad.subscription_tier === 'enterprise' ? 'bg-violet-500/20 text-violet-500' :
                    ad.subscription_tier === 'growth' ? 'bg-emerald-500/20 text-emerald-500' :
                    ad.subscription_tier === 'suspended' ? 'bg-rose-500/20 text-rose-500' :
                    'bg-white/10 text-white/50'
                  }`}>
                    {ad.subscription_tier}
                  </span>
                </td>
                <td className="px-6 py-4 text-white/70">{ad.campaign_count}</td>
                <td className="px-6 py-4 text-white font-medium">₦{ad.total_budget?.toLocaleString() || 0}</td>
                <td className="px-6 py-4 text-white/30 text-sm">
                  {new Date(ad.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => updateStatus('users', ad.id, ad.subscription_tier === 'suspended' ? 'active' : 'suspended')}
                      className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${ad.subscription_tier === 'suspended' ? 'text-emerald-500' : 'text-rose-500'}`}
                      title={ad.subscription_tier === 'suspended' ? 'Approve' : 'Suspend'}
                    >
                      {ad.subscription_tier === 'suspended' ? <UserCheck size={18} /> : <UserX size={18} />}
                    </button>
                    <button 
                      onClick={() => setSelectedAdvertiser(ad)}
                      className="p-2 text-white/50 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Eye size={18} />
                    </button>
                    <button className="p-2 text-white/50 hover:bg-white/10 rounded-lg transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDrivers = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
          <input 
            type="text" 
            placeholder="Search drivers..." 
            className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#1A1A1A] border border-white/10 text-white px-4 py-2 rounded-xl hover:bg-white/5 transition-colors">
            <MapIcon size={18} />
            Live Map
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#1A1A1A] border border-white/10 text-white px-4 py-2 rounded-xl hover:bg-white/5 transition-colors">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-white/50 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-medium">Driver</th>
              <th className="px-6 py-4 font-medium">Score</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Wallet</th>
              <th className="px-6 py-4 font-medium">Campaigns</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {drivers
              .filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.device_id?.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((driver) => (
              <tr key={driver.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold">
                      {driver.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-white font-medium">{driver.name}</div>
                      <div className="text-white/30 text-xs">{driver.device_id || 'No Device'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-12 bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          driver.overall_score >= 90 ? 'bg-emerald-500' :
                          driver.overall_score >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${driver.overall_score}%` }}
                      />
                    </div>
                    <span className="text-white font-mono text-sm">{driver.overall_score}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${driver.device_status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-white/20'}`} />
                    <span className={`text-xs capitalize ${driver.device_status === 'online' ? 'text-emerald-500' : 'text-white/30'}`}>
                      {driver.device_status || 'offline'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-white font-medium">₦{driver.balance?.toLocaleString() || 0}</td>
                <td className="px-6 py-4 text-white/70">{driver.campaigns_accepted}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setSelectedDriver(driver)}
                      className="p-2 text-white/50 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Eye size={18} />
                    </button>
                    <button className="p-2 text-white/50 hover:bg-white/10 rounded-lg transition-colors">
                      <Navigation size={18} />
                    </button>
                    <button className="p-2 text-white/50 hover:bg-white/10 rounded-lg transition-colors">
                      <Activity size={18} />
                    </button>
                    <button className="p-2 text-white/50 hover:bg-white/10 rounded-lg transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCampaigns = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
          <input 
            type="text" 
            placeholder="Search campaigns..." 
            className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#1A1A1A] border border-white/10 text-white px-4 py-2 rounded-xl hover:bg-white/5 transition-colors">
            <Filter size={18} />
            Status
          </button>
        </div>
      </div>

      <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-white/50 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-medium">Campaign</th>
              <th className="px-6 py-4 font-medium">Advertiser</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Impressions</th>
              <th className="px-6 py-4 font-medium">Budget</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {campaigns
              .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.advertiser_name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((camp) => (
              <tr key={camp.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-white font-medium">{camp.name}</div>
                    <div className="text-white/30 text-xs flex items-center gap-1">
                      <MapIcon size={10} />
                      {camp.route_name}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-white/70">{camp.advertiser_name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                    camp.status === 'active' ? 'bg-emerald-500/20 text-emerald-500' :
                    camp.status === 'paused' ? 'bg-amber-500/20 text-amber-500' :
                    'bg-white/10 text-white/50'
                  }`}>
                    {camp.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-white font-mono">{camp.total_impressions?.toLocaleString() || 0}</div>
                  <div className="text-white/30 text-[10px]">{camp.total_minutes || 0} mins played</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-white font-medium">₦{camp.budget_remaining?.toLocaleString()}</div>
                  <div className="w-20 bg-white/5 h-1 rounded-full mt-1 overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${(camp.budget_remaining / camp.budget) * 100}%` }}
                    />
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => updateStatus('campaigns', camp.id, camp.status === 'active' ? 'paused' : 'active')}
                      className="p-2 text-white/50 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      {camp.status === 'active' ? <Pause size={18} /> : <Play size={18} />}
                    </button>
                    <button className="p-2 text-rose-500/50 hover:bg-rose-500/10 rounded-lg transition-colors">
                      <XCircle size={18} />
                    </button>
                    <button className="p-2 text-white/50 hover:bg-white/10 rounded-lg transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMonitoring = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#1A1A1A] border border-white/5 rounded-2xl overflow-hidden h-[600px] relative">
          {hasValidKey ? (
            <Map
              defaultCenter={{ lat: 6.5244, lng: 3.3792 }}
              defaultZoom={11}
              mapId="admin_fleet_map"
              className="w-full h-full"
            >
              {drivers.filter(d => d.device_status === 'online').map((d) => (
                <AdvancedMarker
                  key={d.id}
                  position={{ lat: d.last_lat || 6.5244, lng: d.last_lng || 3.3792 }}
                >
                  <Pin background={'#10B981'} borderColor={'#064E3B'} glyphColor={'#fff'} />
                </AdvancedMarker>
              ))}
            </Map>
          ) : (
            <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white/20 mb-4">
                <MapIcon size={32} />
              </div>
              <h3 className="text-white font-bold mb-2">Google Maps API Key Required</h3>
              <p className="text-white/40 text-sm max-w-xs mb-6">
                To enable live fleet tracking, please add your Google Maps Platform API key in the Secrets menu.
              </p>
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-left w-full max-w-md">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">How to configure:</p>
                <ol className="text-xs text-white/60 space-y-2 list-decimal ml-4">
                  <li>Go to Settings (⚙️) in the sidebar</li>
                  <li>Click on "Secrets"</li>
                  <li>Add a new secret: <code className="bg-white/10 px-1 rounded text-white">GOOGLE_MAPS_PLATFORM_KEY</code></li>
                </ol>
              </div>
            </div>
          )}
          
          <div className="absolute top-4 right-4 space-y-2 z-10">
            <div className="bg-rose-500/20 border border-rose-500/50 p-3 rounded-xl flex items-center gap-3 backdrop-blur-md">
              <AlertTriangle size={18} className="text-rose-500" />
              <div>
                <div className="text-xs font-bold text-white">Off-Route Alert</div>
                <div className="text-[10px] text-white/70">DF-2026-001 left Third Mainland</div>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-4 left-4 bg-[#1A1A1A]/80 backdrop-blur-md border border-white/10 p-4 rounded-xl z-10">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                <span className="text-xs text-white/70">Online</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-white/20 rounded-full" />
                <span className="text-xs text-white/70">Offline</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-rose-500 rounded-full" />
                <span className="text-xs text-white/70">Alert</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#1A1A1A] border border-white/5 p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">Route Insights</h3>
            <div className="space-y-4">
              {stats?.routePerformance.map((r: any, i: number) => (
                <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm font-medium text-white">{r.name}</div>
                    <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">High Density</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-white/50">
                    <div className="flex items-center gap-1">
                      <Truck size={12} />
                      {r.active_screens} Vehicles
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={12} />
                      ~4.5k/hr
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1A1A1A] border border-white/5 p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">System Health</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/50">Ad Server</span>
                <span className="text-xs text-emerald-500 font-bold">OPERATIONAL</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/50">GPS Gateway</span>
                <span className="text-xs text-emerald-500 font-bold">OPERATIONAL</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/50">Payment API</span>
                <span className="text-xs text-emerald-500 font-bold">OPERATIONAL</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white mb-2">Payments & Payouts</h2>
          <p className="text-white/50">Manage driver earnings and platform revenue settlements.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all">
          <Download size={18} /> Export Ledger
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
          <p className="text-xs font-black text-white/30 uppercase tracking-widest mb-2">Total Platform Revenue</p>
          <p className="text-4xl font-black text-white">₦12,450,000</p>
          <div className="mt-4 flex items-center gap-2 text-emerald-400 text-xs font-bold">
            <TrendingUp size={14} /> +12.5% from last month
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
          <p className="text-xs font-black text-white/30 uppercase tracking-widest mb-2">Pending Driver Payouts</p>
          <p className="text-4xl font-black text-amber-400">₦845,200</p>
          <div className="mt-4 text-white/30 text-xs">142 drivers awaiting settlement</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
          <p className="text-xs font-black text-white/30 uppercase tracking-widest mb-2">Settled This Week</p>
          <p className="text-4xl font-black text-emerald-400">₦2,100,000</p>
          <div className="mt-4 text-white/30 text-xs">Last settlement: 2 hours ago</div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden">
        <div className="p-8 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-xl font-bold">Eligible for Payout</h3>
          <button className="text-indigo-400 hover:text-indigo-300 text-sm font-bold">Process All Payouts</button>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-white/50 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-medium">Driver</th>
              <th className="px-6 py-4 font-medium">Bank Details</th>
              <th className="px-6 py-4 font-medium">Amount</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {[
              { name: 'Musa Ibrahim', bank: 'GTBank • 0123456789', amount: '45,000', status: 'Ready' },
              { name: 'Chidi Okafor', bank: 'Access • 9876543210', amount: '32,500', status: 'Ready' },
              { name: 'Babatunde Alabi', bank: 'Zenith • 1122334455', amount: '12,800', status: 'Ready' }
            ].map((p, i) => (
              <tr key={i} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-bold text-white">{p.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-white/50">{p.bank}</div>
                </td>
                <td className="px-6 py-4 font-mono font-bold text-white">₦{p.amount}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all">
                    Pay Now
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white mb-2">Platform Settings</h2>
          <p className="text-white/50">Configure global platform parameters and administrative controls.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Settings className="text-yellow-400" size={20} />
            General Configuration
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black text-white/30 uppercase tracking-widest mb-2">Platform Fee (%)</label>
              <input type="number" defaultValue="15" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="block text-xs font-black text-white/30 uppercase tracking-widest mb-2">Minimum Payout (₦)</label>
              <input type="number" defaultValue="5000" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="block text-xs font-black text-white/30 uppercase tracking-widest mb-2">Default CPM Rate (₦)</label>
              <input type="number" defaultValue="10" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Shield className="text-emerald-400" size={20} />
            Security & Access
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
              <div>
                <p className="font-bold">Two-Factor Authentication</p>
                <p className="text-xs text-white/40">Require 2FA for all admin accounts</p>
              </div>
              <div className="w-12 h-6 bg-emerald-500 rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
              <div>
                <p className="font-bold">Auto-Approve Advertisers</p>
                <p className="text-xs text-white/40">Skip manual review for new signups</p>
              </div>
              <div className="w-12 h-6 bg-white/10 rounded-full relative">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white/40 rounded-full" />
              </div>
            </div>
            <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold transition-colors">
              Manage Admin Roles
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );

    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'advertisers': return renderAdvertisers();
      case 'drivers': return renderDrivers();
      case 'campaigns': return renderCampaigns();
      case 'monitoring': return renderMonitoring();
      case 'payments': return renderPayments();
      case 'settings': return renderSettings();
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
      {/* Sidebar */}
      <div className="w-64 border-r border-white/5 flex flex-col fixed h-full bg-[#0A0A0A] z-20">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Truck className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">DanfoDrive</h1>
              <span className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest">Admin Panel</span>
            </div>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'advertisers', label: 'Advertisers', icon: Users },
              { id: 'drivers', label: 'Drivers', icon: Truck },
              { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
              { id: 'monitoring', label: 'Monitoring', icon: MapIcon },
              { id: 'payments', label: 'Payments', icon: Wallet },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === item.id 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-bold">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">Super Admin</div>
              <div className="text-white/30 text-[10px] truncate">admin@danfodrive.com</div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-white/30 hover:text-rose-500 transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Top Bar */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 sticky top-0 bg-[#0A0A0A]/80 backdrop-blur-xl z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white capitalize">{activeTab}</h2>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2 text-emerald-500 text-xs font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              System Live
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
              <div className="text-right">
                <div className="text-[10px] text-white/30 uppercase font-bold tracking-wider">Total Revenue</div>
                <div className="text-sm font-bold text-white">₦1,250,000</div>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="text-right">
                <div className="text-[10px] text-white/30 uppercase font-bold tracking-wider">Pending Payouts</div>
                <div className="text-sm font-bold text-amber-500">₦45,000</div>
              </div>
            </div>

            <div className="relative group">
              <button className="p-2 text-white/50 hover:text-white transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#0A0A0A]" />
              </button>
              
              <div className="absolute right-0 mt-2 w-80 bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                <div className="p-4 border-b border-white/5 font-bold text-white text-sm">Notifications</div>
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                      <div className="flex gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          n.type === 'subscription' ? 'bg-indigo-500/20 text-indigo-500' :
                          n.type === 'campaign' ? 'bg-amber-500/20 text-amber-500' :
                          n.type === 'alert' ? 'bg-rose-500/20 text-rose-500' :
                          'bg-emerald-500/20 text-emerald-500'
                        }`}>
                          {n.type === 'subscription' ? <Users size={16} /> :
                           n.type === 'campaign' ? <Megaphone size={16} /> :
                           n.type === 'alert' ? <AlertTriangle size={16} /> :
                           <DollarSign size={16} />}
                        </div>
                        <div>
                          <div className="text-xs text-white leading-relaxed">{n.message}</div>
                          <div className="text-[10px] text-white/30 mt-1">{n.time}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full p-3 text-xs text-indigo-400 font-medium hover:bg-white/5 transition-colors">
                  Clear All Notifications
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedAdvertiser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAdvertiser(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#1A1A1A] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-white/5 flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-500 text-2xl font-black">
                    {selectedAdvertiser.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">{selectedAdvertiser.name}</h3>
                    <p className="text-white/50 font-bold">{selectedAdvertiser.email}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedAdvertiser(null)}
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors text-white/30 hover:text-white"
                >
                  <XCircle size={24} />
                </button>
              </div>
              
              <div className="p-8 grid grid-cols-2 gap-6">
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Subscription</p>
                  <p className="text-lg font-bold text-white capitalize">{selectedAdvertiser.subscription_tier}</p>
                </div>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Active Campaigns</p>
                  <p className="text-lg font-bold text-white">{selectedAdvertiser.campaign_count}</p>
                </div>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Total Ad Spend</p>
                  <p className="text-lg font-bold text-emerald-400">₦{selectedAdvertiser.total_budget?.toLocaleString()}</p>
                </div>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Member Since</p>
                  <p className="text-lg font-bold text-white">{new Date(selectedAdvertiser.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="px-8 pb-8 flex gap-3">
                <button className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black transition-all">
                  Edit Profile
                </button>
                <button className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black transition-all">
                  View Campaigns
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {selectedDriver && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDriver(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#1A1A1A] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-white/5 flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 text-2xl font-black">
                    {selectedDriver.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">{selectedDriver.name}</h3>
                    <p className="text-white/50 font-bold">{selectedDriver.device_id || 'No Device Assigned'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedDriver(null)}
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors text-white/30 hover:text-white"
                >
                  <XCircle size={24} />
                </button>
              </div>
              
              <div className="p-8 grid grid-cols-2 gap-6">
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Performance Score</p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-white">{selectedDriver.overall_score}/100</p>
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{selectedDriver.rank_category}</span>
                  </div>
                </div>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Wallet Balance</p>
                  <p className="text-lg font-bold text-emerald-400">₦{selectedDriver.balance?.toLocaleString()}</p>
                </div>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Device Status</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${selectedDriver.device_status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-white/20'}`} />
                    <p className="text-lg font-bold text-white capitalize">{selectedDriver.device_status || 'offline'}</p>
                  </div>
                </div>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Campaigns Completed</p>
                  <p className="text-lg font-bold text-white">{selectedDriver.campaigns_accepted}</p>
                </div>
              </div>

              <div className="px-8 pb-8 flex gap-3">
                <button className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black transition-all">
                  Track Location
                </button>
                <button className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black transition-all">
                  Payout History
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPanel;
