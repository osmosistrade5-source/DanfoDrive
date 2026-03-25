import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Mail, Loader2, AlertCircle, ChevronLeft, UserPlus, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AdminSetup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [setupDone, setSetupDone] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSetup = async () => {
      try {
        // We can't directly check the count from client easily without a specific endpoint
        // but we can try to call a "check" endpoint or just let the first attempt fail.
        // For better UX, let's assume the backend check is enough.
        // However, we can add a small hint if the table is missing.
      } catch (e) {
        console.error('Setup check failed', e);
      }
    };
    checkSetup();
  }, []);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. Basic Gmail validation
    if (!email.endsWith('@gmail.com')) {
      setError('Only Gmail accounts allowed');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      await api.post('/admin/setup', { email, password, name });
      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/login');
      }, 3000);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Setup failed. An admin might already exist.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-900 border border-white/10 p-12 rounded-[3rem] text-center max-w-md shadow-2xl"
        >
          <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="text-black" size={40} />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tighter mb-4">Setup Complete</h2>
          <p className="text-zinc-500 font-medium mb-8">
            Your admin account has been created successfully. Redirecting to login...
          </p>
          <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 3 }}
              className="h-full bg-emerald-500"
            />
          </div>
        </motion.div>
      </div>
    );
  }

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
              <UserPlus className="text-black" size={32} />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter text-center">
              Initial Admin Setup
            </h1>
            <p className="text-zinc-500 text-sm mt-2 font-medium text-center">
              Create the master administrator account for DanfoDrive
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

          <form onSubmit={handleSetup} className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block ml-1">
                Full Name
              </label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-yellow-400 outline-none transition-all placeholder:text-zinc-700"
                placeholder="Super Admin"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block ml-1">
                Admin Email (Gmail Only)
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
                Master Password
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

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 text-black py-5 rounded-2xl font-black text-lg mt-4 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-xl shadow-yellow-400/10 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Creating Account...
                </>
              ) : (
                'Create Admin Account'
              )}
            </button>
          </form>
        </div>

        <div className="mt-10 p-6 bg-yellow-400/5 border border-yellow-400/10 rounded-3xl text-center">
          <p className="text-[10px] font-black text-yellow-400 uppercase tracking-widest mb-2">Security Note</p>
          <p className="text-xs text-zinc-500 font-medium">
            This setup page is only available until the first admin account is created. Once set, it will be disabled.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminSetup;
