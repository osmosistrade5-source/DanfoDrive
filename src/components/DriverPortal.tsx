import React, { useState, useEffect } from 'react';
import { 
  Wallet, Truck, History, ArrowUpRight, 
  CheckCircle2, AlertCircle, LayoutDashboard,
  LogOut, User, Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const DriverPortal = () => {
  const [activeTab, setActiveTab] = useState('earnings');
  const [stats, setStats] = useState({ balance: 24500, total_paid: 150000 });
  const [devices, setDevices] = useState<any[]>([]);
  const [showWithdraw, setShowWithdraw] = useState(false);

  useEffect(() => {
    fetch('/api/driver/stats/2').then(res => res.json()).then(setStats);
    fetch('/api/devices').then(res => res.json()).then(setDevices);
  }, []);

  const renderEarnings = () => (
    <div className="space-y-8">
      <div className="bg-yellow-400 rounded-[2.5rem] p-10 text-black relative overflow-hidden shadow-2xl shadow-yellow-400/20">
        <div className="relative z-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] opacity-60 mb-4">Current Balance</p>
          <h2 className="text-6xl font-black tracking-tighter mb-10">₦{stats.balance.toLocaleString()}</h2>
          <div className="flex gap-4">
            <button 
              onClick={() => setShowWithdraw(true)}
              className="bg-black text-white px-8 py-4 rounded-2xl font-black text-lg flex items-center gap-2 hover:scale-105 transition-transform"
            >
              Withdraw Funds <ArrowUpRight size={20} />
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-10">
          <Wallet size={200} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Total Paid Out</p>
          <p className="text-2xl font-black">₦{stats.total_paid?.toLocaleString() || '150,000'}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Active Screens</p>
          <p className="text-2xl font-black">{devices.length}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold px-2">Recent Payouts</h3>
        {[
          { date: 'Mar 05, 2026', amount: '₦25,000', status: 'Completed', bank: 'OPay' },
          { date: 'Feb 28, 2026', amount: '₦30,000', status: 'Completed', bank: 'GTBank' },
        ].map((p, i) => (
          <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-yellow-400">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="font-bold">{p.amount}</p>
                <p className="text-zinc-500 text-xs">{p.date} • {p.bank}</p>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase text-yellow-400">{p.status}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFleet = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold px-2">Your Fleet</h2>
      <div className="grid grid-cols-1 gap-4">
        {devices.map((dev, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-100">
                <Truck size={28} />
              </div>
              <div>
                <h3 className="font-bold text-lg">{dev.vehicle_reg}</h3>
                <p className="text-zinc-500 text-sm">{dev.vehicle_type}</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`flex items-center gap-2 mb-1 justify-end ${dev.status === 'online' ? 'text-yellow-400' : 'text-zinc-500'}`}>
                <div className={`w-2 h-2 rounded-full ${dev.status === 'online' ? 'bg-yellow-400 animate-pulse' : 'bg-zinc-700'}`} />
                <span className="text-[10px] font-black uppercase tracking-widest">{dev.status}</span>
              </div>
              <p className="text-xs text-zinc-500">Last seen: Just now</p>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full py-4 border-2 border-dashed border-zinc-800 rounded-3xl text-zinc-500 font-bold hover:border-yellow-400/50 hover:text-yellow-400 transition-all">
        + Register New Vehicle
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Mobile Header */}
      <header className="p-6 flex justify-between items-center bg-black/80 backdrop-blur-md sticky top-0 z-40 border-b border-zinc-900">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center text-black font-black">D</div>
          <span className="text-xl font-black tracking-tighter">DANFODRIVE</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
          <User size={20} />
        </div>
      </header>

      <main className="p-6 max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
          >
            {activeTab === 'earnings' && renderEarnings()}
            {activeTab === 'fleet' && renderFleet()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Tab Bar */}
      <nav className="fixed bottom-0 w-full bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-800 px-8 py-4 flex justify-around items-center z-50">
        <button 
          onClick={() => setActiveTab('earnings')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'earnings' ? 'text-yellow-400' : 'text-zinc-500'}`}
        >
          <Wallet size={24} />
          <span className="text-[10px] font-bold uppercase">Earnings</span>
        </button>
        <button 
          onClick={() => setActiveTab('fleet')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'fleet' ? 'text-yellow-400' : 'text-zinc-500'}`}
        >
          <Truck size={24} />
          <span className="text-[10px] font-bold uppercase">Fleet</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-zinc-500">
          <History size={24} />
          <span className="text-[10px] font-bold uppercase">History</span>
        </button>
      </nav>

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-end sm:items-center justify-center p-4">
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="bg-zinc-900 w-full max-w-md rounded-[2rem] p-8"
          >
            <h2 className="text-2xl font-black mb-6">Withdraw Funds</h2>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-2 block">Amount (₦)</label>
                <input 
                  type="number" 
                  placeholder="0.00"
                  className="w-full bg-zinc-800 border-none rounded-2xl p-4 text-xl font-bold focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-2 block">Bank Account</label>
                <div className="p-4 bg-zinc-800 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Building2 size={20} className="text-zinc-500" />
                    <div>
                      <p className="font-bold text-sm">OPay Digital Bank</p>
                      <p className="text-zinc-500 text-xs">8123456789 • Emeka N.</p>
                    </div>
                  </div>
                  <CheckCircle2 size={20} className="text-yellow-400" />
                </div>
              </div>
              <button 
                onClick={() => setShowWithdraw(false)}
                className="w-full bg-yellow-400 text-black py-4 rounded-2xl font-black text-lg"
              >
                Confirm Payout
              </button>
              <button 
                onClick={() => setShowWithdraw(false)}
                className="w-full text-zinc-500 font-bold py-2"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
