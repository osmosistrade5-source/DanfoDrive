import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Mail, Lock, ChevronRight, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. Basic validation
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('danfo_token', data.token);
        localStorage.setItem('danfo_user', JSON.stringify(data.user));
        navigate('/admin');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg bg-zinc-900 rounded-[40px] border border-white/10 overflow-hidden shadow-2xl"
      >
        <div className="p-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-brand-yellow rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-brand-black" />
            </div>
            <span className="font-black text-2xl tracking-tighter uppercase">DanfoDrive Admin</span>
          </div>

          <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Admin Login</h2>
          <p className="text-zinc-500 mb-8 font-medium">Secure access to the DanfoDrive management system.</p>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-sm font-bold mb-8">
              <AlertCircle className="w-5 h-5" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="email"
                placeholder="admin@gmail.com"
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
                placeholder="Master Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white focus:border-brand-yellow outline-none transition-all placeholder:text-zinc-700"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-yellow text-brand-black py-4 rounded-2xl font-black uppercase tracking-tight text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'} <ChevronRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
