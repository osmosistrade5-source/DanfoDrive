import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Car, 
  Monitor, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Plus, 
  MapPin, 
  TrendingUp, 
  Wallet,
  ShieldCheck,
  Zap,
  ChevronRight,
  Play,
  Smartphone,
  BarChart3,
  Globe,
  Navigation
} from 'lucide-react';

// Components
import LandingPage from './components/LandingPage';
import AdvertiserDashboard from './components/AdvertiserDashboard';
import DriverPortal from './components/DriverPortal';
import AdPlayer from './components/AdPlayer';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import AdvertiserAuth from './components/AdvertiserAuth';
import DriverAuth from './components/DriverAuth';
import ProtectedRoute from './components/ProtectedRoute';
import AuthModal from './components/AuthModal';
import { MapSearch } from './components/MapSearch';

// Types
type User = {
  id: string;
  email: string;
  role: 'advertiser' | 'driver' | 'admin';
  full_name: string;
  wallet_balance: number;
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authRole, setAuthRole] = useState<'advertiser' | 'driver'>('advertiser');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Load user from local storage
  useEffect(() => {
    const savedUser = localStorage.getItem('danfo_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('danfo_user');
    localStorage.removeItem('danfo_token');
    setUser(null);
    navigate('/advertiser/auth');
  };

  const handleAuth = async (credentials: any, mode: 'login' | 'signup') => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();
      if (data.token) {
        localStorage.setItem('danfo_token', data.token);
        localStorage.setItem('danfo_user', JSON.stringify(data.user));
        setUser(data.user);
        setIsAuthModalOpen(false);
        
        // Redirect based on role
        if (data.user.role === 'advertiser') navigate('/advertiser');
        else if (data.user.role === 'driver') navigate('/driver');
        else if (data.user.role === 'admin') navigate('/admin');
      } else {
        alert(data.error || 'Auth failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
    const isActive = location.pathname === to;
    return (
      <button
        onClick={() => navigate(to)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
          isActive 
            ? 'bg-brand-yellow text-brand-black font-bold shadow-lg shadow-brand-yellow/20' 
            : 'text-zinc-400 hover:bg-white/5 hover:text-white'
        }`}
      >
        <Icon className="w-5 h-5" />
        {isSidebarOpen && <span>{label}</span>}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
      {/* Sidebar - Only for logged in users */}
      {user && location.pathname !== '/player' && (
        <motion.aside
          initial={false}
          animate={{ width: isSidebarOpen ? 260 : 80 }}
          className="h-screen sticky top-0 bg-zinc-900/50 backdrop-blur-xl border-r border-white/5 flex flex-col z-50"
        >
          <div className="p-6 flex items-center justify-between">
            {isSidebarOpen && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-yellow rounded-lg flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-brand-black" />
                </div>
                <span className="font-black text-xl tracking-tighter uppercase">DanfoDrive</span>
              </div>
            )}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-white/5 rounded-lg text-zinc-400"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex-1 px-4 py-6 space-y-2">
            {user.role === 'advertiser' && (
              <>
                <NavItem to="/advertiser" icon={LayoutDashboard} label="Dashboard" />
                <NavItem to="/advertiser/campaigns" icon={TrendingUp} label="Campaigns" />
                <NavItem to="/advertiser/map-search" icon={Navigation} label="Map Search" />
                <NavItem to="/advertiser/analytics" icon={BarChart3} label="Analytics" />
                <NavItem to="/advertiser/wallet" icon={Wallet} label="Wallet" />
              </>
            )}
            {user.role === 'driver' && (
              <>
                <NavItem to="/driver" icon={LayoutDashboard} label="Overview" />
                <NavItem to="/driver/earnings" icon={Wallet} label="Earnings" />
                <NavItem to="/driver/devices" icon={Smartphone} label="My Screens" />
              </>
            )}
            {user.role === 'admin' && (
              <>
                <NavItem to="/admin" icon={ShieldCheck} label="Admin Panel" />
                <NavItem to="/admin/devices" icon={Monitor} label="Devices" />
                <NavItem to="/admin/campaigns" icon={TrendingUp} label="All Campaigns" />
              </>
            )}
            <NavItem to="/player" icon={Play} label="Ad Player" />
          </div>

          <div className="p-4 border-t border-white/5">
            <div className={`flex items-center gap-3 p-3 rounded-xl bg-white/5 mb-4 ${!isSidebarOpen && 'justify-center'}`}>
              <div className="w-10 h-10 rounded-full bg-brand-yellow/10 flex items-center justify-center text-brand-yellow font-bold">
                {user.full_name[0]}
              </div>
              {isSidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{user.full_name}</p>
                  <p className="text-xs text-zinc-500 truncate uppercase tracking-widest">{user.role}</p>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all ${!isSidebarOpen && 'justify-center'}`}
            >
              <LogOut className="w-5 h-5" />
              {isSidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </motion.aside>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1">
          <Routes>
            <Route path="/" element={
              <LandingPage 
                onLogin={(role) => {
                  setAuthRole(role);
                  setAuthMode('login');
                  setIsAuthModalOpen(true);
                }} 
              />
            } />
            <Route path="/advertiser/auth" element={<AdvertiserAuth onAuthSuccess={setUser} />} />
            <Route 
              path="/advertiser/*" 
              element={
                <ProtectedRoute role="advertiser">
                  <AdvertiserDashboard user={user} setUser={setUser} />
                </ProtectedRoute>
              } 
            />
            <Route path="/advertiser/map-search" element={<MapSearch />} />
            <Route path="/driver/auth" element={<DriverAuth onAuthSuccess={setUser} />} />
            <Route 
              path="/driver/*" 
              element={
                <ProtectedRoute role="driver">
                  <DriverPortal user={user} />
                </ProtectedRoute>
              } 
            />
            <Route path="/admin/login" element={<AdminLogin onLoginSuccess={setUser} />} />
            <Route path="/admin/*" element={<AdminPanel user={user} />} />
            <Route path="/player" element={<AdPlayer />} />
          </Routes>
        </main>

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
                onClick={() => navigate('/advertiser/auth')}
                className="p-2 rounded-lg text-[10px] font-black uppercase tracking-tighter text-zinc-500 hover:text-white"
              >
                Advertiser Auth
              </button>
              <button 
                onClick={() => navigate('/driver/auth')}
                className="p-2 rounded-lg text-[10px] font-black uppercase tracking-tighter text-zinc-500 hover:text-white"
              >
                Driver Auth
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
    </div>
  );
}
