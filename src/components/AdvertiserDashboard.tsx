import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Megaphone, Wallet, History, Plus, 
  Upload, MapPin, Clock, ChevronRight, Eye, QrCode, 
  TrendingUp, ArrowUpRight, ShieldCheck, CreditCard, Zap,
  BarChart3, Settings, LogOut, Bell, Search, Filter,
  Play, Pause, Edit3, Trash2, CheckCircle2, AlertCircle,
  Truck, Users, Timer, DollarSign, Lock, Activity, Map, Info
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

// --- Mock Data ---
const impressionTrendData = [
  { name: 'Mon', val: 120000 },
  { name: 'Tue', val: 150000 },
  { name: 'Wed', val: 110000 },
  { name: 'Thu', val: 180000 },
  { name: 'Fri', val: 210000 },
  { name: 'Sat', val: 190000 },
  { name: 'Sun', val: 240000 },
];

const spendTrendData = [
  { name: 'Mon', val: 2500 },
  { name: 'Tue', val: 3200 },
  { name: 'Wed', val: 2800 },
  { name: 'Thu', val: 4100 },
  { name: 'Fri', val: 4500 },
  { name: 'Sat', val: 3800 },
  { name: 'Sun', val: 5200 },
];

const routeData = [
  { name: 'Ikeja-CMS', screens: 45, spend: 12000 },
  { name: 'Lekki-Ajah', screens: 32, spend: 8500 },
  { name: 'Oshodi-Abule', screens: 60, spend: 15000 },
  { name: 'Yaba-Oyingbo', screens: 18, spend: 4200 },
];

// --- Sub-Components ---

