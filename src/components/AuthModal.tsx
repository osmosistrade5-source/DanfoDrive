import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  ChevronRight, 
  Monitor, 
  Car, 
  TrendingUp, 
  Zap, 
  ShieldCheck 
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuth: (credentials: any, mode: 'login' | 'signup') => void;
  initialMode?: 'login' | 'signup';
  initialRole?: 'advertiser' | 'driver';
}

export default function AuthModal({ isOpen, onClose, onAuth, initialMode = 'login', initialRole = 'advertiser' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [role, setRole] = useState<'advertiser' | 'driver'>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAuth({ email, password, name, role }, mode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg bg-zinc-900 rounded-[40px] border border-white/10 overflow-hidden shadow-2xl"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-brand-yellow rounded-xl flex items-center justify-center">
              <Monitor className="w-6 h-6 text-brand-black" />
            </div>
            <span className="font-black text-2xl tracking-tighter uppercase">DanfoDrive</span>
          </div>

          <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">
            {mode === 'login' ? 'Welcome Back' : 'Join the Network'}
          </h2>
          <p className="text-zinc-500 mb-8 font-medium">
            {mode === 'login' ? 'Access your transit ad-network dashboard.' : 'Start reaching millions of commuters today.'}
          </p>

          {/* Role Selector */}
          <div className="flex p-1 bg-black rounded-2xl mb-8 border border-white/5">
            <button
              onClick={() => setRole('advertiser')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black uppercase tracking-tighter text-xs transition-all ${
                role === 'advertiser' ? 'bg-brand-yellow text-brand-black shadow-lg shadow-brand-yellow/20' : 'text-zinc-500 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" /> Advertiser
            </button>
            <button
              onClick={() => setRole('driver')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black uppercase tracking-tighter text-xs transition-all ${
                role === 'driver' ? 'bg-brand-yellow text-brand-black shadow-lg shadow-brand-yellow/20' : 'text-zinc-500 hover:text-white'
              }`}
            >
              <Car className="w-4 h-4" /> Driver
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white focus:border-brand-yellow outline-none transition-all placeholder:text-zinc-700"
                  required
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white focus:border-brand-yellow outline-none transition-all placeholder:text-zinc-700"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white focus:border-brand-yellow outline-none transition-all placeholder:text-zinc-700"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-brand-yellow text-brand-black py-4 rounded-2xl font-black uppercase tracking-tight text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
            >
              {mode === 'login' ? 'Sign In' : 'Create Account'} <ChevronRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-sm font-bold text-zinc-500 hover:text-brand-yellow transition-colors"
            >
              {mode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
