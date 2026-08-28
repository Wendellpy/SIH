'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '../lib/store';
import { Layers, Zap, Truck, AlertTriangle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { BorderBeam } from './ui/BorderBeam';

interface UndergroundLayer {
  id: number;
  name: string;
  url: string;
  reason: string;
}

interface Category {
  title: string;
  layers: UndergroundLayer[];
}

export const UndergroundControl: React.FC = () => {
  const { 
    layers, 
    toggleLayer, 
    activeUndergroundLayerIds, 
    toggleUndergroundLayerId 
  } = useAppStore();

  const [catalogue, setCatalogue] = useState<Record<string, Category> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/underground-layers.json')
      .then(res => res.json())
      .then(data => {
        setCatalogue(data.categories);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load underground layer catalogue:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="glass-panel p-5 rounded-2xl flex items-center justify-center space-x-3">
        <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
        <span className="text-[11px] font-semibold text-slate-300 tracking-wide">Loading Underground Catalogue...</span>
      </div>
    );
  }

  if (!catalogue) return null;

  const toggleCategory = (categoryKey: string, storeLayerKey: 'undergroundUtilities' | 'undergroundRoadwork') => {
    const isEnabled = layers[storeLayerKey];
    toggleLayer(storeLayerKey);
    
    // Auto-toggle all sub-layers when category is toggled
    const catLayers = catalogue[categoryKey]?.layers || [];
    catLayers.forEach(l => {
      const isLayerActive = activeUndergroundLayerIds.includes(l.id);
      // If we are turning ON, and it's not active -> toggle
      // If we are turning OFF, and it is active -> toggle
      if ((!isEnabled && !isLayerActive) || (isEnabled && isLayerActive)) {
        toggleUndergroundLayerId(l.id);
      }
    });
  };

  return (
    <div className="relative glass-panel rounded-2xl p-4 shadow-2xl w-72 border border-amber-500/20 backdrop-blur-2xl overflow-hidden">
      <BorderBeam size={150} duration={12} delay={0} colorFrom="#f59e0b" colorTo="#ef4444" />
      <div className="relative z-10 flex items-center gap-2.5 border-b border-white/10 pb-3">
        <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
          <Layers className="w-4 h-4" />
        </div>
        <h3 className="text-[11px] font-bold text-white tracking-widest uppercase">Underground Infrastructure</h3>
      </div>

      <div className="relative z-10 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1 mt-3">
        {/* Utilities */}
        <div className="space-y-2">
          <button 
            onClick={() => toggleCategory('undergroundUtilities', 'undergroundUtilities')}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all duration-300 group ${
              layers.undergroundUtilities 
                ? 'bg-cyan-900/30 border-cyan-500/40 text-cyan-100 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Zap className={`w-4 h-4 ${layers.undergroundUtilities ? 'text-cyan-400' : 'text-slate-500 group-hover:text-cyan-400/50 transition-colors'}`} />
              <span className="text-[11px] font-bold tracking-wide">Underground Utilities</span>
            </div>
            {layers.undergroundUtilities ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          
          {layers.undergroundUtilities && catalogue.undergroundUtilities?.layers.map(l => (
            <div key={l.id} className="ml-6 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="rounded bg-black/50 border-white/20 text-cyan-500 focus:ring-cyan-500/50 transition-all cursor-pointer"
                  checked={activeUndergroundLayerIds.includes(l.id)}
                  onChange={() => toggleUndergroundLayerId(l.id)}
                />
                <span className="text-[11px] font-medium text-slate-300 group-hover:text-cyan-300 transition-colors">{l.name}</span>
              </label>
              <span className="text-[9px] text-slate-500 font-mono">ID:{l.id}</span>
            </div>
          ))}
        </div>

        {/* Roadwork */}
        <div className="space-y-2">
          <button 
            onClick={() => toggleCategory('undergroundRoadwork', 'undergroundRoadwork')}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all duration-300 group ${
              layers.undergroundRoadwork 
                ? 'bg-amber-900/30 border-amber-500/40 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
                : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Truck className={`w-4 h-4 ${layers.undergroundRoadwork ? 'text-amber-400' : 'text-slate-500 group-hover:text-amber-400/50 transition-colors'}`} />
              <span className="text-[11px] font-bold tracking-wide">Underground Roadwork</span>
            </div>
            {layers.undergroundRoadwork ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          
          {layers.undergroundRoadwork && catalogue.undergroundRoadwork?.layers.map(l => (
            <div key={l.id} className="ml-6 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="rounded bg-black/50 border-white/20 text-amber-500 focus:ring-amber-500/50 transition-all cursor-pointer"
                  checked={activeUndergroundLayerIds.includes(l.id)}
                  onChange={() => toggleUndergroundLayerId(l.id)}
                />
                <span className="text-[11px] font-medium text-slate-300 group-hover:text-amber-300 transition-colors">{l.name}</span>
              </label>
              <span className="text-[9px] text-slate-500 font-mono">ID:{l.id}</span>
            </div>
          ))}
        </div>
        
        {/* Other Categories (Empty visually represented) */}
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/5 text-slate-500 opacity-60 cursor-not-allowed transition-all">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-[10px] font-semibold tracking-wide uppercase">Underground Spaces (No Data)</span>
        </div>
      </div>
    </div>
  );
};
