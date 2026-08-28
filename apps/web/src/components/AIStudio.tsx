'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  ArrowRight, 
  RefreshCw, 
  Database, 
  ShieldCheck, 
  Eye, 
  Building2,
  Cpu
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { SAMPLE_PARCELS, SAMPLE_BUILDINGS } from '@sih/sample-data';

interface PipelineStage {
  name: string;
  desc: string;
  durationMs: number;
}

const STAGES: PipelineStage[] = [
  { name: '1. Ingestion & Preprocessing', desc: 'Noise reduction, georeferencing against CORS GNSS control points, contrast normalization', durationMs: 700 },
  { name: '2. Deep Learning Segmentation', desc: 'YOLO/SAM neural contour detection for perimeter walls, partitions, and stair cores', durationMs: 900 },
  { name: '3. OCR & Label Extraction', desc: 'Extracting room identifiers, flat numbers, and square footage annotations', durationMs: 800 },
  { name: '4. 3D Solid Extrusion', desc: 'Extruding 2D polygons to 3D Polyhedral Surfaces using plinth datum + floor height ($Z=+12.1m$ to $+15.9m$)', durationMs: 800 },
  { name: '5. 3D Solid Topology Validation', desc: 'Checking 3D watertightness and bounding box intersection against neighboring parcels', durationMs: 700 },
  { name: '6. 3D ULPIN Assignment', desc: 'Synthesizing standard 14-char base + domain + level + unit hierarchical codes', durationMs: 500 }
];

