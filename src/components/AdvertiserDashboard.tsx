import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Megaphone, Wallet, History, Plus, 
  Upload, MapPin, Clock, ChevronRight, Eye, QrCode, 
  TrendingUp, ArrowUpRight, ShieldCheck, CreditCard, Zap
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

const StatCard = ({ label, value, icon: Icon, trend }: any) => (
  <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-zinc-800 rounded-lg text-yellow-400">
        <Icon size={24} />
      </div>
      {trend && (
        <span className="text-xs font-medium text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full">
          {trend}
        </span>
      )}
    </div>
    <h3 className="text-zinc-400 text-sm font-medium mb-1">{label}</h3>
    <p className="text-2xl font-bold text-zinc-100">{value}</p>
  </div>
);

export const AdvertiserDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showWizard, setShowWizard] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [proofOfPlay, setProofOfPlay] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/campaigns').then(res => res.json()).then(setCampaigns);
    fetch('/api/proof-of-play').then(res => res.json()).then(setProofOfPlay);
  }, []);

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Spend" value="₦450,000" icon={Wallet} trend="+5.2%" />
        <StatCard label="Impressions" value="1.2M" icon={Eye} trend="+12.5%" />
        <StatCard label="Active Screens" value="42" icon={ShieldCheck} />
        <StatCard label="Avg. CPM" value="₦50" icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold">Impressions Trend</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-zinc-800 rounded-lg text-xs font-bold">7D</button>
              <button className="px-3 py-1 text-zinc-500 text-xs font-bold">30D</button>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { name: 'Mar 04', val: 120000 },
                { name: 'Mar 05', val: 150000 },
                { name: 'Mar 06', val: 110000 },
                { name: 'Mar 07', val: 180000 },
                { name: 'Mar 08', val: 210000 },
                { name: 'Mar 09', val: 190000 },
                { name: 'Mar 10', val: 240000 },
              ]}>
                <defs>
                  <linearGradient id="colorImp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#facc15" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#facc15" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="val" stroke="#facc15" fillOpacity={1} fill="url(#colorImp)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <h2 className="text-xl font-bold mb-6">Recent Campaigns</h2>
          <div className="space-y-4">
            {campaigns.slice(0, 4).map((c, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-2xl border border-zinc-800">
                <div>
                  <p className="font-bold text-sm">{c.name}</p>
                  <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-black mt-1">₦{c.budget.toLocaleString()} • {c.status}</p>
                </div>
                <ChevronRight size={16} className="text-zinc-600" />
              </div>
            ))}
          </div>
          <button 
            onClick={() => setActiveTab('campaigns')}
            className="w-full mt-6 py-3 text-sm font-bold text-yellow-400 hover:text-yellow-300 transition-colors"
          >
            View All Campaigns
          </button>
        </div>
      </div>
    </div>
  );

  const renderWizard = () => (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="p-8 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-2xl font-black tracking-tight">Create Campaign</h2>
          <button onClick={() => setShowWizard(false)} className="text-zinc-500 hover:text-white">✕</button>
        </div>
        
        <div className="p-8 space-y-8">
          <div className="space-y-4">
            <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Step 1: Upload Creative</label>
            <div className="border-2 border-dashed border-zinc-800 rounded-2xl p-12 text-center hover:border-yellow-400/50 transition-colors cursor-pointer">
              <Upload size={48} className="mx-auto mb-4 text-zinc-600" />
              <p className="font-bold">Drop your ad asset here</p>
              <p className="text-zinc-500 text-sm mt-1">MP4 or JPG (1920x1080 recommended)</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Step 2: Select Geofences</label>
            <div className="grid grid-cols-3 gap-3">
              {['Ikeja', 'Lekki', 'Victoria Island', 'Surulere', 'Yaba', 'Oshodi'].map(area => (
                <button key={area} className="px-4 py-3 bg-zinc-800 rounded-xl text-sm font-bold hover:bg-yellow-400 hover:text-black transition-colors">
                  {area}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Step 3: Schedule</label>
            <div className="flex gap-4">
              <button className="flex-1 p-4 bg-yellow-400 text-black rounded-2xl font-black flex flex-col items-center gap-2">
                <Clock size={24} />
                Morning Rush
              </button>
              <button className="flex-1 p-4 bg-zinc-800 rounded-2xl font-black flex flex-col items-center gap-2">
                <Zap size={24} />
                All Day
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 bg-zinc-800/50 border-t border-zinc-800 flex justify-end gap-4">
          <button onClick={() => setShowWizard(false)} className="px-6 py-3 font-bold text-zinc-400">Cancel</button>
          <button className="px-8 py-3 bg-yellow-400 text-black rounded-xl font-black">Launch Campaign</button>
        </div>
      </motion.div>
    </div>
  );

  const renderProofOfPlay = () => (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
      <div className="p-8 border-b border-zinc-800">
        <h2 className="text-xl font-bold">Real-Time Proof of Play</h2>
        <p className="text-zinc-500 text-sm mt-1">Live logs of every impression served across the network.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-zinc-800/50 text-zinc-500 text-[10px] uppercase font-black tracking-widest">
            <tr>
              <th className="px-8 py-4">Timestamp</th>
              <th className="px-8 py-4">Vehicle ID</th>
              <th className="px-8 py-4">Campaign</th>
              <th className="px-8 py-4">Location</th>
              <th className="px-8 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {proofOfPlay.map((log, i) => (
              <tr key={i} className="hover:bg-zinc-800/30 transition-colors">
                <td className="px-8 py-4 text-sm font-mono text-zinc-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                <td className="px-8 py-4 text-sm font-bold">{log.vehicle_reg}</td>
                <td className="px-8 py-4 text-sm">{log.campaign_name}</td>
                <td className="px-8 py-4 text-sm text-zinc-500">{log.lat.toFixed(4)}, {log.lng.toFixed(4)}</td>
                <td className="px-8 py-4">
                  <span className="px-2 py-1 bg-yellow-400/10 text-yellow-400 text-[10px] font-black uppercase rounded-full border border-yellow-400/20">
                    Confirmed
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderWallet = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10">
        <h2 className="text-2xl font-bold mb-8">Wallet Balance</h2>
        <div className="p-8 bg-yellow-400 rounded-3xl text-black mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-sm font-black uppercase tracking-widest opacity-60 mb-2">Current Balance</p>
            <p className="text-5xl font-black tracking-tighter">₦124,500.00</p>
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-20">
            <CreditCard size={120} />
          </div>
        </div>
        <button className="w-full bg-white text-black py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-yellow-400 transition-colors">
          Top Up with Paystack <ArrowUpRight size={20} />
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10">
        <h2 className="text-xl font-bold mb-8">Transaction History</h2>
        <div className="space-y-6">
          {[
            { type: 'Top Up', amount: '+₦50,000', date: 'Mar 10, 2026', status: 'Success' },
            { type: 'Campaign Spend', amount: '-₦12,400', date: 'Mar 09, 2026', status: 'Success' },
            { type: 'Campaign Spend', amount: '-₦8,200', date: 'Mar 08, 2026', status: 'Success' },
          ].map((tx, i) => (
            <div key={i} className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <p className="font-bold">{tx.type}</p>
                <p className="text-zinc-500 text-xs">{tx.date}</p>
              </div>
              <div className="text-right">
                <p className={`font-mono font-bold ${tx.amount.startsWith('+') ? 'text-yellow-400' : 'text-white'}`}>{tx.amount}</p>
                <p className="text-[10px] text-yellow-400 uppercase font-black">{tx.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 flex flex-col p-6 hidden lg:flex">
        <div className="flex items-center gap-2 mb-12 px-2">
          <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center text-black font-black">D</div>
          <span className="text-xl font-black tracking-tighter">DANFODRIVE</span>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
            { id: 'proof', label: 'Proof of Play', icon: ShieldCheck },
            { id: 'wallet', label: 'Wallet', icon: Wallet },
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id ? 'bg-yellow-400/10 text-yellow-400 border-l-4 border-yellow-400' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <item.icon size={20} />
              <span className="font-bold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <button 
          onClick={() => setShowWizard(true)}
          className="mt-8 w-full bg-yellow-400 text-black py-3 rounded-xl font-black flex items-center justify-center gap-2"
        >
          <Plus size={20} /> New Campaign
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Advertiser Dashboard</h1>
            <p className="text-zinc-500 mt-1">Manage your campaigns and track ROI in real-time.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 flex items-center gap-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              <span className="text-sm font-bold text-zinc-300">Network Live</span>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'campaigns' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Your Campaigns</h2>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {campaigns.map((c, i) => (
                    <div key={i} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center text-yellow-400">
                          <Megaphone size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{c.name}</h3>
                          <p className="text-zinc-500 text-xs">Created {new Date(c.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-12">
                        <div className="text-center">
                          <p className="text-[10px] uppercase font-black text-zinc-500 tracking-widest mb-1">Budget</p>
                          <p className="font-mono font-bold">₦{c.budget.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] uppercase font-black text-zinc-500 tracking-widest mb-1">Status</p>
                          <span className="px-2 py-1 bg-yellow-400/10 text-yellow-400 text-[10px] font-black uppercase rounded-full border border-yellow-400/20">
                            {c.status}
                          </span>
                        </div>
                      </div>
                      <button className="p-2 text-zinc-500 hover:text-white">
                        <ChevronRight size={24} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'proof' && renderProofOfPlay()}
            {activeTab === 'wallet' && renderWallet()}
          </motion.div>
        </AnimatePresence>

        {showWizard && renderWizard()}
      </main>
    </div>
  );
};
