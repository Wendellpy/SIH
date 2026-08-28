'use client';

import React from 'react';
import { 
  Layers, 
  Building, 
  MapPin, 
  Split, 
  Cable, 
  Globe, 
  Mountain, 
  Check, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import { useAppStore } from '@/lib/store';

export const LayerControl: React.FC = () => {
  const { layers, toggleLayer } = useAppStore();

  const layerItems = [
    { key: 'parcels' as const, label: 'Surface Parcels (2D)', icon: MapPin, color: 'text-emerald-400', activeBg: 'bg-emerald-500/20' },
    { key: 'buildings' as const, label: '3D Buildings (LOD2)', icon: Building, color: 'text-indigo-400', activeBg: 'bg-indigo-500/20' },
    { key: 'verticalUnits' as const, label: '3D Vertical Units', icon: Split, color: 'text-cyan-400', activeBg: 'bg-cyan-500/20' },
    { key: 'underground' as const, label: 'Subterranean Utilities', icon: Cable, color: 'text-amber-400', activeBg: 'bg-amber-500/20' },
    { key: 'satellite' as const, label: 'Satellite Basemap', icon: Globe, color: 'text-sky-400', activeBg: 'bg-sky-500/20' },
    { key: 'terrain' as const, label: 'Elevation / Terrain DEM', icon: Mountain, color: 'text-purple-400', activeBg: 'bg-purple-500/20' },
  ];

  return (
    <div className="glass-panel rounded-xl p-3 shadow-2xl w-60 border border-white/10">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
          <Layers className="w-3.5 h-3.5 text-brand-primary" />
          <span>Cadastral Layers</span>
        </div>
        <span className="text-[10px] text-slate-400 uppercase font-mono">3D GIS</span>
      </div>

      <div className="space-y-1.5">
        {layerItems.map(({ key, label, icon: Icon, color, activeBg }) => {
          const active = layers[key];
          return (
            <button
              key={key}
              onClick={() => toggleLayer(key)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                active 
                  ? `${activeBg} text-white font-medium border border-white/10` 
                  : 'bg-surface-100/50 text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-3.5 h-3.5 ${color}`} />
                <span className="truncate">{label}</span>
              </div>
              {active ? (
                <Eye className="w-3.5 h-3.5 text-brand-primary" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
