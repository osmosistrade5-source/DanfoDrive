import React from 'react';
import { motion } from 'motion/react';
import { 
  Monitor, 
  MapPin, 
  TrendingUp, 
  Zap, 
  ShieldCheck, 
  Car, 
  Smartphone, 
  BarChart3, 
  Globe,
  ChevronRight,
  Play
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage({ onLogin }: { onLogin: (role: 'advertiser' | 'driver') => void }) {
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-brand-yellow rounded-xl flex items-center justify-center">
              <Monitor className="w-6 h-6 text-brand-black" />
            </div>
            <span className="font-black text-2xl tracking-tighter uppercase">DanfoDrive</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <button 
              onClick={() => scrollToSection('how-it-works')} 
              className="hover:text-white transition-colors"
            >
              How it Works
            </button>
            <button 
              onClick={() => scrollToSection('pricing')} 
              className="hover:text-white transition-colors"
            >
              Pricing
            </button>
            <button 
              onClick={() => navigate('/advertiser/auth')}
              className="bg-brand-yellow text-brand-black px-6 py-2.5 rounded-full font-bold hover:scale-105 transition-all"
            >
              Launch Campaign
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 text-brand-yellow text-xs font-bold uppercase tracking-widest mb-6">
              <Zap className="w-4 h-4" />
              Programmatic Transit Ads in Nigeria
            </div>
            <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-8 uppercase">
              Traffic to <span className="text-brand-yellow">Treasure.</span>
            </h1>
            <p className="text-xl text-zinc-400 mb-10 max-w-lg leading-relaxed">
              Deploy hyper-local, GPS-triggered ads on smart screens in Danfos, BRTs, and taxis. Reach millions of commuters daily with measurable ROI.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => navigate('/advertiser/auth')}
                className="bg-brand-yellow text-brand-black px-8 py-4 rounded-2xl font-black text-lg uppercase tracking-tight hover:scale-105 transition-all flex items-center gap-2"
              >
                Start Advertising <ChevronRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => navigate('/driver/auth')}
                className="bg-zinc-900 border border-white/10 text-white px-8 py-4 rounded-2xl font-black text-lg uppercase tracking-tight hover:bg-zinc-800 transition-all"
              >
                Become a Driver
              </button>
            </div>
            
            <div className="mt-12 flex items-center gap-8 border-t border-white/5 pt-8">
              <div>
                <p className="text-3xl font-black text-white">75k+</p>
                <p className="text-xs text-zinc-500 uppercase tracking-widest">Danfos in Lagos</p>
              </div>
              <div className="w-px h-10 bg-white/5" />
              <div>
                <p className="text-3xl font-black text-white">140m</p>
                <p className="text-xs text-zinc-500 uppercase tracking-widest">Daily Commute Mins</p>
              </div>
              <div className="w-px h-10 bg-white/5" />
              <div>
                <p className="text-3xl font-black text-white">₦20k+</p>
                <p className="text-xs text-zinc-500 uppercase tracking-widest">Driver Monthly Extra</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-[4/3] bg-zinc-900 rounded-[40px] border border-white/10 overflow-hidden shadow-2xl relative group">
              <img 
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=80" 
                alt="Danfo Interior" 
                className="w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
              
              {/* Floating Ad Mockup */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 aspect-video bg-black rounded-2xl border-4 border-zinc-800 shadow-2xl overflow-hidden">
                <div className="absolute top-2 right-2 bg-brand-yellow text-black text-[10px] font-black px-2 py-1 rounded uppercase">Live Ad</div>
                <img 
                  src="https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=800&q=80" 
                  alt="Indomie Ad" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div className="bg-black/80 backdrop-blur-md p-2 rounded-lg border border-white/10">
                    <p className="text-[10px] font-bold text-brand-yellow uppercase">Ikeja City Mall</p>
                    <p className="text-[8px] text-zinc-400">2.4km away</p>
                  </div>
                  <div className="w-12 h-12 bg-white p-1 rounded-lg">
                    <div className="w-full h-full bg-zinc-200" /> {/* Mock QR */}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-brand-yellow/20 blur-3xl rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-brand-yellow/10 blur-3xl rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="how-it-works" className="py-20 px-6 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">The Programmatic Edge</h2>
            <p className="text-zinc-500 max-w-2xl mx-auto">Traditional billboards are static and unmeasurable. DanfoDrive is dynamic, data-driven, and hyper-local.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={MapPin}
              title="GPS Triggered"
              description="Ads play only when vehicles enter your target geofence zones. No wasted impressions."
            />
            <FeatureCard 
              icon={BarChart3}
              title="Proof of Play"
              description="Real-time logs of every impression, including GPS coordinates and vehicle uptime."
            />
            <FeatureCard 
              icon={Smartphone}
              title="QR Rewards"
              description="Passengers scan dynamic QR codes for data discounts, driving direct engagement."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">Simple, Transparent Pricing</h2>
            <p className="text-zinc-500 max-w-2xl mx-auto">Choose the plan that fits your campaign goals. Pay only for verified impressions.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <PricingCard 
              tier="Starter"
              price="₦50,000"
              description="Perfect for small local businesses testing the waters."
              features={["5 Target Zones", "1,000 Verified Impressions", "Basic Analytics", "Standard Support"]}
            />
            <PricingCard 
              tier="Growth"
              price="₦250,000"
              description="Ideal for growing brands looking for city-wide reach."
              features={["25 Target Zones", "10,000 Verified Impressions", "Advanced Analytics", "Priority Support", "QR Code Integration"]}
              highlighted={true}
            />
            <PricingCard 
              tier="Enterprise"
              price="Custom"
              description="Full-scale programmatic campaigns for major agencies."
              features={["Unlimited Zones", "Volume Discounts", "Custom Reporting API", "Dedicated Account Manager", "Dynamic Creative Optimization"]}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-yellow rounded-lg flex items-center justify-center">
                <Monitor className="w-5 h-5 text-brand-black" />
              </div>
              <span className="font-black text-xl tracking-tighter uppercase">DanfoDrive</span>
            </div>
            <button 
              onClick={() => navigate('/admin/login')}
              className="text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-brand-yellow transition-colors"
            >
              Admin Login
            </button>
          </div>
          <p className="text-zinc-500 text-sm">© 2026 DanfoDrive. Built for the streets of Lagos.</p>
          <div className="flex gap-6 text-sm font-medium text-zinc-400">
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="p-8 rounded-[32px] bg-white/5 border border-white/10 hover:border-brand-yellow/30 transition-all group">
      <div className="w-14 h-14 bg-brand-yellow/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        <Icon className="w-8 h-8 text-brand-yellow" />
      </div>
      <h3 className="text-xl font-black uppercase tracking-tight mb-4">{title}</h3>
      <p className="text-zinc-500 leading-relaxed">{description}</p>
    </div>
  );
}

