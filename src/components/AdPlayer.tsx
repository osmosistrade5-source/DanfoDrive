import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Navigation, 
  Wifi, 
  Battery, 
  Signal, 
  MapPin, 
  Clock, 
  Smartphone,
  Zap,
  ChevronRight,
  QrCode,
  Monitor
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function AdPlayer() {
  const [currentAd, setCurrentAd] = useState<any>(null);
  const [ads, setAds] = useState<any[]>([]);
  const [location, setLocation] = useState({ lat: 6.5244, lng: 3.3792 }); // Lagos
  const [isSimulating, setIsSimulating] = useState(false);
  const [deviceId] = useState('d1');
  const [time, setTime] = useState(new Date());

  // Simulation points (Lagos route)
  const route = [
    { lat: 6.5244, lng: 3.3792, name: 'Ikeja' },
    { lat: 6.5967, lng: 3.3444, name: 'Agege' },
    { lat: 6.4549, lng: 3.4245, name: 'Lekki' },
    { lat: 6.4281, lng: 3.4215, name: 'Victoria Island' },
  ];
  const [routeIdx, setRouteIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Heartbeat & Ad Fetching
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await fetch('/api/player/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId, ...location }),
        });
        const data = await res.json();
        setAds(data.ads || []);
      } catch (err) {
        console.error('Heartbeat failed', err);
      }
    };

    fetchAds();
    const interval = setInterval(fetchAds, 60000); // Heartbeat every 60s
    return () => clearInterval(interval);
  }, [location]);

  // Ad Rotation
  useEffect(() => {
    if (ads.length === 0) return;
    
    let idx = 0;
    const rotate = () => {
      const ad = ads[idx];
      setCurrentAd(ad);
      
      // Log Impression
      fetch('/api/player/impression', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, adId: ad.id, ...location }),
      });

      idx = (idx + 1) % ads.length;
      setTimeout(rotate, ad.duration * 1000);
    };

    rotate();
  }, [ads]);

  // Location Simulation
  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      setRouteIdx(prev => (prev + 1) % route.length);
      setLocation({ lat: route[routeIdx].lat, lng: route[routeIdx].lng });
    }, 5000);
    return () => clearInterval(interval);
  }, [isSimulating, routeIdx]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">
      {/* Tablet Frame */}
      <div className="w-full h-full max-w-[1024px] max-h-[768px] bg-zinc-900 rounded-[40px] border-[12px] border-zinc-800 shadow-2xl relative flex flex-col overflow-hidden">
        
        {/* Status Bar */}
        <div className="h-10 px-8 flex items-center justify-between bg-black/40 backdrop-blur-md z-20">
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
            <div className="flex items-center gap-1"><Signal className="w-3 h-3" /> 4G</div>
            <div className="flex items-center gap-1"><Wifi className="w-3 h-3" /> DanfoDrive_Free</div>
          </div>
          <div className="text-xs font-black text-white">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
            <div className="flex items-center gap-1">82% <Battery className="w-3 h-3" /></div>
          </div>
        </div>

        {/* Main Ad Area */}
        <div className="flex-1 relative bg-zinc-950">
          <AnimatePresence mode="wait">
            {currentAd ? (
              <motion.div
                key={currentAd.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute inset-0"
              >
                <img 
                  src={currentAd.asset_url} 
                  alt="Ad" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                
                {/* QR Overlay */}
                <div className="absolute bottom-10 right-10 flex flex-col items-center gap-4">
                  <div className="bg-white p-4 rounded-3xl shadow-2xl scale-110">
                    <QRCodeSVG value={currentAd.qr_code_url} size={120} />
                  </div>
                  <div className="bg-brand-yellow text-brand-black px-6 py-2 rounded-full font-black text-sm uppercase tracking-tighter shadow-xl">
                    Scan for Reward
                  </div>
                </div>

                {/* Location Badge */}
                <div className="absolute top-10 left-10 flex items-center gap-3 bg-black/60 backdrop-blur-xl p-4 rounded-2xl border border-white/10">
                  <div className="w-10 h-10 bg-brand-yellow rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-brand-black" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-brand-yellow uppercase tracking-widest">Currently Near</p>
                    <p className="text-xl font-black text-white uppercase tracking-tighter">{route[routeIdx].name}</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-brand-yellow/10 rounded-3xl flex items-center justify-center mb-6 animate-pulse">
                  <Monitor className="w-10 h-10 text-brand-yellow" />
                </div>
                <p className="text-zinc-500 font-black uppercase tracking-widest">Waiting for Ads...</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Navigation (Tablet Bar) */}
        <div className="h-16 px-10 flex items-center justify-between bg-black/80 backdrop-blur-xl border-t border-white/5 z-20">
          <div className="flex items-center gap-6">
            <button className="p-2 text-zinc-500 hover:text-white transition-colors"><Navigation className="w-6 h-6" /></button>
            <button className="p-2 text-zinc-500 hover:text-white transition-colors"><Zap className="w-6 h-6" /></button>
          </div>
          <div className="w-32 h-1.5 bg-zinc-800 rounded-full" />
          <div className="flex items-center gap-6">
            <button className="p-2 text-zinc-500 hover:text-white transition-colors"><Smartphone className="w-6 h-6" /></button>
          </div>
        </div>
      </div>

      {/* Simulation Controls (Floating) */}
      <div className="fixed top-8 right-8 bg-zinc-900/80 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl w-64 z-[100]">
        <h3 className="text-xs font-black text-brand-yellow uppercase tracking-widest mb-4">Player Simulator</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold">Status</span>
            <span className="flex items-center gap-1 text-green-400 text-xs font-black uppercase">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> Online
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold">Location</span>
            <span className="text-xs text-zinc-400">{route[routeIdx].name}</span>
          </div>
          <button 
            onClick={() => setIsSimulating(!isSimulating)}
            className={`w-full py-3 rounded-xl font-black uppercase tracking-tighter text-sm transition-all ${
              isSimulating ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-brand-yellow text-brand-black'
            }`}
          >
            {isSimulating ? 'Stop Simulation' : 'Start Simulation'}
          </button>
          <p className="text-[10px] text-zinc-500 leading-tight">
            Simulation moves the vehicle through Lagos to trigger location-based ads.
          </p>
        </div>
      </div>
    </div>
  );
}
