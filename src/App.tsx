import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LandingPage } from './components/LandingPage';
import { AdvertiserDashboard } from './components/AdvertiserDashboard';
import { DriverPortal } from './components/DriverPortal';
import AdminDashboard from './components/AdminDashboard';
import { QrCode, Activity, MapPin, ChevronLeft } from 'lucide-react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';

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

// --- Protected Route Wrapper ---
const ProtectedRoute = ({ children, role, userRole }: { children: React.ReactNode, role: string, userRole: string }) => {
  // In this demo, we'll allow the transition to happen smoothly.
  // The role switcher handles the state, so we don't need to force a redirect here
  // which causes race conditions during navigation.
  return <>{children}</>;
};

// --- Ad Player Component (The "IoT" View) ---
const AdPlayer = ({ onBack }: { onBack: () => void }) => {
  const [currentAd, setCurrentAd] = useState<any>(null);
  const [location, setLocation] = useState({ lat: 6.5244, lng: 3.3792 }); // Lagos default
  const [speed, setSpeed] = useState(45); // km/h
  const [isLogging, setIsLogging] = useState(false);

  useEffect(() => {
    const fetchAd = async () => {
      const res = await fetch(`/api/ads/active?lat=${location.lat}&lng=${location.lng}`);
      const ads = await res.json();
      if (ads.length > 0) {
        const selected = ads[Math.floor(Math.random() * ads.length)];
        setCurrentAd(selected);
      }
    };
    fetchAd();
    const interval = setInterval(fetchAd, 15000); // Change ad every 15s
    return () => clearInterval(interval);
  }, [location]);

  // Log impression when ad changes
  useEffect(() => {
    if (currentAd) {
      const logImpression = async () => {
        setIsLogging(true);
        try {
          await fetch('/api/impressions/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              deviceId: 'DF-2026-001', // Mock device ID
              adId: currentAd.id,
              lat: location.lat,
              lng: location.lng,
              speed: speed
            })
          });
        } catch (err) {
          console.error("Failed to log impression", err);
        } finally {
          setIsLogging(false);
        }
      };
      logImpression();
    }
  }, [currentAd, location, speed]);

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
              
              {/* Verification Status Overlay */}
              <div className="absolute bottom-12 left-12 flex gap-4">
                <div className={`px-4 py-2 rounded-xl backdrop-blur-md border ${speed > 5 ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-red-500/20 border-red-500/50 text-red-400'} text-xs font-bold uppercase tracking-widest`}>
                  {speed > 5 ? 'Moving' : 'Stopped'}
                </div>
                <div className="px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl text-xs font-bold text-white uppercase tracking-widest">
                  {speed} KM/H
                </div>
                {isLogging && (
                  <div className="px-4 py-2 bg-yellow-400/20 border border-yellow-400/50 rounded-xl text-xs font-bold text-yellow-400 uppercase tracking-widest animate-pulse">
                    Verifying...
                  </div>
                )}
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

          <div className="space-y-4">
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Simulated Speed</h3>
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={speed} 
                onChange={(e) => setSpeed(parseInt(e.target.value))}
                className="w-48 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-yellow-400"
              />
              <span className="text-xl font-black w-16">{speed} <span className="text-xs text-zinc-500">KM/H</span></span>
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
  const [userRole, setUserRole] = useState<'guest' | 'advertiser' | 'driver' | 'admin'>('guest');
  const navigate = useNavigate();
  const location = useLocation();

  // Sync role with path on load/navigation
  useEffect(() => {
    const path = location.pathname;
    if (path === '/admin') setUserRole('admin');
    else if (path === '/advertiser') setUserRole('advertiser');
    else if (path === '/driver') setUserRole('driver');
    else if (path === '/') setUserRole('guest');
  }, [location.pathname]);

  // Simple demo logic: set role based on path or button click
  const handleRoleChange = (role: any) => {
    setUserRole(role);
    if (role === 'admin') navigate('/admin');
    else if (role === 'advertiser') navigate('/advertiser');
    else if (role === 'driver') navigate('/driver');
    else navigate('/');
  };

  return (
    <div className="min-h-screen bg-black">
      <Routes>
        <Route path="/" element={<LandingPage onGetStarted={(role) => handleRoleChange(role)} />} />
        <Route 
          path="/advertiser" 
          element={
            <ProtectedRoute role="advertiser" userRole={userRole}>
              <AdvertiserDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/driver" 
          element={
            <ProtectedRoute role="driver" userRole={userRole}>
              <DriverPortal />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute role="admin" userRole={userRole}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/player" element={<AdPlayer onBack={() => navigate('/')} />} />
      </Routes>

      {/* Demo Role Switcher (Floating) */}
      <div className="fixed bottom-8 right-8 z-[200] flex gap-2 p-2 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
        <button 
          onClick={() => handleRoleChange('guest')}
          className={`p-2 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-colors ${location.pathname === '/' ? 'bg-yellow-400 text-black' : 'text-zinc-500 hover:text-white'}`}
        >
          Home
        </button>
        <button 
          onClick={() => handleRoleChange('advertiser')}
          className={`p-2 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-colors ${location.pathname === '/advertiser' ? 'bg-yellow-400 text-black' : 'text-zinc-500 hover:text-white'}`}
        >
          Ads
        </button>
        <button 
          onClick={() => handleRoleChange('driver')}
          className={`p-2 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-colors ${location.pathname === '/driver' ? 'bg-yellow-400 text-black' : 'text-zinc-500 hover:text-white'}`}
        >
          Driver
        </button>
        <button 
          onClick={() => handleRoleChange('admin')}
          className={`p-2 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-colors ${location.pathname === '/admin' ? 'bg-yellow-400 text-black' : 'text-zinc-500 hover:text-white'}`}
        >
          Admin
        </button>
        <button 
          onClick={() => navigate('/player')}
          className={`p-2 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-colors ${location.pathname === '/player' ? 'bg-yellow-400 text-black' : 'text-zinc-500 hover:text-white'}`}
        >
          Player
        </button>
      </div>
    </div>
  );
}
