import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import api from './services/api';
import { LandingPage } from './components/LandingPage';
import { AdvertiserDashboard } from './components/AdvertiserDashboard';
import { DriverPortal } from './components/DriverPortal';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import AdminSetup from './components/AdminSetup';
import { QrCode, Activity, MapPin, ChevronLeft, LogIn, UserPlus } from 'lucide-react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { APIProvider } from '@vis.gl/react-google-maps';

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
const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role: string }) => {
  const token = localStorage.getItem('danfodrive_token');
  const userStr = localStorage.getItem('danfodrive_user');
  const user = (userStr && userStr !== 'undefined') ? JSON.parse(userStr) : null;

  if (!token || !user) {
    return <Navigate to={role === 'admin' ? "/admin/login" : "/"} replace />;
  }

  if (role !== 'any' && user.role !== role && user.role !== 'admin') {
    return <Navigate to={role === 'admin' ? "/admin/login" : "/"} replace />;
  }

  return <>{children}</>;
};

// --- Auth Modal ---
const AuthModal = ({ isOpen, onClose, onAuth, initialMode = 'login', initialRole = 'advertiser' }: { 
  isOpen: boolean, 
  onClose: () => void, 
  onAuth: (data: any, mode: 'login' | 'signup') => void,
  initialMode?: 'login' | 'signup',
  initialRole?: string
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState(initialRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMode(initialMode);
    setRole(initialRole);
    setError('');
  }, [isOpen, initialMode, initialRole]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'signup') {
        await onAuth({ email, password, name, role }, 'signup');
      } else {
        await onAuth({ email, password }, 'login');
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 border border-white/10 p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black tracking-tighter text-white">
            {mode === 'login' ? 'Welcome Back' : 'Join DanfoDrive'}
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <Activity size={24} className="rotate-45" />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold uppercase tracking-widest">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-yellow-400 outline-none transition-colors"
                placeholder="John Doe"
                required
              />
            </div>
          )}
          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-yellow-400 outline-none transition-colors"
              placeholder="name@example.com"
              required
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-yellow-400 outline-none transition-colors"
              placeholder="••••••••"
              required
            />
          </div>
          {mode === 'signup' && (
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">I am a...</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  type="button"
                  onClick={() => setRole('advertiser')}
                  className={`py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${role === 'advertiser' ? 'bg-yellow-400 text-black' : 'bg-black text-zinc-500 border border-white/10'}`}
                >
                  Advertiser
                </button>
                <button 
                  type="button"
                  onClick={() => setRole('driver')}
                  className={`py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${role === 'driver' ? 'bg-yellow-400 text-black' : 'bg-black text-zinc-500 border border-white/10'}`}
                >
                  Driver
                </button>
              </div>
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 text-black py-4 rounded-2xl font-black text-lg mt-4 hover:scale-[1.02] transition-transform disabled:opacity-50"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-sm font-bold text-zinc-500 hover:text-white transition-colors"
          >
            {mode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Login"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// --- Ad Player Component (The "IoT" View) ---
const AdPlayer = ({ onBack }: { onBack: () => void }) => {
  const [currentAd, setCurrentAd] = useState<any>(null);
  const [location, setLocation] = useState({ lat: 6.5244, lng: 3.3792 }); // Lagos default
  const [speed, setSpeed] = useState(45); // km/h
  const [isLogging, setIsLogging] = useState(false);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const res = await api.get(`/ads/active?lat=${location.lat}&lng=${location.lng}`);
        const ads = res.data;
        if (ads.length > 0) {
          const selected = ads[Math.floor(Math.random() * ads.length)];
          setCurrentAd(selected);
        }
      } catch (err) {
        console.error("Failed to fetch ad", err);
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
          await api.post('/impressions/log', {
            deviceId: 'DF-2026-001', // Mock device ID
            adId: currentAd.id,
            lat: location.lat,
            lng: location.lng,
            speed: speed
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

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authRole, setAuthRole] = useState('advertiser');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem('danfodrive_user');
    if (storedUser === 'undefined') {
      localStorage.removeItem('danfodrive_user');
      localStorage.removeItem('danfodrive_token');
      return;
    }
    if (storedUser && storedUser !== 'undefined') {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem('danfodrive_user');
      }
    }
  }, []);

  const handleAuth = async (data: any, mode: 'login' | 'signup') => {
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const response = await api.post(endpoint, data);
      const { token, user } = response.data;
      
      localStorage.setItem('danfodrive_token', token);
      if (user) {
        localStorage.setItem('danfodrive_user', JSON.stringify(user));
        setUser(user);
      }

      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'advertiser') navigate('/advertiser');
      else if (user.role === 'driver') navigate('/driver');
    } catch (error) {
      console.error('Auth failed:', error);
      throw error;
    }
  };

  const handleLoginClick = (role: string = 'advertiser') => {
    setAuthRole(role);
    setAuthMode('login');
    setIsAuthModalOpen(true);
  };

  const handleSignupClick = (role: string = 'advertiser') => {
    setAuthRole(role);
    setAuthMode('signup');
    setIsAuthModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('danfodrive_token');
    localStorage.removeItem('danfodrive_user');
    setUser(null);
    navigate('/');
  };

  return (
    <APIProvider apiKey={API_KEY || 'DUMMY_KEY'} version="weekly">
      <div className="min-h-screen bg-black">
        <Routes>
          <Route path="/" element={<LandingPage onGetStarted={handleSignupClick} onLogin={handleLoginClick} />} />
          <Route 
            path="/advertiser" 
            element={
              <ProtectedRoute role="advertiser">
                <AdvertiserDashboard onLogout={handleLogout} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/driver" 
            element={
              <ProtectedRoute role="driver">
                <DriverPortal onLogout={handleLogout} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard onLogout={handleLogout} />
              </ProtectedRoute>
            } 
          />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/setup-admin" element={<AdminSetup />} />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard onLogout={handleLogout} />
              </ProtectedRoute>
            } 
          />
          <Route path="/player" element={<AdPlayer onBack={() => navigate('/')} />} />
        </Routes>

        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          onAuth={handleAuth}
          initialMode={authMode}
          initialRole={authRole}
        />

        {/* Demo Role Switcher (Floating) */}
        <div className="fixed bottom-8 right-8 z-[200] flex gap-2 p-2 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
          <button 
            onClick={() => navigate('/')}
            className={`p-2 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-colors ${location.pathname === '/' ? 'bg-yellow-400 text-black' : 'text-zinc-500 hover:text-white'}`}
          >
            Home
          </button>
          {!user ? (
            <>
              <button 
                onClick={() => handleAuth({ email: 'advertiser@danfodrive.com', password: 'password' }, 'login')}
                className="p-2 rounded-lg text-[10px] font-black uppercase tracking-tighter text-zinc-500 hover:text-white"
              >
                Login Ads
              </button>
              <button 
                onClick={() => handleAuth({ email: 'driver@danfodrive.com', password: 'password' }, 'login')}
                className="p-2 rounded-lg text-[10px] font-black uppercase tracking-tighter text-zinc-500 hover:text-white"
              >
                Login Driver
              </button>
              <button 
                onClick={() => navigate('/admin/login')}
                className="p-2 rounded-lg text-[10px] font-black uppercase tracking-tighter text-zinc-500 hover:text-white"
              >
                Admin Login
              </button>
            </>
          ) : (
            <button 
              onClick={handleLogout}
              className="p-2 rounded-lg text-[10px] font-black uppercase tracking-tighter text-zinc-500 hover:text-red-400"
            >
              Logout
            </button>
          )}
          <button 
            onClick={() => navigate('/player')}
            className={`p-2 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-colors ${location.pathname === '/player' ? 'bg-yellow-400 text-black' : 'text-zinc-500 hover:text-white'}`}
          >
            Player
          </button>
        </div>
      </div>
    </APIProvider>
  );
}
