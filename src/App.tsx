import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LandingPage } from './components/LandingPage';
import { AdvertiserDashboard } from './components/AdvertiserDashboard';
import { DriverPortal } from './components/DriverPortal';
import { AdminPanel } from './components/AdminPanel';
import { QrCode, Activity, MapPin, ChevronLeft } from 'lucide-react';

// --- Types ---
interface Campaign {
  id: number;
  name: string;
  budget: number;
  cpm_rate: number;
  status: string;
  ad_count: number;
  geofence_lat: number;
  geofence_lng: number;
  geofence_radius: number;
  created_at: string;
}

interface Device {
  id: number;
  vehicle_type: string;
  vehicle_reg: string;
  status: string;
  last_lat: number;
  last_lng: number;
}

// --- Ad Player Component (The "IoT" View) ---
const AdPlayer = ({ onBack }: { onBack: () => void }) => {
  const [currentAd, setCurrentAd] = useState<any>(null);
  const [location, setLocation] = useState({ lat: 6.5244, lng: 3.3792 }); // Lagos default

  useEffect(() => {
    const fetchAd = async () => {
      const res = await fetch(`/api/ads/active?lat=${location.lat}&lng=${location.lng}`);
      const ads = await res.json();
      if (ads.length > 0) {
        setCurrentAd(ads[Math.floor(Math.random() * ads.length)]);
      }
    };
    fetchAd();
    const interval = setInterval(fetchAd, 10000);
    return () => clearInterval(interval);
  }, [location]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      <button 
        onClick={onBack}
        className="absolute top-8 left-8 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-bold"
      >
        <ChevronLeft size={20} /> Back to Dashboard
      </button>

      <div className="w-full max-w-5xl aspect-video bg-zinc-900 rounded-[3rem] border-[12px] border-zinc-800 overflow-hidden relative shadow-2xl shadow-yellow-400/10">
        <AnimatePresence mode="wait">
          {currentAd ? (
            <motion.div 
              key={currentAd.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full relative"
            >
              <img 
                src={currentAd.asset_url} 
                alt="Ad" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-12 right-12 bg-white p-6 rounded-[2rem] flex flex-col items-center gap-2 shadow-2xl">
                <QrCode size={100} className="text-black" />
                <p className="text-[10px] font-black text-black uppercase tracking-tighter">Scan for Rewards</p>
              </div>
              <div className="absolute top-12 left-12 bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
                <p className="text-sm font-bold text-yellow-400 uppercase tracking-widest flex items-center gap-3">
                  <Activity size={16} /> Sponsored by {currentAd.campaign_name}
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-500">
              <div className="text-center">
                <Activity size={64} className="mx-auto mb-6 animate-pulse" />
                <p className="text-xl font-medium">Searching for hyper-local ads...</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-12 bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] w-full max-w-5xl">
        <div className="flex flex-wrap gap-12 items-center justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Simulated Location</h3>
            <div className="flex gap-3">
              {[
                { name: 'Ikeja', lat: 6.5244, lng: 3.3792 },
                { name: 'Victoria Island', lat: 6.4281, lng: 3.4219 },
                { name: 'Lekki', lat: 6.4474, lng: 3.4733 }
              ].map(loc => (
                <button 
                  key={loc.name}
                  onClick={() => setLocation({ lat: loc.lat, lng: loc.lng })}
                  className={`px-6 py-3 rounded-2xl text-sm font-black transition-all ${
                    location.lat === loc.lat ? 'bg-yellow-400 text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {loc.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-12">
            <div className="text-center">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Signal</p>
              <p className="text-xl font-black">4G LTE (92%)</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Status</p>
              <div className="text-xl font-black text-yellow-400 flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                Live
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [view, setView] = useState<'landing' | 'advertiser' | 'driver' | 'admin' | 'player'>('landing');

  return (
    <div className="min-h-screen bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {view === 'landing' && <LandingPage onGetStarted={(role) => setView(role as any)} />}
          {view === 'advertiser' && <AdvertiserDashboard />}
          {view === 'driver' && <DriverPortal />}
          {view === 'admin' && <AdminPanel />}
          {view === 'player' && <AdPlayer onBack={() => setView('landing')} />}
        </motion.div>
      </AnimatePresence>

      {/* Demo Role Switcher (Floating) */}
      <div className="fixed bottom-8 right-8 z-[200] flex gap-2 p-2 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
        <button 
          onClick={() => setView('landing')}
          className={`p-2 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-colors ${view === 'landing' ? 'bg-yellow-400 text-black' : 'text-zinc-500 hover:text-white'}`}
        >
          Home
        </button>
        <button 
          onClick={() => setView('advertiser')}
          className={`p-2 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-colors ${view === 'advertiser' ? 'bg-yellow-400 text-black' : 'text-zinc-500 hover:text-white'}`}
        >
          Ads
        </button>
        <button 
          onClick={() => setView('driver')}
          className={`p-2 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-colors ${view === 'driver' ? 'bg-yellow-400 text-black' : 'text-zinc-500 hover:text-white'}`}
        >
          Driver
        </button>
        <button 
          onClick={() => setView('admin')}
          className={`p-2 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-colors ${view === 'admin' ? 'bg-yellow-400 text-black' : 'text-zinc-500 hover:text-white'}`}
        >
          Admin
        </button>
        <button 
          onClick={() => setView('player')}
          className={`p-2 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-colors ${view === 'player' ? 'bg-yellow-400 text-black' : 'text-zinc-500 hover:text-white'}`}
        >
          Player
        </button>
      </div>
    </div>
  );
}