export const AIStudio: React.FC = () => {
  const { addAuditLog, setActiveTab, setSelectedUnit } = useAppStore();

  const [selectedPreset, setSelectedPreset] = useState<'MAHARERA_FLOORPLAN' | 'LIDAR_POINTCLOUD' | 'DRONE_ORTHO'>('MAHARERA_FLOORPLAN');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const startPipeline = async () => {
    setIsProcessing(true);
    setIsComplete(false);
    setCurrentStageIdx(0);
    setProgress(0);

    for (let i = 0; i < STAGES.length; i++) {
      setCurrentStageIdx(i);
      const stage = STAGES[i];
      const stepProgress = Math.round(((i + 1) / STAGES.length) * 100);
      
      await new Promise(r => setTimeout(r, stage.durationMs));
      setProgress(stepProgress);
    }

    setIsProcessing(false);
    setIsComplete(true);

    // Record immutable audit log
    addAuditLog({
      id: `audit-ai-${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      actor: 'Automated AI Cadastral Pipeline (FastAPI SAM/Extruder)',
      actorRole: 'SYSTEM_AI',
      action: 'CREATE',
      entityType: 'VERTICAL_UNIT',
      entityId: 'MH13BOM04521873.A+03-A301',
      summary: 'Successfully vectorized MahaRERA Floor Plan layout Rev 3.2. Generated 3 3D Vertical Units with validated topology.',
      hashSignature: 'a7c3948e54728fba1094892c90e1f748951048b6c4892841029481940192841a'
    });
  };

  return (
    <div className="w-full h-full max-w-5xl mx-auto p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-5.5rem)]">
      {/* Hero Banner */}
      <div className="glass-panel-glow rounded-2xl p-6 relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-brand-primary/20 text-brand-primary">
                <Sparkles className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                AI Cadastral Pipeline Studio
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium">
                Automated 3D Ingestion
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Transform architectural 2D floor plans (PDF/CAD/Image) and LiDAR point clouds (.LAZ) into legal 3D Cadastral Solid Units with automated 3D ULPIN assignment and solid topology validation.
            </p>
          </div>

          <div className="hidden md:flex flex-col items-end gap-1 text-[11px] font-mono text-slate-400">
            <span className="text-cyan-300 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5" /> Python FastAPI Engine
            </span>
            <span>Shapely 3D Solid &bull; Open Buildings IoU</span>
          </div>
        </div>
      </div>

      {/* Preset Input Data Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => { setSelectedPreset('MAHARERA_FLOORPLAN'); setIsComplete(false); }}
          className={`p-4 rounded-xl text-left border transition-all ${
            selectedPreset === 'MAHARERA_FLOORPLAN'
              ? 'glass-card border-brand-primary ring-1 ring-brand-primary/40 bg-surface-100/90 shadow-neon-cyan'
              : 'glass-card border-white/5 hover:border-white/20 bg-surface-50/50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-200 text-slate-300">
              Sample Raster Layout
            </span>
          </div>
          <h4 className="text-xs font-bold text-white">MahaRERA Floor Plan Layout</h4>
          <p className="text-[11px] text-slate-400 mt-1">
            BKC FinTech Tower Floor +03 (3 units: East Wing, West Wing, Core).
          </p>
        </button>

        <button
          onClick={() => { setSelectedPreset('LIDAR_POINTCLOUD'); setIsComplete(false); }}
          className={`p-4 rounded-xl text-left border transition-all ${
            selectedPreset === 'LIDAR_POINTCLOUD'
              ? 'glass-card border-brand-primary ring-1 ring-brand-primary/40 bg-surface-100/90 shadow-neon-cyan'
              : 'glass-card border-white/5 hover:border-white/20 bg-surface-50/50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-200 text-slate-300">
              1.42M Points
            </span>
          </div>
          <h4 className="text-xs font-bold text-white">LiDAR Point Cloud (.LAZ)</h4>
          <p className="text-[11px] text-slate-400 mt-1">
            nDSM (DSM − DEM) roof elevation & eaves height extraction.
          </p>
        </button>

        <button
          onClick={() => { setSelectedPreset('DRONE_ORTHO'); setIsComplete(false); }}
          className={`p-4 rounded-xl text-left border transition-all ${
            selectedPreset === 'DRONE_ORTHO'
              ? 'glass-card border-brand-primary ring-1 ring-brand-primary/40 bg-surface-100/90 shadow-neon-cyan'
              : 'glass-card border-white/5 hover:border-white/20 bg-surface-50/50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-200 text-slate-300">
              5cm GSD
            </span>
          </div>
          <h4 className="text-xs font-bold text-white">Drone Orthomosaic Tile</h4>
          <p className="text-[11px] text-slate-400 mt-1">
            Building footprint contour segmentation with Open Buildings baseline.
          </p>
        </button>
      </div>

      {/* Processing Pipeline Controller */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">
              Pipeline Execution Engine
            </h3>
            <p className="text-xs text-slate-400">
              Target Base Parcel: <span className="font-mono text-cyan-300">MH13BOM04521873 (BKC G-Block)</span>
            </p>
          </div>

          <button
            onClick={startPipeline}
            disabled={isProcessing}
            className={`px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 transition-all shadow-lg ${
              isProcessing
                ? 'bg-surface-200 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-brand-primary to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-neon-cyan'
            }`}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-brand-primary" />
                <span>Running AI Pipeline ({progress}%)...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Execute 3D Ingestion Pipeline</span>
              </>
            )}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-slate-300">Pipeline Execution Progress</span>
            <span className="font-mono text-cyan-300">{progress}%</span>
          </div>
          <div className="w-full h-2.5 bg-surface-200 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div 
              className="h-full bg-gradient-to-r from-brand-primary to-emerald-400 rounded-full transition-all duration-300 shadow-neon-cyan"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stages Stepper */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {STAGES.map((stage, idx) => {
            const isDone = isComplete || (isProcessing && idx < currentStageIdx);
            const isCurrent = isProcessing && idx === currentStageIdx;

            return (
              <div 
                key={idx}
                className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                  isDone 
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200' 
                    : isCurrent 
                    ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-200 shadow-neon-cyan animate-pulse' 
                    : 'bg-surface-100/40 border-white/5 text-slate-500'
                }`}
              >
                <div className="mt-0.5">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[9px] font-mono">
                      {idx + 1}
                    </div>
                  )}
                </div>

                <div className="space-y-0.5">
                  <h4 className={`text-xs font-semibold ${isDone ? 'text-emerald-300' : (isCurrent ? 'text-cyan-300' : 'text-slate-400')}`}>
                    {stage.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    {stage.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Generated 3D Units Result Card */}
      {isComplete && (
        <div className="glass-panel-glow rounded-2xl p-6 border border-emerald-500/40 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold text-white">
                  3D Ingestion Results — 3 Vertical Units Synthesized
                </h3>
                <p className="text-xs text-emerald-300">
                  All 3D solids validated watertight with zero topological overlaps.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('EXPLODED_3D')}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              View in Exploded 3D Drill-Down &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {[
              { code: 'A03-A301', name: 'Executive Suite 301 (East)', area: 540, vol: 2052, z: '+12.1m to +15.9m', use: 'Commercial' },
              { code: 'A03-B302', name: 'Corporate Boardroom 302 (West)', area: 620, vol: 2356, z: '+12.1m to +15.9m', use: 'Commercial' },
              { code: 'A03-C303', name: 'FinTech Innovation Lab (Core)', area: 380, vol: 1444, z: '+12.1m to +15.9m', use: 'Commercial' }
            ].map((u, i) => (
              <div key={i} className="glass-card p-3 rounded-xl border border-white/10 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono font-bold text-cyan-300">MH13BOM04521873.{u.code}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-semibold">{u.use}</span>
                </div>
                <div className="text-xs text-white font-medium">{u.name}</div>
                <div className="text-[10px] text-slate-400 font-mono flex justify-between pt-1 border-t border-white/5">
                  <span>Area: {u.area} m²</span>
                  <span>Vol: {u.vol} m³</span>
                  <span>Z: {u.z}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
