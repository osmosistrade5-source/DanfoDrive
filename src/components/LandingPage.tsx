import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Play, Shield, Zap, MapPin, TrendingUp } from 'lucide-react';

export const LandingPage = ({ onGetStarted }: { onGetStarted: (role: string) => void }) => {
  const [budget, setBudget] = useState(50000);
  const reach = budget; // 1 Naira = 1 Impression as per PRD example

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
                <div>
                  <div className="flex justify-between mb-4">
                    <label className="text-zinc-400 font-medium">Monthly Budget</label>
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

      {/* Live Fleet Map Placeholder */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-black tracking-tight mb-4">Live Fleet Activity</h2>
          <p className="text-zinc-500">Real-time visualization of active screens across Lagos.</p>
        </div>
        <div className="max-w-5xl mx-auto aspect-[16/9] bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden relative">
          {/* Simulated Map */}
          <div className="absolute inset-0 opacity-40 grayscale">
             <img src="https://picsum.photos/seed/lagos-map/1200/800" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          
          {/* Pulsing Dots */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-yellow-400 rounded-full"
              style={{
                top: `${20 + Math.random() * 60}%`,
                left: `${20 + Math.random() * 60}%`,
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
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

          <div className="absolute bottom-8 left-8 bg-black/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-4">
            <div className="flex -space-x-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-zinc-800 flex items-center justify-center overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?u=${i}`} referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
            <p className="text-sm font-bold">52 Drivers Online in Lagos</p>
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