function PricingCard({ tier, price, description, features, highlighted = false }: { tier: string, price: string, description: string, features: string[], highlighted?: boolean }) {
  const navigate = useNavigate();
  return (
    <div className={`p-8 rounded-[32px] border transition-all ${highlighted ? 'bg-brand-yellow text-brand-black border-brand-yellow scale-105 shadow-2xl shadow-brand-yellow/20' : 'bg-white/5 border-white/10 text-white hover:border-brand-yellow/30'}`}>
      <div className="mb-8">
        <h3 className={`text-xs font-black uppercase tracking-[0.2em] mb-4 ${highlighted ? 'text-brand-black/60' : 'text-brand-yellow'}`}>{tier}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-black">{price}</span>
          {price !== 'Custom' && <span className={`text-xs font-bold ${highlighted ? 'text-brand-black/60' : 'text-zinc-500'}`}>/campaign</span>}
        </div>
      </div>
      <p className={`text-sm mb-8 font-medium ${highlighted ? 'text-brand-black/80' : 'text-zinc-400'}`}>{description}</p>
      <ul className="space-y-4 mb-10">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3 text-sm font-bold">
            <ShieldCheck className={`w-5 h-5 ${highlighted ? 'text-brand-black' : 'text-brand-yellow'}`} />
            {feature}
          </li>
        ))}
      </ul>
      <button 
        onClick={() => navigate('/advertiser/auth')}
        className={`w-full py-4 rounded-2xl font-black uppercase tracking-tight transition-all ${highlighted ? 'bg-brand-black text-brand-yellow hover:scale-[1.02]' : 'bg-white/10 text-white hover:bg-brand-yellow hover:text-brand-black'}`}
      >
        Get Started
      </button>
    </div>
  );
}