const CreateCampaignFlow = ({ setActiveTab, wallet, routes, onRefresh, initialRouteId }: any) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    budget: 50000,
    drivers: 10,
    routeId: initialRouteId || '',
    minPerformance: 80,
    schedule: [{ start: '08:00', end: '10:00' }]
  });

  const [isLaunching, setIsLaunching] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const hasSubscription = wallet?.subscription_tier && wallet.subscription_tier !== 'none';

  const handlePaySubscription = async (tier: string, amount: number) => {
    setIsPaying(true);
    try {
      const res = await fetch('/api/subscription/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 1, tier, amount })
      });
      if (res.ok) {
        await onRefresh();
      }
    } finally {
      setIsPaying(false);
    }
  };

  const handleLaunch = async () => {
    if (!formData.name || !formData.routeId) {
      alert("Please provide a campaign name and select a route.");
      return;
    }

    setIsLaunching(true);
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          advertiser_id: 1,
          name: formData.name,
          budget: formData.budget,
          route_id: formData.routeId,
          drivers_count: formData.drivers,
          schedule_json: formData.schedule
        })
      });

      if (res.ok) {
        await onRefresh();
        setActiveTab('campaigns');
      } else {
        const err = await res.json();
        alert(err.error || "Failed to launch campaign");
      }
    } catch (error) {
      console.error("Launch error:", error);
      alert("An error occurred while launching the campaign.");
    } finally {
      setIsLaunching(false);
    }
  };

  if (!hasSubscription) {
    return (
      <div className="max-w-5xl mx-auto py-12">
        <div className="text-center mb-16">
          <div className="inline-flex p-4 bg-yellow-400/10 text-yellow-400 rounded-3xl mb-6">
            <Lock size={48} />
          </div>
          <h2 className="text-5xl font-black tracking-tighter mb-4">Subscription Required</h2>
          <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
            You must have an active monthly platform access plan to create and run ad campaigns on DanfoDrive.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { id: 'starter', name: 'Starter', price: 50000, drivers: 20, color: 'zinc' },
            { id: 'growth', name: 'Growth', price: 150000, drivers: 100, color: 'yellow' },
            { id: 'enterprise', name: 'Enterprise', price: 500000, drivers: 'Unlimited', color: 'emerald' }
          ].map((plan) => (
            <div key={plan.id} className={`bg-zinc-900 border ${plan.id === 'growth' ? 'border-yellow-400 shadow-2xl shadow-yellow-400/5' : 'border-zinc-800'} rounded-[2.5rem] p-10 flex flex-col`}>
              <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black">₦{plan.price.toLocaleString()}</span>
                <span className="text-zinc-500 font-bold">/mo</span>
              </div>
              
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 text-sm font-bold text-zinc-300">
                  <div className="w-5 h-5 bg-emerald-400/10 text-emerald-400 rounded-full flex items-center justify-center"><Plus size={12} /></div>
                  Up to {plan.drivers} drivers
                </li>
                <li className="flex items-center gap-3 text-sm font-bold text-zinc-300">
                  <div className="w-5 h-5 bg-emerald-400/10 text-emerald-400 rounded-full flex items-center justify-center"><Plus size={12} /></div>
                  Route Targeting
                </li>
                <li className="flex items-center gap-3 text-sm font-bold text-zinc-300">
                  <div className="w-5 h-5 bg-emerald-400/10 text-emerald-400 rounded-full flex items-center justify-center"><Plus size={12} /></div>
                  Real-time Analytics
                </li>
              </ul>

              <button 
                onClick={() => handlePaySubscription(plan.id, plan.price)}
                disabled={isPaying || (wallet?.balance || 0) < plan.price}
                className={`w-full py-4 rounded-2xl font-black transition-all ${
                  plan.id === 'growth' ? 'bg-yellow-400 text-black hover:scale-105' : 'bg-zinc-800 text-white hover:bg-zinc-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isPaying ? 'Processing...' : (wallet?.balance || 0) < plan.price ? 'Insufficient Balance' : 'Select Plan'}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const dailyMinutes = formData.schedule.length * 120 * formData.drivers; // Simplified: 2h per block
  const dailyCost = dailyMinutes * 10;
  const estDuration = Math.floor(formData.budget / dailyCost);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setActiveTab('campaigns')} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
          <ChevronRight className="rotate-180" size={24} />
        </button>
        <h2 className="text-3xl font-black tracking-tight">Create New Campaign</h2>
      </div>

      {/* Step Indicator */}
      <div className="flex gap-2 mb-12">
        {[1, 2, 3, 4, 5, 6].map((s) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full ${step >= s ? 'bg-yellow-400' : 'bg-zinc-800'}`} />
        ))}
      </div>

      <motion.div 
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-10 shadow-2xl"
      >
        {step === 1 && (
          <div className="space-y-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-emerald-400/10 text-emerald-400 rounded-2xl"><Megaphone size={32} /></div>
              <div>
                <h3 className="text-xl font-bold">Campaign Basics</h3>
                <p className="text-zinc-500 text-sm">Give your campaign a name and set your initial budget.</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Campaign Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Indomie Morning Rush"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-zinc-800 border-none rounded-2xl p-4 text-xl font-bold focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 bg-zinc-800/50 rounded-3xl border border-zinc-800">
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Available Balance</p>
                  <p className="text-4xl font-black">₦{(wallet?.balance || 0).toLocaleString()}</p>
                  <button className="mt-6 w-full py-3 bg-white text-black rounded-xl font-black text-sm hover:bg-yellow-400 transition-colors">
                    Deposit Funds
                  </button>
                </div>
                <div className="space-y-4">
                  <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Set Campaign Budget</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-zinc-500">₦</span>
                    <input 
                      type="number" 
                      value={formData.budget}
                      onChange={(e) => setFormData({...formData, budget: Number(e.target.value)})}
                      className="w-full bg-zinc-800 border-none rounded-2xl p-4 pl-8 text-xl font-bold focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <p className="text-xs text-zinc-500">Estimated duration: <span className="text-yellow-400 font-bold">{estDuration} days</span></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-400/10 text-blue-400 rounded-2xl"><Upload size={32} /></div>
              <div>
                <h3 className="text-xl font-bold">Upload Campaign Media</h3>
                <p className="text-zinc-500 text-sm">Supported formats: MP4, MP3, WAV (Max 15s)</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border-2 border-dashed border-zinc-800 rounded-3xl p-12 text-center hover:border-yellow-400/50 transition-colors cursor-pointer group">
                <Play size={48} className="mx-auto mb-4 text-zinc-700 group-hover:text-yellow-400 transition-colors" />
                <p className="font-bold">Upload Video Ad</p>
                <p className="text-xs text-zinc-500 mt-2">1920x1080 • MP4</p>
              </div>
              <div className="border-2 border-dashed border-zinc-800 rounded-3xl p-12 text-center hover:border-yellow-400/50 transition-colors cursor-pointer group">
                <Bell size={48} className="mx-auto mb-4 text-zinc-700 group-hover:text-yellow-400 transition-colors" />
                <p className="font-bold">Upload Audio Ad</p>
                <p className="text-xs text-zinc-500 mt-2">High Quality • MP3/WAV</p>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-yellow-400/10 text-yellow-400 rounded-2xl"><MapPin size={32} /></div>
              <div>
                <h3 className="text-xl font-bold">Route Targeting</h3>
                <p className="text-zinc-500 text-sm">Select routes where your ads will be triggered.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {routes.map((r: any) => (
                <button 
                  key={r.id}
                  onClick={() => setFormData({...formData, routeId: r.id})}
                  className={`p-6 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    formData.routeId === r.id ? 'bg-yellow-400/10 border-yellow-400' : 'bg-zinc-800/50 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <h4 className="font-bold">{r.name}</h4>
                    <p className="text-xs text-zinc-500">{r.city} • {r.available_vehicles} Vehicles Available</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Est. Reach</p>
                    <p className="font-bold text-yellow-400">{r.est_passengers_daily.toLocaleString()}/day</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-400/10 text-purple-400 rounded-2xl"><Users size={32} /></div>
              <div>
                <h3 className="text-xl font-bold">Driver Selection</h3>
                <p className="text-zinc-500 text-sm">Choose how many drivers will run your campaign.</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-between mb-2">
                <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Number of Drivers</label>
                <span className="text-yellow-400 font-black text-2xl">{formData.drivers}</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="100" 
                value={formData.drivers}
                onChange={(e) => setFormData({...formData, drivers: Number(e.target.value)})}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-yellow-400"
              />

              <div className="pt-8 space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Min. Performance Score</label>
                  <span className="text-emerald-400 font-black text-xl">{formData.minPerformance}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="5"
                  value={formData.minPerformance}
                  onChange={(e) => setFormData({...formData, minPerformance: Number(e.target.value)})}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
                <p className="text-xs text-zinc-500">Only drivers with a score above {formData.minPerformance} will be invited to this campaign.</p>
              </div>

              <div className="p-6 bg-zinc-800/30 rounded-2xl border border-zinc-800 flex items-center gap-4">
                <ShieldCheck className="text-emerald-400" size={20} />
                <p className="text-sm text-zinc-400">
                  Prioritizing high-performance drivers ensures better ad completion and route compliance.
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-orange-400/10 text-orange-400 rounded-2xl"><Timer size={32} /></div>
              <div>
                <h3 className="text-xl font-bold">Campaign Schedule</h3>
                <p className="text-zinc-500 text-sm">Select time blocks for ad playback.</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {formData.schedule.map((s, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                      <input type="time" value={s.start} className="w-full bg-zinc-800 border-none rounded-xl p-3 pl-10 font-bold" />
                    </div>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                      <input type="time" value={s.end} className="w-full bg-zinc-800 border-none rounded-xl p-3 pl-10 font-bold" />
                    </div>
                  </div>
                  <button className="p-3 text-zinc-500 hover:text-red-500"><Trash2 size={20} /></button>
                </div>
              ))}
              <button 
                onClick={() => setFormData({...formData, schedule: [...formData.schedule, {start: '12:00', end: '14:00'}]})}
                className="w-full py-4 border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-500 font-bold hover:border-yellow-400/50 hover:text-yellow-400 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Add Time Block
              </button>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-yellow-400 text-black rounded-2xl"><BarChart3 size={32} /></div>
              <div>
                <h3 className="text-xl font-bold">Cost Calculator & Review</h3>
                <p className="text-zinc-500 text-sm">Review your campaign metrics before launching.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex justify-between border-b border-zinc-800 pb-4">
                  <span className="text-zinc-500">Total Daily Minutes</span>
                  <span className="font-bold">{dailyMinutes.toLocaleString()} mins</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-4">
                  <span className="text-zinc-500">Cost per Minute</span>
                  <span className="font-bold text-yellow-400">₦10.00</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-4">
                  <span className="text-zinc-500">Total Daily Spend</span>
                  <span className="font-bold text-xl">₦{dailyCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-4">
                  <span className="text-zinc-500">Est. Campaign Duration</span>
                  <span className="font-bold text-emerald-400">{estDuration} Days</span>
                </div>
              </div>

              <div className="bg-yellow-400 rounded-3xl p-8 text-black flex flex-col justify-center items-center text-center">
                <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-2">Estimated Monthly Impressions</p>
                <p className="text-5xl font-black tracking-tighter">{(dailyMinutes * 4 * 30).toLocaleString()}</p>
                <p className="mt-4 text-sm font-bold opacity-80">Based on avg. 4 passengers per minute</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 flex justify-between">
          <button 
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={isLaunching}
            className={`px-8 py-4 font-bold text-zinc-500 hover:text-white transition-colors ${step === 1 ? 'invisible' : ''}`}
          >
            Back
          </button>
          <button 
            onClick={() => step === 6 ? handleLaunch() : setStep(step + 1)}
            disabled={isLaunching}
            className="bg-yellow-400 text-black px-12 py-4 rounded-2xl font-black text-lg hover:scale-105 transition-transform disabled:opacity-50"
          >
            {isLaunching ? 'Launching...' : step === 6 ? 'Launch Campaign' : 'Next Step'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// --- Smart Route Heatmap Component ---

const RouteHeatmap = ({ routes, onSelectRoute, selectedRoute }: any) => {
  return (
    <div className="relative w-full h-full bg-zinc-950 rounded-3xl overflow-hidden border border-zinc-800">
      {/* Stylized Map Background */}
      <svg viewBox="0 0 1000 600" className="w-full h-full opacity-40">
        {/* Lagos Coastline Outline (Stylized) */}
        <path 
          d="M0,400 Q200,380 400,450 T800,420 T1000,500 L1000,600 L0,600 Z" 
          fill="#18181b" 
          stroke="#27272a" 
          strokeWidth="2"
        />
        {/* Grid Lines */}
        {[...Array(10)].map((_, i) => (
          <line key={`h-${i}`} x1="0" y1={i * 60} x2="1000" y2={i * 60} stroke="#27272a" strokeWidth="1" strokeDasharray="4 4" />
        ))}
        {[...Array(16)].map((_, i) => (
          <line key={`v-${i}`} x1={i * 62.5} y1="0" x2={i * 62.5} y2="600" stroke="#27272a" strokeWidth="1" strokeDasharray="4 4" />
        ))}
      </svg>

      {/* Routes Layer */}
      <svg viewBox="0 0 1000 600" className="absolute inset-0 w-full h-full">
        {routes.map((route: any) => {
          let coords = [];
          try {
            coords = JSON.parse(route.coordinates || "[]");
          } catch (e) {
            console.error("Failed to parse coordinates for route", route.id);
            return null;
          }
          if (coords.length < 2) return null;
          
          const pathD = `M${coords[0][0]},${coords[0][1]} ${coords.slice(1).map((c: any) => `L${c[0]},${c[1]}`).join(' ')}`;
          const color = route.current_density === 'high' ? '#ef4444' : route.current_density === 'medium' ? '#facc15' : '#22c55e';
          const isSelected = selectedRoute?.id === route.id;

          return (
            <g key={route.id} className="cursor-pointer group" onClick={() => onSelectRoute(route)}>
              {/* Glow effect for selected */}
              {isSelected && (
                <path 
                  d={pathD} 
                  fill="none" 
                  stroke={color} 
                  strokeWidth="12" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="opacity-20 animate-pulse"
                />
              )}
              {/* Main Path */}
              <path 
                d={pathD} 
                fill="none" 
                stroke={color} 
                strokeWidth={isSelected ? "6" : "4"} 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="transition-all duration-300 group-hover:stroke-white"
              />
              {/* Start/End Dots */}
              <circle cx={coords[0][0]} cy={coords[0][1]} r="4" fill="white" />
              <circle cx={coords[coords.length-1][0]} cy={coords[coords.length-1][1]} r="4" fill="white" />
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-6 left-6 bg-zinc-900/80 backdrop-blur-md p-4 rounded-2xl border border-zinc-800 space-y-2">
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Passenger Density</p>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/20" />
          <span className="text-xs font-bold">High Density</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/20" />
          <span className="text-xs font-bold">Medium Density</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20" />
          <span className="text-xs font-bold">Low Density</span>
        </div>
      </div>
    </div>
  );
};

const StatRow = ({ label, value, icon: Icon }: any) => (
  <div className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0">
    <div className="flex items-center gap-3 text-zinc-400">
      <Icon size={16} />
      <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
    </div>
    <span className="text-sm font-black text-white">{value}</span>
  </div>
);

const SmartRoutes = ({ routes, selectedRoute, setSelectedRoute, setActiveTab, setInitialRouteId }: any) => {
  const [filterCity, setFilterCity] = useState('All Cities');
  const [filterType, setFilterType] = useState('All Types');
  const [filterTime, setFilterTime] = useState('Morning Peak');

  const filteredRoutes = routes.filter(r => 
    (filterCity === 'All Cities' || r.city === filterCity) &&
    (filterType === 'All Types' || r.transport_type === filterType)
  ).map(r => {
    // Mock density logic based on time of day
    let density = r.current_density;
    if (filterTime === 'Morning Peak') {
      if (r.name?.includes('Ikeja') || r.name?.includes('Oshodi') || r.name?.includes('Gwarinpa')) density = 'high';
      else density = 'medium';
    } else if (filterTime === 'Evening Peak') {
      if (r.name?.includes('CMS') || r.name?.includes('Lekki') || r.name?.includes('Maitama')) density = 'high';
      else density = 'medium';
    } else if (filterTime === 'Off-Peak') {
      density = 'low';
    }
    return { ...r, current_density: density };
  });

  return (
    <div className="h-full flex flex-col gap-8 p-8 overflow-hidden">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">SMART ROUTES</h1>
          <p className="text-zinc-500 font-medium">Real-time passenger density & route analytics heatmap.</p>
        </div>
        <div className="flex gap-4">
          <select 
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-yellow-400 transition-colors"
          >
            <option>All Cities</option>
            <option>Lagos</option>
            <option>Abuja</option>
          </select>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-yellow-400 transition-colors"
          >
            <option>All Types</option>
            <option>Danfo</option>
            <option>Taxi</option>
            <option>Bus</option>
          </select>
          <select 
            value={filterTime}
            onChange={(e) => setFilterTime(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-yellow-400 transition-colors"
          >
            <option>Morning Peak</option>
            <option>Mid-Day</option>
            <option>Evening Peak</option>
            <option>Off-Peak</option>
          </select>
        </div>
      </div>

      <div className="flex-1 flex gap-8 min-h-0">
        {/* Map Area */}
        <div className="flex-1 min-h-0">
          <RouteHeatmap 
            routes={filteredRoutes} 
            onSelectRoute={setSelectedRoute} 
            selectedRoute={selectedRoute} 
          />
        </div>

        {/* Info Panel */}
        <div className="w-96 bg-zinc-900 border border-zinc-800 rounded-3xl p-8 flex flex-col overflow-y-auto">
          {selectedRoute ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                    selectedRoute.current_density === 'high' ? 'bg-red-500/10 text-red-500' :
                    selectedRoute.current_density === 'medium' ? 'bg-yellow-400/10 text-yellow-400' :
                    'bg-emerald-500/10 text-emerald-500'
                  }`}>
                    {selectedRoute.current_density} Density
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                    {selectedRoute.transport_type}
                  </span>
                </div>
                <h2 className="text-2xl font-black tracking-tight">{selectedRoute.name}</h2>
                <p className="text-zinc-500 text-sm font-medium">{selectedRoute.city}</p>
              </div>

              <div className="space-y-1">
                <StatRow label="Avg Passengers / Hr" value={selectedRoute.avg_passengers_per_hour?.toLocaleString()} icon={Users} />
                <StatRow label="Daily Impressions" value={selectedRoute.est_passengers_daily?.toLocaleString()} icon={Eye} />
                <StatRow label="Active Vehicles" value={selectedRoute.available_vehicles} icon={Truck} />
                <StatRow label="Peak Hours" value={selectedRoute.peak_hours} icon={Clock} />
                <StatRow label="Route Duration" value={`${selectedRoute.duration_mins} mins`} icon={Timer} />
                <StatRow label="Cost / Minute" value={`₦${selectedRoute.cost_per_minute}`} icon={DollarSign} />
              </div>

              <div className="p-6 bg-zinc-800/30 rounded-2xl border border-zinc-800">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="text-yellow-400" size={20} />
                  <h3 className="text-sm font-bold uppercase tracking-widest">Efficiency Score</h3>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black text-white">8.4</span>
                  <span className="text-zinc-500 text-sm font-bold mb-1">/ 10</span>
                </div>
                <p className="text-xs text-zinc-500 mt-2">Based on current traffic and passenger engagement.</p>
              </div>

              <button 
                onClick={() => {
                  setInitialRouteId(selectedRoute.id);
                  setActiveTab('create');
                }}
                className="w-full bg-yellow-400 text-black py-4 rounded-2xl font-black text-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Add to Campaign
              </button>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500">
                <Info size={32} />
              </div>
              <div>
                <h3 className="text-lg font-bold">Select a Route</h3>
                <p className="text-sm text-zinc-500">Click on a route on the map to see detailed analytics and passenger density.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Components ---

const StatCard = ({ label, value, icon: Icon, trend, color = "yellow" }: any) => (
  <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
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

export const AdvertiserDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [initialRouteId, setInitialRouteId] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [topDrivers, setTopDrivers] = useState<any[]>([]);
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const [statsRes, campaignsRes, routesRes, walletRes, topDriversRes] = await Promise.all([
        fetch('/api/advertiser/stats/1'),
        fetch('/api/campaigns'),
        fetch('/api/routes'),
        fetch('/api/wallet/stats/1'),
        fetch('/api/advertiser/top-drivers')
      ]);
      
      const statsData = await statsRes.json();
      const walletData = await walletRes.json();
      
      setStats(statsData);
      setCampaigns(await campaignsRes.json());
      setRoutes(await routesRes.json());
      setTopDrivers(await topDriversRes.json());
      setWallet({ ...walletData, subscription_tier: statsData.subscription_tier });
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const renderOverview = () => (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Active Screens" value={stats?.activeScreens || 0} icon={Truck} trend="+3" />
        <StatCard label="Spend Today (Verified)" value={`₦${(stats?.dailySpend || 0).toLocaleString()}`} icon={DollarSign} trend="+12%" />
        <StatCard label="Verified Impressions" value={(stats?.totalImpressions || 0).toLocaleString()} icon={ShieldCheck} trend="+8.5%" />
        <StatCard label="Remaining Budget" value={`₦${(stats?.remainingBudget || 0).toLocaleString()}`} icon={Wallet} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Fleet Status Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Activity size={20} className="text-yellow-400" />
            Fleet Activity
          </h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-zinc-400">Online Screens</span>
                <span className="text-emerald-400 font-bold">{stats?.fleetStatus?.online || 0}</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-400" 
                  style={{ width: `${(stats?.fleetStatus?.online / (stats?.fleetStatus?.online + stats?.fleetStatus?.offline || 1)) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-zinc-400">Offline Screens</span>
                <span className="text-zinc-500 font-bold">{stats?.fleetStatus?.offline || 0}</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-zinc-600" 
                  style={{ width: `${(stats?.fleetStatus?.offline / (stats?.fleetStatus?.online + stats?.fleetStatus?.offline || 1)) * 100}%` }}
                />
              </div>
            </div>
            <div className="pt-4 border-t border-zinc-800">
              <p className="text-xs text-zinc-500 italic">
                * Impressions are only verified when screens are online and moving.
              </p>
            </div>
          </div>
        </div>

        {/* Route Performance */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <MapPin size={20} className="text-yellow-400" />
            Route Performance
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-zinc-500 text-xs uppercase tracking-wider border-b border-zinc-800">
                  <th className="pb-4 font-bold">Route Name</th>
                  <th className="pb-4 font-bold">Verified Plays</th>
                  <th className="pb-4 font-bold">Est. Reach</th>
                  <th className="pb-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {(stats?.routePerformance || []).map((route: any, i: number) => (
                  <tr key={i} className="text-sm">
                    <td className="py-4 font-medium">{route.name}</td>
                    <td className="py-4">{route.impressions.toLocaleString()}</td>
                    <td className="py-4 font-bold text-yellow-400">{route.reach.toLocaleString()}</td>
                    <td className="py-4">
                      <span className="px-2 py-1 bg-emerald-400/10 text-emerald-400 text-[10px] font-bold rounded-full uppercase">High Traffic</span>
                    </td>
                  </tr>
                ))}
                {(!stats?.routePerformance || stats.routePerformance.length === 0) && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-zinc-500">No route data available yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold">Impressions Trend</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-zinc-800 rounded-lg text-xs font-bold">7D</button>
              <button className="px-3 py-1 text-zinc-500 text-xs font-bold">30D</button>
            </div>
          </div>
          <div className="h-[300px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={impressionTrendData}>
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
          <h2 className="text-xl font-bold mb-8">Top Performance Drivers</h2>
          <div className="space-y-6">
            {topDrivers.map((driver, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-xs font-bold">
                    {driver.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{driver.name}</p>
                    <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{driver.rank_category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-emerald-400">{driver.overall_score}%</p>
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Score</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Campaigns Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
        <div className="p-8 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-xl font-bold">Recent Campaigns</h2>
          <button onClick={() => setActiveTab('campaigns')} className="text-sm font-bold text-yellow-400 hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-800/50 text-zinc-500 text-[10px] uppercase font-black tracking-widest">
              <tr>
                <th className="px-8 py-4">Campaign Name</th>
                <th className="px-8 py-4">Drivers</th>
                <th className="px-8 py-4">Hours</th>
                <th className="px-8 py-4">Daily Spend</th>
                <th className="px-8 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {campaigns.slice(0, 5).map((c) => (
                <tr key={c.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-8 py-4 text-sm font-bold">{c.name}</td>
                  <td className="px-8 py-4 text-sm">{c.drivers_count} Drivers</td>
                  <td className="px-8 py-4 text-sm">
                    {JSON.parse(c.schedule_json || '[]').map((s: any) => `${s.start}-${s.end}`).join(', ')}
                  </td>
                  <td className="px-8 py-4 text-sm font-mono">₦{(c.drivers_count * 10 * 60).toLocaleString()}</td>
                  <td className="px-8 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      c.status === 'active' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' : 'bg-zinc-400/10 text-zinc-400 border-zinc-400/20'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCampaigns = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Campaign Management</h2>
        <button 
          onClick={() => setActiveTab('create')}
          className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-black text-sm flex items-center gap-2 hover:scale-105 transition-transform"
        >
          <Plus size={18} /> Create Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {campaigns.map((c) => (
          <div key={c.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center text-yellow-400">
                <Megaphone size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">{c.name}</h3>
                <p className="text-zinc-500 text-xs">Target: {c.route_name || 'All Routes'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-1 max-w-2xl">
              <div>
                <p className="text-[10px] uppercase font-black text-zinc-500 tracking-widest mb-1">Drivers</p>
                <p className="font-bold">{c.drivers_count}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-black text-zinc-500 tracking-widest mb-1">Duration</p>
                <p className="font-bold">15s</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-black text-zinc-500 tracking-widest mb-1">Budget Left</p>
                <p className="font-mono font-bold text-emerald-400">₦{c.budget_remaining.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-black text-zinc-500 tracking-widest mb-1">Status</p>
                <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  c.status === 'active' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' : 'bg-zinc-400/10 text-zinc-400 border-zinc-400/20'
                }`}>
                  {c.status}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="p-3 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-colors text-zinc-400 hover:text-white">
                <Edit3 size={18} />
              </button>
              <button className="p-3 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-colors text-zinc-400 hover:text-white">
                {c.status === 'active' ? <Pause size={18} /> : <Play size={18} />}
              </button>
              <button className="p-3 bg-zinc-800 rounded-xl hover:bg-red-500/10 transition-colors text-zinc-400 hover:text-red-500">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCreateCampaign = () => null;

  const renderWallet = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-10 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-1">Available Balance</p>
                <h2 className="text-6xl font-black tracking-tighter">₦{(wallet?.balance || 0).toLocaleString()}</h2>
              </div>
              <div className="text-right">
                <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-1">Current Plan</p>
                <span className="px-3 py-1 bg-yellow-400 text-black rounded-full text-[10px] font-black uppercase tracking-widest">
                  {wallet?.subscription_tier || 'None'}
                </span>
              </div>
            </div>
            <div className="flex gap-4 mt-10">
              <button className="bg-yellow-400 text-black px-8 py-4 rounded-2xl font-black text-lg flex items-center gap-2 hover:scale-105 transition-transform">
                <Plus size={20} /> Deposit Funds
              </button>
              <button 
                onClick={() => setActiveTab('create')}
                className="bg-zinc-800 text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-zinc-700 transition-colors"
              >
                {wallet?.subscription_tier === 'none' ? 'Upgrade Plan' : 'Manage Subscription'}
              </button>
            </div>
          </div>
          <div className="absolute top-0 right-0 p-10 opacity-5">
            <CreditCard size={240} />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
          <div className="p-8 border-b border-zinc-800">
            <h2 className="text-xl font-bold">Transaction History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-zinc-800/50 text-zinc-500 text-[10px] uppercase font-black tracking-widest">
                <tr>
                  <th className="px-8 py-4">Date</th>
                  <th className="px-8 py-4">Type</th>
                  <th className="px-8 py-4">Description</th>
                  <th className="px-8 py-4">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {wallet?.transactions.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-8 py-4 text-sm text-zinc-500">{new Date(tx.timestamp).toLocaleDateString()}</td>
                    <td className="px-8 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        tx.type === 'deposit' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' : 'bg-red-400/10 text-red-400 border-red-400/20'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-sm">{tx.description}</td>
                    <td className={`px-8 py-4 text-sm font-mono font-bold ${tx.type === 'deposit' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {tx.type === 'deposit' ? '+' : '-'}₦{Math.abs(tx.amount).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <h3 className="text-xl font-bold mb-6">Subscription Plan</h3>
          <div className="p-6 bg-yellow-400/10 border border-yellow-400/20 rounded-2xl mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-yellow-400 font-black uppercase tracking-widest text-xs">Growth Plan</span>
              <span className="text-zinc-100 font-bold text-sm">₦150,000/mo</span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">Up to 100 drivers, route targeting, and advanced analytics included.</p>
          </div>
          <button className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-bold text-sm transition-colors">
            Upgrade Plan
          </button>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <h3 className="text-xl font-bold mb-6">Billing Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-2xl border border-zinc-800">
              <CreditCard size={20} className="text-zinc-500" />
              <div>
                <p className="text-sm font-bold">•••• 4242</p>
                <p className="text-[10px] text-zinc-500 uppercase font-black">Expires 12/28</p>
              </div>
            </div>
            <button className="w-full py-3 text-sm font-bold text-zinc-500 hover:text-white transition-colors">
              Add Payment Method
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-black text-zinc-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 border-r border-zinc-800 flex flex-col bg-zinc-950">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-400/20">
              <span className="text-black font-black text-2xl">D</span>
            </div>
            <span className="text-2xl font-black tracking-tighter">DANFODRIVE</span>
          </div>
          
          <nav className="space-y-1">
            {[
              { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
              { id: 'campaigns', icon: Megaphone, label: 'Campaigns' },
              { id: 'routes', icon: Map, label: 'Smart Routes' },
              { id: 'create', icon: Plus, label: 'Create Campaign' },
              { id: 'wallet', icon: Wallet, label: 'Budget Wallet' },
              { id: 'analytics', icon: BarChart3, label: 'Analytics' },
              { id: 'billing', icon: CreditCard, label: 'Billing' },
              { id: 'settings', icon: Settings, label: 'Settings' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === item.id 
                    ? "bg-yellow-400 text-black shadow-xl shadow-yellow-400/10" 
                    : "text-zinc-500 hover:text-zinc-100 hover:bg-zinc-900"
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto p-8 border-t border-zinc-800">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
              <img src="https://i.pravatar.cc/150?u=tunde" alt="User" />
            </div>
            <div>
              <p className="text-sm font-black">Tunde Okafor</p>
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Growth Plan</p>
            </div>
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-zinc-500 hover:text-red-400 hover:bg-red-400/5 transition-all">
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-20 border-b border-zinc-800 flex items-center justify-between px-10 bg-black/50 backdrop-blur-xl z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black tracking-tight capitalize">{activeTab.replace('-', ' ')}</h1>
            <div className="h-4 w-px bg-zinc-800 mx-2" />
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Network Live: 142 Screens Online
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type="text" 
                placeholder="Search campaigns..." 
                className="bg-zinc-900 border border-zinc-800 rounded-2xl py-2.5 pl-12 pr-6 text-sm focus:outline-none focus:border-yellow-400 transition-colors w-72 font-medium"
              />
            </div>
            <button className="relative p-2.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-500 hover:text-zinc-100 transition-all">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-yellow-400 rounded-full border-2 border-black" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-10 bg-zinc-950/50">
          <AnimatePresence mode="wait">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'campaigns' && renderCampaigns()}
                {activeTab === 'routes' && <SmartRoutes 
                  routes={routes} 
                  selectedRoute={selectedRoute} 
                  setSelectedRoute={setSelectedRoute} 
                  setActiveTab={setActiveTab} 
                  setInitialRouteId={setInitialRouteId} 
                />}
                {activeTab === 'create' && <CreateCampaignFlow 
                  setActiveTab={setActiveTab} 
                  wallet={wallet} 
                  routes={routes} 
                  onRefresh={fetchStats}
                  initialRouteId={initialRouteId}
                />}
                {activeTab === 'wallet' && renderWallet()}
                {activeTab === 'analytics' && renderOverview()} {/* Reusing overview for demo */}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
