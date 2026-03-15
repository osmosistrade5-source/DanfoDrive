import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Megaphone, Wallet, History, 
  TrendingUp, ArrowUpRight, ShieldCheck, CreditCard, Zap,
  BarChart3, Settings, LogOut, Bell, Search, Filter,
  Play, Pause, Edit3, Trash2, CheckCircle2, AlertCircle,
  Truck, Users, Timer, DollarSign, Lock, Activity,
  ChevronRight, MapPin, Clock, Calendar, Building2,
  Menu, X, ChevronDown, MoreVertical
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

// --- Mock Data ---
const earningsTrendData = [
  { name: 'Mon', val: 2500 },
  { name: 'Tue', val: 3200 },
  { name: 'Wed', val: 2800 },
  { name: 'Thu', val: 4100 },
  { name: 'Fri', val: 4500 },
  { name: 'Sat', val: 3800 },
  { name: 'Sun', val: 5200 },
];

// --- Sub-Components ---

const StatCard = ({ label, value, icon: Icon, trend, color = "yellow", onClick }: any) => (
  <div 
    onClick={onClick}
    className={`bg-zinc-900 border border-zinc-800 p-6 rounded-2xl transition-all ${onClick ? 'cursor-pointer hover:border-zinc-700 hover:scale-[1.02] active:scale-[0.98]' : ''}`}
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 bg-zinc-800 rounded-lg text-${color}-400`}>
        <Icon size={24} />
      </div>
      {trend && (
        <span className={`text-xs font-medium text-${color}-400 bg-${color}-400/10 px-2 py-1 rounded-full`}>
          {trend}
        </span>
      )}
    </div>
    <h3 className="text-zinc-400 text-sm font-medium mb-1">{label}</h3>
    <p className="text-2xl font-bold text-zinc-100">{value}</p>
  </div>
);

const DRIVER_ID = 2;

export const DriverPortal = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [activeCampaigns, setActiveCampaigns] = useState<any[]>([]);
  const [earningsHistory, setEarningsHistory] = useState<any[]>([]);
  const [payoutHistory, setPayoutHistory] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any>(null);
  const [performanceHistory, setPerformanceHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const fetchDriverData = async () => {
    try {
      const [statsRes, requestsRes, activeRes, earningsRes, payoutsRes, devicesRes, performanceRes] = await Promise.all([
        fetch(`/api/driver/stats/${DRIVER_ID}`),
        fetch(`/api/driver/campaign-requests/${DRIVER_ID}`),
        fetch(`/api/driver/active-campaigns/${DRIVER_ID}`),
        fetch(`/api/driver/earnings-history/${DRIVER_ID}`),
        fetch(`/api/driver/payout-history/${DRIVER_ID}`),
        fetch(`/api/driver/devices/${DRIVER_ID}`),
        fetch(`/api/driver/performance/${DRIVER_ID}`)
      ]);

      setStats(await statsRes.json());
      setRequests(await requestsRes.json());
      setActiveCampaigns(await activeRes.json());
      setEarningsHistory(await earningsRes.json());
      setPayoutHistory(await payoutsRes.json());
      setDevices(await devicesRes.json());
      const perfData = await performanceRes.json();
      setPerformance(perfData.performance);
      setPerformanceHistory(perfData.history);
    } catch (err) {
      console.error("Failed to fetch driver data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriverData();
  }, []);

  const handleAcceptCampaign = async (campaignId: number) => {
    try {
      const res = await fetch('/api/driver/accept-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: DRIVER_ID, campaignId })
      });
      if (res.ok) fetchDriverData();
    } catch (err) {
      console.error("Failed to accept campaign", err);
    }
  };

  const handleRejectCampaign = async (campaignId: number) => {
    // For demo, we just filter it out locally or we could have a backend endpoint
    // Let's assume we just want to remove it from the list for now
    setRequests(prev => prev.filter(r => r.id !== campaignId));
  };

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!withdrawAmount || isWithdrawing) return;
    
    if (amount < (stats?.minPayoutThreshold || 5000)) {
      alert(`Minimum withdrawal amount is ₦${(stats?.minPayoutThreshold || 5000).toLocaleString()}`);
      return;
    }

    setIsWithdrawing(true);
    try {
      const res = await fetch('/api/driver/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: DRIVER_ID, 
          amount: amount,
          bankName: 'OPay Digital Bank',
          accountNumber: '8123456789'
        })
      });
      if (res.ok) {
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        fetchDriverData();
      } else {
        const data = await res.json();
        alert(data.error || "Withdrawal failed");
      }
    } catch (err) {
      console.error("Failed to withdraw", err);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'performance', label: 'Performance', icon: ShieldCheck },
    { id: 'requests', label: 'Campaign Requests', icon: Megaphone, badge: requests.length },
    { id: 'active', label: 'Active Campaigns', icon: Play },
    { id: 'earnings', label: 'Earnings Tracker', icon: BarChart3 },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'history', label: 'Payout History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Wallet Balance" 
          value={`₦${(stats?.balance || 0).toLocaleString()}`} 
          icon={Wallet} 
          color="emerald" 
          onClick={() => setActiveTab('wallet')}
        />
        <StatCard label="Performance Score" value={`${performance?.overall_score || 0}/100`} icon={ShieldCheck} trend={performance?.rank_category} color="yellow" />
        <StatCard label="Active Campaigns" value={stats?.activeCampaigns || 0} icon={Play} onClick={() => setActiveTab('active')} />
        <StatCard label="Mins Played Today" value={`${stats?.todayMinutes || 0}m`} icon={Timer} onClick={() => setActiveTab('earnings')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <h2 className="text-xl font-bold mb-6">Currently Running</h2>
            {activeCampaigns.length > 0 ? (
              <div className="flex items-center justify-between p-6 bg-zinc-800/50 rounded-2xl border border-zinc-700">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center text-black">
                    <Activity size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{activeCampaigns[0].name}</h3>
                    <p className="text-zinc-400 text-sm">{activeCampaigns[0].brand_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-yellow-400 font-bold">₦10/min</p>
                  <p className="text-zinc-500 text-xs">{activeCampaigns[0].minutes_today || 0}m played today</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-zinc-500">
                <p>No active campaigns running right now.</p>
                <button onClick={() => setActiveTab('requests')} className="mt-4 text-yellow-400 font-bold hover:underline">View Requests</button>
              </div>
            )}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <h2 className="text-xl font-bold mb-6">Today's Ad Schedule</h2>
            <div className="space-y-4">
              {['08:00 - 10:00', '12:00 - 14:00', '17:00 - 19:00'].map((time, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-xl border border-zinc-800">
                  <div className="flex items-center gap-3">
                    <Clock size={18} className="text-zinc-500" />
                    <span className="font-medium">{time}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full uppercase">Scheduled</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <h2 className="text-xl font-bold mb-6">Device Status</h2>
            <div className="space-y-6">
              {devices.map((dev, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${dev.status === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
                    <div>
                      <p className="font-bold text-sm">{dev.vehicle_reg}</p>
                      <p className="text-zinc-500 text-xs">{dev.vehicle_type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{dev.status}</p>
                    <p className="text-[10px] text-zinc-500 flex items-center gap-1 justify-end">
                      <MapPin size={10} /> GPS Active
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Performance Score</h2>
          <p className="text-zinc-500 font-bold">Your reliability rating based on platform signals</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-black text-yellow-400">{performance?.overall_score || 0}/100</p>
          <p className="text-xs font-black uppercase tracking-widest text-zinc-500">{performance?.rank_category || 'Average'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold mb-8 text-zinc-100">Score Breakdown</h3>
            <div className="space-y-8">
              {[
                { label: 'Ad Playback Completion', val: performance?.playback_score, weight: '40%', icon: Timer },
                { label: 'Route Compliance', val: performance?.compliance_score, weight: '25%', icon: MapPin },
                { label: 'Screen Uptime', val: performance?.uptime_score, weight: '20%', icon: Activity },
                { label: 'Campaign Acceptance', val: performance?.acceptance_score, weight: '10%', icon: CheckCircle2 },
                { label: 'Driver Rating', val: performance?.rating_score, weight: '5%', icon: Users },
              ].map((item, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <item.icon size={18} className="text-zinc-500" />
                      <span className="font-bold text-zinc-300">{item.label}</span>
                      <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Weight: {item.weight}</span>
                    </div>
                    <span className="font-black text-zinc-100">{item.val}%</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.val}%` }}
                      className={`h-full ${item.val > 90 ? 'bg-emerald-400' : item.val > 70 ? 'bg-yellow-400' : 'bg-red-400'}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold mb-8 text-zinc-100">Score History</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceHistory.map(h => ({ name: new Date(h.date).toLocaleDateString('en-US', { weekday: 'short' }), val: h.score }))}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                    itemStyle={{ color: '#fbbf24', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="val" stroke="#fbbf24" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold mb-6 text-zinc-100">Improvement Tips</h3>
            <div className="space-y-6">
              {[
                { title: 'Stay on Route', desc: 'Ensure you follow the assigned campaign route to maximize compliance score.', icon: MapPin, action: () => setActiveTab('active') },
                { title: 'Device Connectivity', desc: 'Keep your device powered and connected to the internet during active hours.', icon: Zap, action: () => setActiveTab('settings') },
                { title: 'Accept More Requests', desc: 'Accepting more campaigns improves your acceptance rate and visibility.', icon: Megaphone, action: () => setActiveTab('requests') },
              ].map((tip, i) => (
                <div key={i} className="flex gap-4 group cursor-pointer" onClick={tip.action}>
                  <div className="w-10 h-10 bg-zinc-800 rounded-xl flex-shrink-0 flex items-center justify-center text-yellow-400 group-hover:bg-yellow-400 group-hover:text-black transition-colors">
                    <tip.icon size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-zinc-100 group-hover:text-yellow-400 transition-colors">{tip.title}</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed mt-1">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="text-yellow-400" />
              <h3 className="text-lg font-bold text-yellow-400">Elite Status</h3>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6">
              Elite drivers are prioritized for high-budget campaigns and receive faster payout processing. Maintain a score above 90 to keep this status.
            </p>
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-zinc-500">
              <span>Next Goal</span>
              <span className="text-yellow-400">Top 5% in Lagos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRequests = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black tracking-tight">Campaign Requests</h2>
        <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-black">{requests.length} New</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {requests.map((req) => (
          <div key={req.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col">
            <div className="p-8 flex-1">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-black mb-1">{req.name}</h3>
                  <p className="text-zinc-400 font-bold">{req.brand_name}</p>
                </div>
                <div className="bg-emerald-400/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-black">
                  ₦10/min
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Route</p>
                  <p className="font-bold text-sm flex items-center gap-1"><MapPin size={14} className="text-yellow-400" /> {req.route_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Ad Duration</p>
                  <p className="font-bold text-sm flex items-center gap-1"><Timer size={14} className="text-yellow-400" /> 15s</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Schedule</p>
                  <p className="font-bold text-sm flex items-center gap-1"><Clock size={14} className="text-yellow-400" /> Peak Hours</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Est. Daily</p>
                  <p className="font-bold text-sm flex items-center gap-1 text-emerald-400">₦3,600</p>
                </div>
              </div>

              <div className="p-4 bg-zinc-800/50 rounded-2xl border border-zinc-700 mb-8">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-zinc-400">Drivers Needed</span>
                  <span className="text-white font-bold">12 / {req.drivers_count}</span>
                </div>
                <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400" style={{ width: '60%' }} />
                </div>
              </div>
            </div>

            <div className="p-6 bg-zinc-800/30 border-t border-zinc-800 flex gap-4">
              <button 
                onClick={() => handleAcceptCampaign(req.id)}
                className="flex-1 bg-yellow-400 text-black py-3 rounded-xl font-black hover:scale-[1.02] transition-transform"
              >
                Accept Campaign
              </button>
              <button 
                onClick={() => handleRejectCampaign(req.id)}
                className="flex-1 bg-zinc-800 text-white py-3 rounded-xl font-black hover:bg-zinc-700 transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
        {requests.length === 0 && (
          <div className="col-span-2 py-24 text-center bg-zinc-900/50 border border-dashed border-zinc-800 rounded-3xl">
            <Megaphone size={48} className="mx-auto mb-4 text-zinc-700" />
            <p className="text-zinc-500 font-bold">No new campaign requests for your route.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderActive = () => (
    <div className="space-y-8">
      <h2 className="text-3xl font-black tracking-tight">Active Campaigns</h2>
      <div className="grid grid-cols-1 gap-6">
        {activeCampaigns.map((camp) => (
          <div key={camp.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <div className="flex flex-wrap justify-between items-start gap-6 mb-8">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center text-black">
                  <Activity size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black">{camp.name}</h3>
                  <p className="text-zinc-400 font-bold">{camp.brand_name}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs font-bold text-zinc-500 flex items-center gap-1"><MapPin size={12} /> {camp.route_name}</span>
                    <span className="text-xs font-bold text-zinc-500 flex items-center gap-1"><Clock size={12} /> Peak Hours</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-8">
                <div className="text-center">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Mins Today</p>
                  <p className="text-xl font-black">{camp.minutes_today || 0}m</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Earnings Today</p>
                  <p className="text-xl font-black text-emerald-400">₦{(camp.earnings_today || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-emerald-400">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">Device Status</p>
                  <p className="text-sm font-bold">Online & Active</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-yellow-400">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">GPS Tracking</p>
                  <p className="text-sm font-bold">Live on Route</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400">
                  <Timer size={20} />
                </div>
                <div>
                  <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">Ad Duration</p>
                  <p className="text-sm font-bold">15 Seconds</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEarnings = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black tracking-tight">Earnings Tracker</h2>
        <button 
          onClick={() => setActiveTab('wallet')}
          className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors"
        >
          View Wallet
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Minutes Today" value={`${stats?.todayMinutes || 0}m`} icon={Timer} onClick={() => setActiveTab('active')} />
        <StatCard label="Pay Per Minute" value="₦10" icon={DollarSign} />
        <StatCard label="Today's Earnings" value={`₦${(stats?.todayEarnings || 0).toLocaleString()}`} icon={TrendingUp} color="emerald" onClick={() => setActiveTab('wallet')} />
        <StatCard label="Total Lifetime" value="₦184,500" icon={ShieldCheck} />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
        <h3 className="text-xl font-bold mb-8">Earnings Trend</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={earningsTrendData}>
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₦${v}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                itemStyle={{ color: '#fbbf24', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="val" stroke="#fbbf24" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
        <h3 className="text-xl font-bold mb-6">Daily Breakdown</h3>
        <div className="space-y-4">
          {earningsHistory.map((day, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-500">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="font-bold">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                  <p className="text-zinc-500 text-xs">{day.minutes} minutes played</p>
                </div>
              </div>
              <p className="text-lg font-black text-emerald-400">₦{day.earnings.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderWallet = () => {
    const balance = stats?.balance || 0;
    const pending = stats?.pendingBalance || 0;
    const threshold = stats?.minPayoutThreshold || 5000;
    const progress = Math.min((balance / threshold) * 100, 100);
    const isThresholdReached = balance >= threshold;

    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-black tracking-tight">Wallet</h2>
          {isThresholdReached ? (
            <div className="flex items-center gap-2 bg-emerald-400/10 text-emerald-400 px-4 py-2 rounded-xl border border-emerald-400/20">
              <CheckCircle2 size={18} />
              <span className="text-sm font-bold uppercase tracking-widest">Payout Threshold Reached</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-yellow-400/10 text-yellow-400 px-4 py-2 rounded-xl border border-yellow-400/20">
              <AlertCircle size={18} />
              <span className="text-sm font-bold uppercase tracking-widest">₦{(threshold - balance).toLocaleString()} more to withdraw</span>
            </div>
          )}
        </div>
        
        <div className="bg-yellow-400 rounded-[2.5rem] p-12 text-black relative overflow-hidden shadow-2xl shadow-yellow-400/20">
          <div className="relative z-10">
            <p className="text-xs font-black uppercase tracking-[0.2em] opacity-60 mb-4">Available Balance</p>
            <h2 className="text-7xl font-black tracking-tighter mb-12">₦{balance.toLocaleString()}</h2>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => setShowWithdrawModal(true)}
                disabled={!isThresholdReached}
                className={`px-10 py-5 rounded-2xl font-black text-lg flex items-center gap-2 transition-all ${
                  isThresholdReached 
                    ? 'bg-black text-white hover:scale-105' 
                    : 'bg-black/20 text-black/40 cursor-not-allowed'
                }`}
              >
                {isThresholdReached ? 'Withdraw Funds' : 'Threshold Not Reached'} <ArrowUpRight size={24} />
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className="bg-white/20 backdrop-blur-md text-black px-10 py-5 rounded-2xl font-black text-lg hover:bg-white/30 transition-colors"
              >
                Transaction History
              </button>
            </div>
          </div>
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Wallet size={240} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl">
            <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-2">Pending Earnings</p>
            <p className="text-3xl font-black">₦{pending.toLocaleString()}</p>
            <p className="text-zinc-500 text-xs mt-4 flex items-center gap-1">
              <Clock size={12} /> Settles at 11:59 PM tonight
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl md:col-span-2">
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-1">Payout Threshold Progress</p>
                <p className="text-xl font-black">₦{balance.toLocaleString()} / ₦{threshold.toLocaleString()}</p>
              </div>
              <span className="text-xs font-black text-zinc-500">{Math.round(progress)}%</span>
            </div>
            <div className="h-4 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className={`h-full transition-colors ${isThresholdReached ? 'bg-emerald-400' : 'bg-yellow-400'}`}
              />
            </div>
            <p className="text-zinc-500 text-[10px] mt-4 uppercase tracking-widest font-bold">
              Minimum payout threshold is required to prevent high transaction fees.
            </p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl">
          <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-2">Total Paid Out</p>
          <p className="text-3xl font-black">₦{(stats?.totalPaid || 0).toLocaleString()}</p>
          <p className="text-zinc-500 text-xs mt-4 flex items-center gap-1">
            <CheckCircle2 size={12} className="text-emerald-400" /> Across 12 successful payouts
          </p>
        </div>
      </div>
    );
  };

  const renderHistory = () => (
    <div className="space-y-8">
      <h2 className="text-3xl font-black tracking-tight">Payout History</h2>
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-zinc-500 text-[10px] font-black uppercase tracking-widest border-b border-zinc-800">
              <th className="px-8 py-6">Date</th>
              <th className="px-8 py-6">Reference</th>
              <th className="px-8 py-6">Amount</th>
              <th className="px-8 py-6">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {payoutHistory.map((p, i) => (
              <tr key={i} className="hover:bg-zinc-800/30 transition-colors">
                <td className="px-8 py-6">
                  <p className="font-bold text-sm">{new Date(p.created_at || p.timestamp).toLocaleDateString()}</p>
                  <p className="text-zinc-500 text-xs">{new Date(p.created_at || p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </td>
                <td className="px-8 py-6">
                  <p className="font-bold text-sm">Withdrawal to {p.bank_name}</p>
                  <p className="text-zinc-500 text-xs">Acc: {p.account_number}</p>
                </td>
                <td className="px-8 py-6 font-black text-zinc-100">₦{p.amount.toLocaleString()}</td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    p.status === 'paid' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-yellow-400/10 text-yellow-400'
                  }`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
            {payoutHistory.length === 0 && (
              <tr>
                <td colSpan={4} className="px-8 py-12 text-center text-zinc-500">No payout history found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-8">
      <h2 className="text-3xl font-black tracking-tight">Settings</h2>
      <div className="max-w-2xl space-y-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <h3 className="text-xl font-bold mb-6">Profile Information</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-2 block">Full Name</label>
                <input type="text" defaultValue="Emeka Nwosu" className="w-full bg-zinc-800 border-none rounded-xl p-3 text-sm font-bold" />
              </div>
              <div>
                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-2 block">Phone Number</label>
                <input type="text" defaultValue="+234 812 345 6789" className="w-full bg-zinc-800 border-none rounded-xl p-3 text-sm font-bold" />
              </div>
            </div>
            <div>
              <label className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-2 block">Email Address</label>
              <input type="email" defaultValue="driver@example.com" className="w-full bg-zinc-800 border-none rounded-xl p-3 text-sm font-bold" />
            </div>
            <button 
              onClick={() => alert('Profile changes saved successfully!')}
              className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-black text-sm hover:scale-[1.02] transition-transform"
            >
              Save Changes
            </button>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <h3 className="text-xl font-bold mb-6">Payout Settings</h3>
          <div className="space-y-6">
            <div className="p-6 bg-zinc-800/50 rounded-2xl border border-zinc-700 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-500">
                  <Building2 size={24} />
                </div>
                <div>
                  <p className="font-bold">OPay Digital Bank</p>
                  <p className="text-zinc-500 text-xs">8123456789 • Emeka N.</p>
                </div>
              </div>
              <button 
                onClick={() => alert('Bank details editing is currently disabled in demo mode.')}
                className="text-yellow-400 font-bold text-sm hover:underline"
              >
                Edit
              </button>
            </div>
            <button 
              onClick={() => alert('Bank account addition is currently disabled in demo mode.')}
              className="w-full py-4 border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-500 font-bold hover:border-yellow-400/50 hover:text-yellow-400 transition-all"
            >
              + Add New Bank Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Activity className="text-yellow-400 animate-spin" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col w-72 bg-zinc-900 border-r border-zinc-800 transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full w-0'}`}>
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-black font-black text-xl shadow-lg shadow-yellow-400/20">D</div>
            <span className="text-2xl font-black tracking-tighter">DANFODRIVE</span>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all ${
                  activeTab === item.id ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/10' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    activeTab === item.id ? 'bg-black text-yellow-400' : 'bg-yellow-400 text-black'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-zinc-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
              <Users size={20} />
            </div>
            <div>
              <p className="text-sm font-bold">Emeka Nwosu</p>
              <p className="text-xs text-zinc-500">Verified Driver</p>
            </div>
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 font-bold hover:text-red-400 transition-colors">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 bg-black/80 backdrop-blur-md border-b border-zinc-900 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden lg:block text-zinc-500 hover:text-white">
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold capitalize">{activeTab.replace('-', ' ')}</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input type="text" placeholder="Search..." className="bg-zinc-900 border-none rounded-xl pl-10 pr-4 py-2 text-sm w-64 focus:ring-2 focus:ring-yellow-400" />
            </div>
            <button className="relative text-zinc-500 hover:text-white">
              <Bell size={22} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full border-2 border-black" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'performance' && renderPerformance()}
              {activeTab === 'requests' && renderRequests()}
              {activeTab === 'active' && renderActive()}
              {activeTab === 'earnings' && renderEarnings()}
              {activeTab === 'wallet' && renderWallet()}
              {activeTab === 'history' && renderHistory()}
              {activeTab === 'settings' && renderSettings()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 w-full bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-800 px-4 py-3 flex justify-around items-center z-50">
        {menuItems.slice(0, 6).map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 ${activeTab === item.id ? 'text-yellow-400' : 'text-zinc-500'}`}
          >
            <item.icon size={18} />
            <span className="text-[8px] font-bold uppercase">{item.label.split(' ')[0]}</span>
          </button>
        ))}
      </nav>

      {/* Withdraw Modal */}
      <AnimatePresence>
        {showWithdrawModal && (
          <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 w-full max-w-md rounded-[2.5rem] p-10 border border-zinc-800"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black">Withdraw Funds</h2>
                <button onClick={() => setShowWithdrawModal(false)} className="text-zinc-500 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-8">
                <div>
                  <label className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-3 block">Withdrawal Amount (₦)</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-zinc-500">₦</span>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full bg-zinc-800 border-none rounded-2xl p-6 pl-12 text-3xl font-black focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div className="flex justify-between mt-3">
                    <p className="text-xs text-zinc-500">Available: ₦{(stats?.balance || 0).toLocaleString()}</p>
                    <p className="text-xs text-zinc-500">Min: ₦{(stats?.minPayoutThreshold || 5000).toLocaleString()}</p>
                  </div>
                  {parseFloat(withdrawAmount) < (stats?.minPayoutThreshold || 5000) && withdrawAmount !== '' && (
                    <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest mt-2 flex items-center gap-1">
                      <AlertCircle size={10} /> Amount below minimum threshold
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-3 block">Destination Bank</label>
                  <div className="p-5 bg-zinc-800 rounded-2xl border border-zinc-700 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-500">
                        <Building2 size={24} />
                      </div>
                      <div>
                        <p className="font-bold">OPay Digital Bank</p>
                        <p className="text-zinc-500 text-xs">8123456789 • Emeka N.</p>
                      </div>
                    </div>
                    <CheckCircle2 size={20} className="text-yellow-400" />
                  </div>
                </div>

                <div className="pt-4 space-y-4">
                  <button 
                    onClick={handleWithdraw}
                    disabled={isWithdrawing || !withdrawAmount}
                    className="w-full bg-yellow-400 text-black py-5 rounded-2xl font-black text-lg shadow-lg shadow-yellow-400/10 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {isWithdrawing ? 'Processing...' : 'Confirm Withdrawal'}
                  </button>
                  <p className="text-center text-[10px] text-zinc-500 uppercase font-black tracking-widest">
                    Funds typically arrive within 15 minutes
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
