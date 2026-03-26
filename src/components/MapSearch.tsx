import React, { useState } from 'react';
import { searchPlaces } from '../services/GeminiService';
import { MapPin, ExternalLink, Search, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const MapSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ text: string; groundingChunks: any[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      // Get user location if possible
      let location = undefined;
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        location = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
      } catch (e) {
        console.warn("Geolocation failed or denied", e);
      }

      const data = await searchPlaces(query, location);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to search places");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black uppercase tracking-tighter text-brand-yellow">
          Location Intelligence
        </h2>
        <p className="text-zinc-400 max-w-2xl mx-auto">
          Search for optimal ad placement locations, competitor sites, or high-traffic zones using Gemini's Google Maps grounding.
        </p>
      </div>

      <form onSubmit={handleSearch} className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for high-traffic areas in Lagos..."
          className="w-full bg-zinc-900/50 border-2 border-zinc-800 rounded-2xl py-6 px-8 pl-16 text-xl focus:border-brand-yellow focus:outline-none transition-all placeholder:text-zinc-600"
        />
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-brand-yellow transition-colors" size={24} />
        <button
          type="submit"
          disabled={loading}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-brand-yellow text-brand-black px-6 py-3 rounded-xl font-bold uppercase tracking-tight hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : "Search"}
        </button>
      </form>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center"
          >
            {error}
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="glass-card p-8 space-y-4">
              <div className="prose prose-invert max-w-none">
                <p className="text-lg leading-relaxed text-zinc-200">
                  {result.text}
                </p>
              </div>
            </div>

            {result.groundingChunks && result.groundingChunks.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.groundingChunks.map((chunk: any, i: number) => {
                  if (chunk.maps) {
                    return (
                      <motion.a
                        key={i}
                        href={chunk.maps.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-brand-yellow/50 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-brand-yellow/10 flex items-center justify-center text-brand-yellow">
                            <MapPin size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-zinc-100">{chunk.maps.title}</h4>
                            <p className="text-xs text-zinc-500 uppercase tracking-widest">Google Maps</p>
                          </div>
                        </div>
                        <ExternalLink size={16} className="text-zinc-500 group-hover:text-brand-yellow transition-colors" />
                      </motion.a>
                    );
                  }
                  return null;
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
