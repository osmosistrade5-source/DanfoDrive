import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, AlertCircle, Check, X, 
  Activity, MapPin, Clock, Truck, Eye
} from 'lucide-react';
import { motion } from 'motion/react';

export const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('approvals');
  const [pendingAds, setPendingAds] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/ads/pending').then(res => res.json()).then(setPendingAds);
    fetch('/api/devices').then(res => res.json()).then(setDevices);
  }, []);

  const handleApproval = async (id: number, status: string) => {
    await fetch(`/api/ads/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    setPendingAds(prev => prev.filter(ad => ad.id !== id));
  };

  const renderApprovals = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Ad Approval Queue</h2>
      <div className="grid grid-cols-1 gap-4">
        {pendingAds.length === 0 ? (
          <div className="p-12 text-center bg-zinc-900/50 border border-zinc-800 rounded-3xl text-zinc-500">
            <ShieldCheck size={48} className="mx-auto mb-4 opacity-20" />
            <p>Queue is empty. All ads are processed.</p>
          </div>
        ) : (
          pendingAds.map((ad) => (
            <div key={ad.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl flex items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="w-32 aspect-video bg-zinc-800 rounded-xl overflow-hidden">
                  <img src={ad.asset_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{ad.campaign_name}</h3>
                  <p className="text-zinc-500 text-sm">By {ad.advertiser_name}</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => handleApproval(ad.id, 'rejected')}
                  className="p-3 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                >
                  <X size={24} />
                </button>
                <button 
                  onClick={() => handleApproval(ad.id, 'approved')}
                  className="p-3 bg-yellow-400/10 text-yellow-400 rounded-xl hover:bg-yellow-400 hover:text-black transition-all"
                >
                  <Check size={24} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderFleetHealth = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-8 h-[600px] relative overflow-hidden">
          <div className="absolute inset-0 grayscale opacity-30">
            <img src="https://picsum.photos/seed/admin-map/1200/800" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="relative z-10 flex justify-between items-start">
            <h3 className="text-xl font-bold">Network Health Map</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-black/50 rounded-full border border-white/10">
                <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                <span className="text-[10px] font-bold uppercase">Online: {devices.filter(d => d.status === 'online').length}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-black/50 rounded-full border border-white/10">
                <div className="w-2 h-2 bg-zinc-500 rounded-full" />
                <span className="text-[10px] font-bold uppercase">Offline: {devices.filter(d => d.status !== 'online').length}</span>
              </div>
            </div>
          </div>

          {/* Pulsing Dots for Fleet */}
          {devices.map((dev, i) => (
            <div 
              key={i} 
              className="absolute w-4 h-4"
              style={{ top: `${30 + Math.random() * 40}%`, left: `${30 + Math.random() * 40}%` }}
            >
              <div className={`w-full h-full rounded-full ${dev.status === 'online' ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'bg-zinc-600'}`} />
              {dev.status === 'online' && <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-75" />}
            </div>
          ))}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 overflow-y-auto max-h-[600px]">
          <h3 className="text-xl font-bold mb-6">Device Heartbeats</h3>
          <div className="space-y-4">
            {devices.map((dev, i) => (
              <div key={i} className="p-4 bg-zinc-800/50 rounded-2xl border border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Truck size={20} className="text-zinc-500" />
                  <div>
                    <p className="font-bold text-sm">{dev.vehicle_reg}</p>
                    <p className="text-[10px] text-zinc-500 uppercase font-black">Last Ping: Just now</p>
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full ${dev.status === 'online' ? 'bg-yellow-400' : 'bg-zinc-700'}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-8 lg:p-12">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Admin Control</h1>
          <p className="text-zinc-500 mt-1">Network-wide oversight and quality control.</p>
        </div>
        <div className="flex gap-2 p-1 bg-zinc-900 rounded-2xl border border-zinc-800">
          <button 
            onClick={() => setActiveTab('approvals')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'approvals' ? 'bg-yellow-400 text-black' : 'text-zinc-500'}`}
          >
            Approvals
          </button>
          <button 
            onClick={() => setActiveTab('fleet')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'fleet' ? 'bg-yellow-400 text-black' : 'text-zinc-500'}`}
          >
            Fleet Health
          </button>
        </div>
      </header>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {activeTab === 'approvals' && renderApprovals()}
        {activeTab === 'fleet' && renderFleetHealth()}
      </motion.div>
    </div>
  );
};
