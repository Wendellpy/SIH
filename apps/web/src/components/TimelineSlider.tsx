'use client';

import React from 'react';
import { Clock, Droplets, Satellite, CalendarDays } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export const TimelineSlider: React.FC = () => {
  const { temporalYear, setTemporalYear, floodSimulation, setFloodSimulation } = useAppStore();

  const years = [2018, 2020, 2022, 2024, 2026];

  return (
    <div className="glass-panel-glow rounded-2xl p-4 w-full max-w-3xl mx-auto border border-white/10 shadow-2xl flex flex-col gap-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide">4D Temporal Property Viewer</h3>
            <p className="text-[10px] text-slate-400">Time-series ULPIN state & Change Detection</p>
          </div>
        </div>

        {/* Flood Toggle */}
        <button
          onClick={() => setFloodSimulation(!floodSimulation.active)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
            floodSimulation.active
              ? 'bg-blue-900/40 text-blue-300 border-blue-500/50 shadow-neon-blue'
              : 'bg-surface-100/50 text-slate-400 border-white/5 hover:bg-surface-200'
          }`}
        >
          <Droplets className="w-3.5 h-3.5" />
          {floodSimulation.active ? 'Disable Flood Risk' : 'Simulate Flood Risk'}
        </button>
      </div>

      {/* Main Timeline Slider */}
      <div className="px-2 space-y-1 relative">
        <input
          type="range"
          min="2018"
          max="2026"
          step="1"
          value={temporalYear}
          onChange={(e) => setTemporalYear(parseInt(e.target.value, 10))}
          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-primary"
        />
        <div className="flex justify-between px-1 text-[10px] font-mono text-slate-400 font-medium">
          {years.map(y => (
            <span key={y} className={temporalYear === y ? 'text-brand-primary font-bold' : ''}>
              {y}
            </span>
          ))}
        </div>
      </div>

      {/* Dynamic Data Source Status */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-300 font-mono">
          <Satellite className="w-3.5 h-3.5 text-cyan-400" />
          <span>Active Layer: <strong className="text-white">Sentinel-2 & Bhuvan LISS-IV ({temporalYear})</strong></span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-300 font-mono">
          <CalendarDays className="w-3.5 h-3.5 text-emerald-400" />
          <span>Cadastral State: <strong className="text-white">As of Q4 {temporalYear}</strong></span>
        </div>
      </div>

      {/* Flood Level Sub-Slider (if active) */}
      {floodSimulation.active && (
        <div className="p-3 bg-blue-950/20 rounded-xl border border-blue-500/20 animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="font-semibold text-blue-300">Water Elevation (Flood Scenario)</span>
            <span className="font-mono font-bold text-blue-400">{floodSimulation.waterLevelM.toFixed(1)}m MSL</span>
          </div>
          <input
            type="range"
            min="0"
            max="15"
            step="0.5"
            value={floodSimulation.waterLevelM}
            onChange={(e) => setFloodSimulation(true, parseFloat(e.target.value))}
            className="w-full h-1.5 bg-blue-900 rounded-lg appearance-none cursor-pointer accent-blue-400"
          />
        </div>
      )}
    </div>
  );
};
