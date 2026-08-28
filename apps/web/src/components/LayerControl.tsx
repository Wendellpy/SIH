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
import { BorderBeam } from './ui/BorderBeam';

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
    <div className="relative glass-panel rounded-2xl p-4 shadow-2xl w-64 border border-white/10 backdrop-blur-2xl overflow-hidden">
      <BorderBeam size={150} duration={12} delay={0} colorFrom="#10b981" colorTo="#0ea5e9" />
      <div className="relative z-10 flex items-center justify-between pb-3 mb-3 border-b border-white/10">
        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
          <Layers className="w-4 h-4 text-brand-primary" />
          <span>Cadastral Layers</span>
        </div>
        <span className="text-[9px] text-slate-500 font-mono">3D GIS</span>
      </div>

      <div className="relative z-10 space-y-1.5">
        {layerItems.map(({ key, label, icon: Icon, color, activeBg }) => {
          const active = layers[key];
          return (
            <button
              key={key}
              onClick={() => toggleLayer(key)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-300 group ${
                active 
                  ? `${activeBg} text-white font-medium border border-white/10 shadow-sm` 
                  : 'bg-white/5 text-slate-400 hover:text-slate-300 hover:bg-white/10 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-3.5 h-3.5 ${color} ${!active && 'opacity-60 group-hover:opacity-100'} transition-opacity`} />
                <span className="truncate tracking-wide">{label}</span>
              </div>
              {active ? (
                <Eye className="w-4 h-4 text-brand-primary drop-shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
              ) : (
                <EyeOff className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
