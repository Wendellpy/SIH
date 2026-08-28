'use client';

import React from 'react';
import { 
  Building, 
  ArrowUpDown, 
  Layers, 
  ChevronsUp, 
  ChevronsDown, 
  Sliders, 
  Anchor 
} from 'lucide-react';
import { useAppStore } from '@/lib/store';

export const FloorScrubber: React.FC = () => {
  const { scrubber, setScrubberFloor, setScrubberDepth, setScrubberMode } = useAppStore();

  return (
    <div className="glass-panel rounded-xl p-3 shadow-2xl w-64 border border-white/10 flex flex-col gap-2.5">
      {/* Header & Mode Switch */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
          <ArrowUpDown className="w-3.5 h-3.5 text-brand-primary" />
          <span>Vertical Scrubber</span>
        </div>
        
        {/* Toggle Mode */}
        <div className="flex bg-surface-100 rounded-md p-0.5 border border-white/10">
          <button
            onClick={() => setScrubberMode('FLOORS')}
            className={`px-2 py-0.5 text-[10px] font-medium rounded transition-all ${
              scrubber.mode === 'FLOORS'
                ? 'bg-brand-primary text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Floors (Z+)
          </button>
          <button
            onClick={() => setScrubberMode('DEPTH')}
            className={`px-2 py-0.5 text-[10px] font-medium rounded transition-all ${
              scrubber.mode === 'DEPTH'
                ? 'bg-amber-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Depth (Z-)
          </button>
        </div>
      </div>

      {scrubber.mode === 'FLOORS' ? (
        /* Above Ground Floor Scrubber */
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 flex items-center gap-1">
              <Building className="w-3 h-3 text-cyan-400" />
              Ceiling Cut-off:
            </span>
            <span className="font-mono font-bold text-brand-primary px-1.5 py-0.5 rounded bg-brand-primary/10 border border-brand-primary/20">
              Floor {scrubber.currentFloor === 0 ? 'G (Plinth)' : `+${scrubber.currentFloor}`}
            </span>
          </div>

          {/* Slider */}
          <div className="relative py-1">
            <input
              type="range"
              min={0}
              max={scrubber.maxFloor}
              step={1}
              value={scrubber.currentFloor}
              onChange={(e) => setScrubberFloor(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-surface-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
            />
          </div>

          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>G (0.0m)</span>
            <span>+8 (+30.4m)</span>
            <span>+16 (+64.0m)</span>
          </div>

          <p className="text-[10px] text-slate-400 leading-tight">
            Slide down to peel top floors and expose internal 3D unit volumes.
          </p>
        </div>
      ) : (
        /* Subterranean Depth Scrubber */
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 flex items-center gap-1">
              <Anchor className="w-3 h-3 text-amber-400" />
              Subterranean Slice:
            </span>
            <span className="font-mono font-bold text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
              -{scrubber.currentDepthM}m Depth
            </span>
          </div>

          {/* Slider */}
          <div className="relative py-1">
            <input
              type="range"
              min={0}
              max={scrubber.maxDepthM}
              step={1}
              value={scrubber.currentDepthM}
              onChange={(e) => setScrubberDepth(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-surface-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>0m (Surface)</span>
            <span>-15m (Utilities)</span>
            <span>-30m (Metro)</span>
          </div>

          <p className="text-[10px] text-slate-400 leading-tight">
            Slice subterranean depth bands to isolate water, sewer, gas, and metro tunnels.
          </p>
        </div>
      )}
    </div>
  );
};
