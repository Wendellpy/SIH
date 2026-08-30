'use client';

import React from 'react';
import { Clock, Droplets, Satellite, CalendarDays } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export const TimelineSlider: React.FC = () => {
  const { temporalYear, setTemporalYear, floodSimulation, setFloodSimulation } = useAppStore();

  const years = [2018, 2020, 2022, 2024, 2026];

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
        <div className="absolute bottom-full left-4 mb-2 p-2 bg-blue-950/80 rounded-xl border border-blue-500/30 animate-in fade-in slide-in-from-bottom-2 flex items-center gap-3 shadow-xl backdrop-blur-md">
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
      )}
    </div>
  );
};
