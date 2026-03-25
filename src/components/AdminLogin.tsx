import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Mail, Loader2, AlertCircle, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const remembered = localStorage.getItem('danfodrive_remember');
    const storedUser = localStorage.getItem('danfodrive_user');
    if (remembered === 'true' && storedUser && storedUser !== 'undefined') {
      try {
        const user = JSON.parse(storedUser);
        if (user.role === 'admin') {
          navigate('/admin/dashboard');
        }
      } catch (e) {
        console.error('Failed to parse user data', e);
      }
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. Basic Gmail validation
    if (!email.endsWith('@gmail.com')) {
      setError('Only Gmail accounts allowed');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/admin/login', { email, password });
      const { token, user } = response.data;

      // Store session
      localStorage.setItem('danfodrive_token', token);
      localStorage.setItem('danfodrive_user', JSON.stringify(user));
      
      if (rememberMe) {
        localStorage.setItem('danfodrive_remember', 'true');
      }

      // Redirect to dashboard
      navigate('/admin/dashboard');
    } catch (err: any) {
      const message = err.response?.data?.error || 'Authentication failed. Please check your credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 font-sans">
      {/* Background Accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-400/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-400/5 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 font-bold text-sm uppercase tracking-widest"
        >
          <ChevronLeft size={18} /> Back to Site
        </button>

        <div className="bg-zinc-900 border border-white/10 p-10 rounded-[2.5rem] shadow-2xl">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-yellow-400/20">
              <Shield className="text-black" size={32} />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter text-center">
              Admin Portal
            </h1>
            <p className="text-zinc-500 text-sm mt-2 font-medium">
              Secure access for DanfoDrive administrators
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-xs font-bold uppercase tracking-widest"
            >
              <AlertCircle size={18} />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block ml-1">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white focus:border-yellow-400 outline-none transition-all placeholder:text-zinc-700"
                  placeholder="admin@gmail.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block ml-1">
                Access Password
              </label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white focus:border-yellow-400 outline-none transition-all placeholder:text-zinc-700"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-md border transition-all ${rememberMe ? 'bg-yellow-400 border-yellow-400' : 'bg-black border-white/10 group-hover:border-white/20'}`} />
                  {rememberMe && <div className="absolute inset-0 flex items-center justify-center text-black font-bold text-[10px]">✓</div>}
                </div>
                <span className="text-xs font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors uppercase tracking-widest">Remember me</span>
              </label>
              <button type="button" className="text-xs font-bold text-yellow-400/50 hover:text-yellow-400 transition-colors uppercase tracking-widest">
                Forgot?
              </button>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 text-black py-5 rounded-2xl font-black text-lg mt-4 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-xl shadow-yellow-400/10 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Authenticating...
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-10 text-zinc-600 text-xs font-bold uppercase tracking-widest">
          Authorized Personnel Only • &copy; 2026 DanfoDrive
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
