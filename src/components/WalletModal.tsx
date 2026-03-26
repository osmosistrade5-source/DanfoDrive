import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, DollarSign, ArrowUpRight, ArrowDownLeft, Loader2 } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'topup' | 'withdraw';
  onSuccess: (amount: number, type: 'topup' | 'withdraw') => void;
}

export default function WalletModal({ isOpen, onClose, type, onSuccess }: WalletModalProps) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(parseFloat(amount))) return;
    
    setLoading(true);
    // Simulate transaction
    setTimeout(() => {
      onSuccess(parseFloat(amount), type);
      setLoading(false);
      setAmount('');
      onClose();
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  type === 'topup' ? 'bg-green-500/10 text-green-500' : 'bg-brand-yellow/10 text-brand-yellow'
                }`}>
                  {type === 'topup' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight">
                    {type === 'topup' ? 'Top Up Wallet' : 'Withdraw Funds'}
                  </h2>
                  <p className="text-zinc-500 text-xs font-medium">Secure transaction processing</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Amount (₦)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    required
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 50,000"
                    className="w-full bg-black border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-xl font-bold outline-none focus:border-brand-yellow transition-all"
                  />
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-zinc-500">
                  <span>Transaction Fee</span>
                  <span>₦0.00</span>
                </div>
                <div className="flex justify-between text-sm font-black uppercase tracking-tight">
                  <span>Total {type === 'topup' ? 'Credit' : 'Debit'}</span>
                  <span className={type === 'topup' ? 'text-green-500' : 'text-brand-yellow'}>
                    ₦{amount ? parseFloat(amount).toLocaleString() : '0'}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !amount}
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-tight hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
                  type === 'topup' ? 'bg-green-500 text-black' : 'bg-brand-yellow text-brand-black'
                }`}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  type === 'topup' ? 'Confirm Top Up' : 'Confirm Withdrawal'
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
