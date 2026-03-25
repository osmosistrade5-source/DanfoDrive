import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Play, Shield, Zap, MapPin, TrendingUp, CheckCircle2, QrCode, Activity } from 'lucide-react';
import api from '../services/api';

export const LandingPage = ({ onGetStarted, onLogin }: { onGetStarted: (role: string) => void, onLogin: (role: string) => void }) => {
  const [budget, setBudget] = useState(50000);
  const reach = budget; // 1 Naira = 1 Impression as per PRD example

  const [onlineCount, setOnlineCount] = useState(52);

  useEffect(() => {
    api.get('/devices')
      .then(res => {
        const data = res.data;
        const online = data.filter((d: any) => d.status === 'online').length;
        setOnlineCount(online > 0 ? online : 52); // Fallback to 52 for demo if none online
      })
      .catch(() => setOnlineCount(52));
  }, []);

  return (
    <div className="bg-black min-h-screen text-white selection:bg-yellow-400 selection:text-black">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center text-black font-black">D</div>
            <span className="text-xl font-black tracking-tighter">DANFODRIVE</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <button 
              onClick={() => onLogin('advertiser')}
              className="hover:text-white transition-colors"
            >
              Login
            </button>
            <button 
              onClick={() => onGetStarted('advertiser')}
              className="bg-white text-black px-5 py-2 rounded-full font-bold hover:bg-yellow-400 transition-colors"
            >
              Launch Campaign
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="inline-block px-4 py-1.5 bg-yellow-400/10 text-yellow-400 rounded-full text-xs font-bold tracking-widest uppercase mb-6 border border-yellow-400/20">
              Programmatic Transit OOH
            </span>
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 pr-10">
              THE HEARTBEAT OF <span className="text-yellow-400">LAGOS</span> ADVERTISING.
            </h1>
            <p className="text-xl text-zinc-400 mb-10 leading-relaxed max-w-2xl">
              Reach millions of commuters daily with hyper-local, GPS-triggered ads on Lagos' most iconic transport network.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => onGetStarted('advertiser')}
                className="bg-yellow-400 text-black px-8 py-4 rounded-2xl font-black text-lg flex items-center gap-2 hover:scale-105 transition-transform"
              >
                Start Advertising <ChevronRight size={24} />
              </button>
              <button 
                onClick={() => onGetStarted('driver')}
                className="bg-zinc-900 border border-zinc-800 text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-zinc-800 transition-colors"
              >
                Earn as a Driver
              </button>
            </div>
          </motion.div>
        </div>

        {/* Background Visuals */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-l from-yellow-400/20 to-transparent" />
          <img 
            src="https://picsum.photos/seed/lagos-traffic/1000/1000" 
            alt="Lagos Traffic" 
            className="w-full h-full object-cover grayscale"
            referrerPolicy="no-referrer"
          />
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 px-6 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black tracking-tight mb-4">How it Works</h2>
            <p className="text-zinc-500 max-w-2xl mx-auto">Connecting the dots between Lagos traffic and digital advertising.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: '01', title: 'Upload Creative', desc: 'Upload your video or image ad to our dashboard and set your target geofences.' },
              { step: '02', title: 'GPS Triggered', desc: 'Our smart screens detect when a vehicle enters your target area and plays your ad.' },
              { step: '03', title: 'Real-time ROI', desc: 'Track every impression with proof-of-play logs and GPS coordinates in real-time.' }
            ].map((item, i) => (
              <div key={i} className="relative p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl">
                <span className="text-6xl font-black text-yellow-400/10 absolute top-4 right-8">{item.step}</span>
                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                <p className="text-zinc-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Calculator */}
      <section id="pricing" className="py-24 px-6 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-black tracking-tight mb-6">Predictable Reach. <br/>Measurable ROI.</h2>
              <p className="text-zinc-400 text-lg mb-8">
                Stop guessing your billboard's reach. Our programmatic platform gives you exact impression counts and proof-of-play logs.
              </p>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-yellow-400/10 text-yellow-400 rounded-lg"><Zap size={24}/></div>
                  <div>
                    <h4 className="font-bold text-lg">GPS Triggered</h4>
                    <p className="text-zinc-500">Ads play only when your target audience is nearby.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-yellow-400/10 text-yellow-400 rounded-lg"><Shield size={24}/></div>
                  <div>
                    <h4 className="font-bold text-lg">Proof of Play</h4>
                    <p className="text-zinc-500">Real-time logs for every second your ad is on screen.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-3xl shadow-2xl">
              <h3 className="text-2xl font-bold mb-8">Reach Calculator</h3>
              <div className="space-y-10">
                <div className="p-4 bg-yellow-400/5 border border-yellow-400/20 rounded-2xl mb-8">
                  <p className="text-xs font-black uppercase tracking-widest text-yellow-400 mb-1">Platform Access Fee</p>
                  <p className="text-sm text-zinc-400">Monthly subscription starts from <span className="text-white font-bold">₦50,000</span>. This unlocks the dashboard and targeting tools.</p>
                </div>
                <div>
                  <div className="flex justify-between mb-4">
                    <label className="text-zinc-400 font-medium">Campaign Spend</label>
                    <span className="text-yellow-400 font-mono font-bold text-xl">₦{budget.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" 
                    min="10000" 
                    max="1000000" 
                    step="10000"
                    value={budget}
                    onChange={(e) => setBudget(parseInt(e.target.value))}
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 bg-black/50 rounded-2xl border border-zinc-800">
                    <p className="text-zinc-500 text-xs uppercase font-black tracking-widest mb-2">Est. Impressions</p>
                    <p className="text-3xl font-black text-white">{reach.toLocaleString()}</p>
                  </div>
                  <div className="p-6 bg-black/50 rounded-2xl border border-zinc-800">
                    <p className="text-zinc-500 text-xs uppercase font-black tracking-widest mb-2">Est. Reach</p>
                    <p className="text-3xl font-black text-white">{(reach * 1.5).toLocaleString()}</p>
                  </div>
                </div>

                <button 
                  onClick={() => onGetStarted('advertiser')}
                  className="w-full bg-yellow-400 text-black py-4 rounded-2xl font-black text-lg hover:scale-[1.02] transition-transform"
                >
                  Get Started Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Table */}
      <section className="py-24 px-6 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black tracking-tight mb-4">Simple, Transparent Pricing</h2>
            <p className="text-zinc-500">Choose the plan that fits your advertising needs.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Starter', price: '50,000', drivers: '20', features: ['Dashboard Access', 'Route Targeting', 'Basic Analytics'] },
              { name: 'Growth', price: '150,000', drivers: '100', features: ['Priority Support', 'Advanced Analytics', 'Custom Scheduling'], popular: true },
              { name: 'Enterprise', price: 'Custom', drivers: 'Unlimited', features: ['API Access', 'Dedicated Account Manager', 'Bulk Discounts'] }
            ].map((plan, i) => (
              <div key={i} className={`p-10 rounded-[2.5rem] border ${plan.popular ? 'bg-zinc-900 border-yellow-400 shadow-2xl shadow-yellow-400/5' : 'bg-zinc-950 border-zinc-800'} flex flex-col`}>
                {plan.popular && <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400 mb-4 inline-block">Most Popular</span>}
                <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-black">₦{plan.price}</span>
                  {plan.price !== 'Custom' && <span className="text-zinc-500 font-bold">/mo</span>}
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  <li className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400" /> Up to {plan.drivers} drivers
                  </li>
                  {plan.features.map((f, j) => (
                    <li key={j} className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-400" /> {f}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => onGetStarted('advertiser')}
                  className={`w-full py-4 rounded-2xl font-black transition-all ${plan.popular ? 'bg-yellow-400 text-black hover:scale-105' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
          <p className="text-center mt-12 text-zinc-500 text-sm">
            * All plans include a base ₦10 per minute ad playback fee.
          </p>
        </div>
      </section>

      {/* Live Fleet Activity */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-black tracking-tight mb-4">Live Fleet Activity</h2>
          <p className="text-zinc-500">Real-time visualization of active screens across Lagos.</p>
        </div>
        <div className="max-w-5xl mx-auto aspect-[16/9] bg-zinc-900 rounded-[3rem] border-[12px] border-zinc-800 overflow-hidden relative shadow-2xl shadow-yellow-400/5">
          {/* Thematic Background - Danfo and BRT on Lagos road */}
          <div className="absolute inset-0">
             <img 
               src="https://picsum.photos/seed/danfo-drive-lagos/1200/800" 
               className="w-full h-full object-cover" 
               referrerPolicy="no-referrer" 
               alt="Danfo and BRT on Lagos road"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          </div>
          
          {/* Pulsing Dots representing active vehicles */}
          {[...Array(onlineCount > 20 ? 20 : onlineCount)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 bg-yellow-400 rounded-full"
              style={{
                top: `${20 + Math.random() * 60}%`,
                left: `${20 + Math.random() * 60}%`,
              }}
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-75" />
            </motion.div>
          ))}
          
          {/* Floating Status Card */}
          <div className="absolute bottom-12 left-12 bg-black/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 flex items-center gap-6 shadow-2xl">
            <div className="flex -space-x-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-12 h-12 rounded-full border-4 border-black bg-zinc-800 flex items-center justify-center overflow-hidden">
                  <img src={`https://i.pravatar.cc/150?u=${i + 10}`} referrerPolicy="no-referrer" alt="Driver" />
                </div>
              ))}
              <div className="w-12 h-12 rounded-full border-4 border-black bg-yellow-400 flex items-center justify-center text-black font-black text-xs">
                +{onlineCount > 3 ? onlineCount - 3 : 0}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                <p className="text-xl font-black tracking-tight">{onlineCount} Drivers Online</p>
              </div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Active in Lagos State</p>
            </div>
          </div>

          {/* Location Badge */}
          <div className="absolute top-12 right-12 bg-yellow-400 text-black px-6 py-3 rounded-full font-black text-sm flex items-center gap-2 shadow-xl">
            <MapPin size={16} />
            LIVE: IKEJA / LEKKI / VI
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-400 rounded flex items-center justify-center text-black font-black text-xs">D</div>
            <span className="font-black tracking-tighter">DANFODRIVE</span>
          </div>
          <p className="text-zinc-600 text-sm">© 2026 DanfoDrive. All rights reserved. Lagos, Nigeria.</p>
          <div className="flex gap-6 text-zinc-500 text-sm">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
