'use client';

import React from 'react';
import { Clock, Droplets, Satellite, CalendarDays } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export const TimelineSlider: React.FC = () => {
  const { temporalYear, setTemporalYear, floodSimulation, setFloodSimulation } = useAppStore();

  const years = [2018, 2020, 2022, 2024, 2026];
  const [affectedCount, setAffectedCount] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (floodSimulation.active && floodSimulation.polygon) {
      fetch('http://localhost:4000/api/v1/buildings')
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success') {
            import('@turf/turf').then(turf => {
              const floodPoly = floodSimulation.polygon.features[0];
              const affected = data.data.filter((b: any) => {
                if (!b.footprint) return false;
                try {
                  return turf.booleanIntersects(b.footprint, floodPoly);
                } catch(e) { return false; }
              });
              setAffectedCount(affected.length);
            });
          }
        })
        .catch(err => console.error("Failed to calculate flood intersections", err));
    } else {
      setAffectedCount(null);
    }
  }, [floodSimulation.active, floodSimulation.polygon]);

  return (
    <div className="glass-panel-glow rounded-full px-4 py-2 w-full max-w-2xl mx-auto border border-white/10 shadow-2xl flex items-center gap-4 bg-[#0b0f19]/90 backdrop-blur-md">
      {/* Flood Toggle - Icon Only with Tooltip */}
      <button
        title={floodSimulation.active ? 'Disable Flood Risk' : 'Simulate Flood Risk'}
        onClick={() => setFloodSimulation(!floodSimulation.active)}
        className={`flex-shrink-0 p-2 rounded-full transition-all ${
          floodSimulation.active
            ? 'bg-blue-500/20 text-blue-400 shadow-neon-blue'
            : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
        }`}
      >
        <Droplets className="w-4 h-4" />
      </button>

      {/* Main Timeline Slider */}
      <div className="flex-1 flex flex-col pt-1">
        <input
          type="range"
          min="2018"
          max="2026"
          step="1"
          value={temporalYear}
          onChange={(e) => setTemporalYear(parseInt(e.target.value, 10))}
          className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-primary"
        />
        <div className="flex justify-between px-1 mt-1 text-[9px] font-mono font-medium text-slate-500">
          {years.map(y => (
            <span key={y} className={temporalYear === y ? 'text-brand-primary font-bold' : ''}>
              {y}
            </span>
          ))}
        </div>
      </div>

      {/* Dynamic Data Source Status - Compact */}
      <div className="flex-shrink-0 flex items-center gap-3 border-l border-white/10 pl-4 py-1">
        <div className="flex flex-col text-[9px] font-mono leading-tight">
          <span className="text-slate-500 flex items-center gap-1"><Satellite className="w-2.5 h-2.5 text-cyan-500"/> Layer</span>
          <span className="text-white">Sentinel-2 ({temporalYear})</span>
        </div>
        <div className="flex flex-col text-[9px] font-mono leading-tight">
          <span className="text-slate-500 flex items-center gap-1"><CalendarDays className="w-2.5 h-2.5 text-emerald-500"/> Cadastral</span>
          <span className="text-white">Q4 {temporalYear}</span>
        </div>
      </div>

      {/* Flood Level Sub-Slider (Absolute position popover if active) */}
      {floodSimulation.active && (
        <div className="absolute bottom-full left-4 mb-2 p-3 bg-blue-950/90 rounded-xl border border-blue-500/40 animate-in fade-in slide-in-from-bottom-2 flex items-center gap-4 shadow-xl backdrop-blur-md">
          <div className="flex flex-col gap-2">
            <div className="text-[10px] font-mono font-bold text-blue-300 whitespace-nowrap">
              Flood Level: {floodSimulation.waterLevelM.toFixed(1)}m MSL
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="0.5"
              value={floodSimulation.waterLevelM}
              onChange={(e) => setFloodSimulation(true, parseFloat(e.target.value))}
              className="w-32 h-1 bg-blue-900 rounded-lg appearance-none cursor-pointer accent-blue-400"
            />
          </div>
          {affectedCount !== null && (
            <div className="border-l border-blue-500/30 pl-4 py-1 flex flex-col">
              <span className="text-[9px] font-mono text-slate-400 uppercase">Affected Buildings</span>
              <span className="text-sm font-bold text-rose-400 font-mono">
                {affectedCount} <span className="text-[10px] text-rose-400/70 font-sans">Identified</span>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
