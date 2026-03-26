import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, MapPin, Calendar, DollarSign, Zap, Loader2 } from 'lucide-react';

interface NewCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (campaign: any) => void;
}

export default function NewCampaignModal({ isOpen, onClose, onSuccess }: NewCampaignModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    budget: '',
    startDate: '',
    endDate: '',
    targetAreas: [] as string[],
    creativeUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const newCampaign = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        status: 'active',
        budget: parseFloat(formData.budget),
        cpm_rate: 1500,
        start_date: formData.startDate,
        end_date: formData.endDate,
      };
      onSuccess(newCampaign);
      setLoading(false);
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
            className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter">Launch New Campaign</h2>
                <p className="text-zinc-500 text-sm font-medium">Step {step} of 2: {step === 1 ? 'Campaign Details' : 'Creative & Targeting'}</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                <X className="w-6 h-6 text-zinc-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {step === 1 ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Campaign Name</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Summer Sales 2026"
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-yellow transition-all"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Total Budget (₦)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                          required
                          type="number"
                          value={formData.budget}
                          onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                          placeholder="50,000"
                          className="w-full bg-black border border-white/10 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-brand-yellow transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Target CPM (₦)</label>
                      <div className="relative">
                        <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                          disabled
                          type="text"
                          value="1,500"
                          className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-zinc-500 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Start Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                          required
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          className="w-full bg-black border border-white/10 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-brand-yellow transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-zinc-500">End Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                          required
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          className="w-full bg-black border border-white/10 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-brand-yellow transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Ad Creative (Image/Video)</label>
                    <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-brand-yellow/50 transition-all cursor-pointer group">
                      <Upload className="w-8 h-8 text-zinc-500 group-hover:text-brand-yellow mx-auto mb-4 transition-colors" />
                      <p className="text-sm font-bold">Click to upload or drag and drop</p>
                      <p className="text-xs text-zinc-500 mt-1">PNG, JPG or MP4 (Max 10MB)</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Target Locations</label>
                    <div className="flex flex-wrap gap-2">
                      {['Ikeja', 'Lekki', 'Victoria Island', 'Surulere', 'Yaba'].map((area) => (
                        <button
                          key={area}
                          type="button"
                          onClick={() => {
                            const areas = formData.targetAreas.includes(area)
                              ? formData.targetAreas.filter(a => a !== area)
                              : [...formData.targetAreas, area];
                            setFormData({ ...formData, targetAreas: areas });
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            formData.targetAreas.includes(area)
                              ? 'bg-brand-yellow text-brand-black'
                              : 'bg-white/5 text-zinc-500 hover:bg-white/10'
                          }`}
                        >
                          {area}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                {step === 2 && (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-white/5 border border-white/10 py-4 rounded-2xl font-bold hover:bg-white/10 transition-all"
                  >
                    Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => step === 1 ? setStep(2) : handleSubmit({ preventDefault: () => {} } as any)}
                  disabled={loading}
                  className="flex-[2] bg-brand-yellow text-brand-black py-4 rounded-2xl font-black uppercase tracking-tight hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    step === 1 ? 'Next Step' : 'Launch Campaign'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
