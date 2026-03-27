import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, Building2, ArrowRight, Loader2, User, ChevronLeft } from 'lucide-react';

interface AdvertiserAuthProps {
  onAuthSuccess: (user: any) => void;
}

export default function AdvertiserAuth({ onAuthSuccess }: AdvertiserAuthProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/advertiser';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    }

    setIsLoading(true);

    const endpoint = mode === 'signup' ? '/api/advertisers/register' : '/api/advertisers/login';
    const payload = mode === 'signup' 
      ? { email, password, company_name: companyName, full_name: fullName }
      : { email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('danfo_token', data.token);
        localStorage.setItem('danfo_user', JSON.stringify(data.user));
        onAuthSuccess(data.user);
        navigate(from, { replace: true });
      } else {
        setError(data.error || `${mode === 'signup' ? 'Registration' : 'Login'} failed`);
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-yellow/5 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Back to Home</span>
        </button>

        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-brand-yellow rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand-yellow/20">
            <Building2 className="w-8 h-8 text-brand-black" />
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">
            {mode === 'login' ? 'Welcome Back' : 'Join the Network'}
          </h1>
          <p className="text-zinc-500 font-medium">
            {mode === 'login' ? 'Manage your campaigns and track results.' : 'Reach millions of commuters across Nigeria.'}
          </p>
        </div>

        {/* Toggle Switch */}
        <div className="flex p-1 bg-zinc-900 rounded-2xl mb-8 border border-white/5">
          <button 
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${mode === 'login' ? 'bg-brand-yellow text-brand-black shadow-lg shadow-brand-yellow/10' : 'text-zinc-500 hover:text-white'}`}
          >
            Login
          </button>
          <button 
            onClick={() => { setMode('signup'); setError(''); }}
            className={`flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${mode === 'signup' ? 'bg-brand-yellow text-brand-black shadow-lg shadow-brand-yellow/10' : 'text-zinc-500 hover:text-white'}`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-bold overflow-hidden"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            {mode === 'signup' && (
              <>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input 
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full bg-zinc-900 border border-white/10 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-brand-yellow transition-all"
                  />
                </div>

                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input 
                    type="text"
                    placeholder="Company Name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    className="w-full bg-zinc-900 border border-white/10 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-brand-yellow transition-all"
                  />
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input 
                type="email"
                placeholder="Work Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-zinc-900 border border-white/10 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-brand-yellow transition-all"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input 
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-zinc-900 border border-white/10 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-brand-yellow transition-all"
              />
            </div>

            {mode === 'signup' && (
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input 
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-zinc-900 border border-white/10 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-brand-yellow transition-all"
                />
              </div>
            )}
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-yellow text-brand-black py-4 rounded-2xl font-black uppercase tracking-tight hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100 mt-4"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {mode === 'login' ? 'Login' : 'Create Account'} <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-8 text-zinc-500 font-medium">
          {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
          <button 
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
            className="text-brand-yellow hover:underline font-bold"
          >
            {mode === 'login' ? 'Sign up here' : 'Login here'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
