'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '../lib/store';
import { Layers, Zap, Truck, AlertTriangle, Eye, EyeOff, Loader2 } from 'lucide-react';

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
      <div className="glass-panel p-4 rounded-2xl flex items-center justify-center space-x-2">
        <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
        <span className="text-xs text-slate-400">Loading Underground Catalogue...</span>
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
    <div className="glass-panel p-4 rounded-2xl space-y-4 max-h-[60vh] overflow-y-auto pointer-events-auto">
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <Layers className="w-5 h-5 text-indigo-400" />
        <h3 className="text-sm font-bold text-white tracking-wide uppercase">Underground Infrastructure</h3>
      </div>

      <div className="space-y-4">
        {/* Utilities */}
        <div className="space-y-2">
          <button 
            onClick={() => toggleCategory('undergroundUtilities', 'undergroundUtilities')}
            className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all ${
              layers.undergroundUtilities 
                ? 'bg-cyan-900/40 border-cyan-500/50 text-cyan-100' 
                : 'bg-black/20 border-white/5 text-slate-400 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-semibold">Underground Utilities</span>
            </div>
            {layers.undergroundUtilities ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          
          {layers.undergroundUtilities && catalogue.undergroundUtilities?.layers.map(l => (
            <div key={l.id} className="ml-6 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="rounded bg-black/50 border-white/20 text-cyan-500 focus:ring-cyan-500/50"
                  checked={activeUndergroundLayerIds.includes(l.id)}
                  onChange={() => toggleUndergroundLayerId(l.id)}
                />
                <span className="text-[11px] text-slate-300 group-hover:text-white transition-colors">{l.name}</span>
              </label>
              <span className="text-[9px] text-slate-500 font-mono">ID:{l.id}</span>
            </div>
          ))}
        </div>

        {/* Roadwork */}
        <div className="space-y-2">
          <button 
            onClick={() => toggleCategory('undergroundRoadwork', 'undergroundRoadwork')}
            className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all ${
              layers.undergroundRoadwork 
                ? 'bg-amber-900/40 border-amber-500/50 text-amber-100' 
                : 'bg-black/20 border-white/5 text-slate-400 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              <span className="text-xs font-semibold">Underground Roadwork</span>
            </div>
            {layers.undergroundRoadwork ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          
          {layers.undergroundRoadwork && catalogue.undergroundRoadwork?.layers.map(l => (
            <div key={l.id} className="ml-6 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="rounded bg-black/50 border-white/20 text-amber-500 focus:ring-amber-500/50"
                  checked={activeUndergroundLayerIds.includes(l.id)}
                  onChange={() => toggleUndergroundLayerId(l.id)}
                />
                <span className="text-[11px] text-slate-300 group-hover:text-white transition-colors">{l.name}</span>
              </label>
              <span className="text-[9px] text-slate-500 font-mono">ID:{l.id}</span>
            </div>
          ))}
        </div>
        
        {/* Other Categories (Empty visually represented) */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-black/20 border border-white/5 text-slate-500 opacity-50 cursor-not-allowed">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-xs font-semibold">Underground Building Spaces (No Data)</span>
        </div>
      </div>
    </div>
  );
};
