'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Layers, 
  ShieldCheck, 
  AlertTriangle, 
  Copy, 
  Check, 
  Maximize2, 
  FileCheck, 
  Info, 
  Sparkles, 
  Split, 
  User, 
  Hash, 
  ChevronRight,
  Gauge
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { parseUlpin3D } from '@sih/shared-types';

export const InspectorPanel: React.FC = () => {
  const { 
    selectedParcel, 
    selectedBuilding, 
    selectedUnit, 
    selectedUnderground,
    setSelectedUnit,
    setActiveTab,
    resolveConflict,
    topologyLogs
  } = useAppStore();

  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPropertyCard = async (ulpin: string) => {
    try {
      setIsDownloading(true);
      
      // Grab the MapLibre canvas (or R3F canvas)
      const canvas = document.querySelector('canvas');
      let thumbnailBase64 = '';
      if (canvas) {
        thumbnailBase64 = canvas.toDataURL('image/jpeg', 0.8);
      }

      const response = await fetch(`http://localhost:4000/api/v1/units/${ulpin}/property-card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thumbnailBase64 })
      });

      if (!response.ok) {
        throw new Error('Failed to generate card');
      }

      // Download the PDF blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Property_Card_${ulpin}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (err) {
      console.error(err);
      alert('Error generating Property Card');
    } finally {
      setIsDownloading(false);
    }
  };

  // If nothing is selected, show default parcel overview
  const parcel = selectedParcel;
  const building = selectedBuilding;
  const unit = selectedUnit;
  const underground = selectedUnderground;

  const currentUlpin = unit ? unit.ulpin3D : (underground ? underground.ulpin3D : (parcel ? parcel.ulpin : ''));
  const parsedUlpin = currentUlpin ? parseUlpin3D(currentUlpin) : null;

  // Check if current entity has a topology conflict
  const conflictLog = topologyLogs.find(
    l => l.ulpin3DPrimary === currentUlpin || l.ulpin3DColliding === currentUlpin
  );

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel rounded-2xl p-4 shadow-2xl w-96 border border-white/10 flex flex-col h-full max-h-[calc(100vh-5.5rem)] overflow-y-auto space-y-4">
      {/* Title & Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-brand-primary/20 text-brand-primary border border-brand-primary/30">
            {unit ? <Split className="w-4 h-4" /> : (underground ? <Layers className="w-4 h-4 text-amber-400" /> : <Building2 className="w-4 h-4" />)}
          </div>
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              {unit ? '3D Vertical Property Unit' : (underground ? 'Subterranean Infrastructure' : 'Cadastral Parcel & Building')}
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">
              DoLR Spatial Entity Inspector
            </span>
          </div>
        </div>

        {/* Provenance Badge */}
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-100 text-slate-300 border border-white/10 font-medium">
          {unit?.provenance || 'BMC GIS'}
        </span>
      </div>

      {/* 3D ULPIN Identity Banner */}
      {currentUlpin && (
        <div className="glass-card rounded-xl p-3 border border-brand-primary/30 bg-surface-50/80">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wide flex items-center gap-1 text-slate-300">
              <Hash className="w-3.5 h-3.5 text-brand-primary" />
              Unique 3D ULPIN
            </span>
            <button
              onClick={() => handleCopy(currentUlpin)}
              className="flex items-center gap-1 text-brand-primary hover:text-white transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="text-xs font-mono font-bold text-slate-100 tracking-wide break-all select-all bg-black/40 px-2.5 py-1.5 rounded border border-white/5">
            {currentUlpin}
          </div>

          {/* 3D ULPIN Decomposition Breakdown */}
          {parsedUlpin && (
            <div className="mt-2 grid grid-cols-4 gap-1 text-center font-mono text-[9px] pt-2 border-t border-white/5">
              <div className="bg-surface-200/50 p-1 rounded">
                <div className="text-slate-400 text-[8px]">BASE ULPIN</div>
                <div className="text-emerald-300 font-bold truncate">{parsedUlpin.baseUlpin.slice(-6)}</div>
              </div>
              <div className="bg-surface-200/50 p-1 rounded">
                <div className="text-slate-400 text-[8px]">DOMAIN</div>
                <div className="text-cyan-300 font-bold">{parsedUlpin.domainCode} ({parsedUlpin.domainCode === 'A' ? 'Above' : parsedUlpin.domainCode === 'U' ? 'Under' : 'Ground'})</div>
              </div>
              <div className="bg-surface-200/50 p-1 rounded">
                <div className="text-slate-400 text-[8px]">LEVEL</div>
                <div className="text-amber-300 font-bold">{parsedUlpin.levelCode}</div>
              </div>
              <div className="bg-surface-200/50 p-1 rounded">
                <div className="text-slate-400 text-[8px]">UNIT</div>
                <div className="text-indigo-300 font-bold truncate">{parsedUlpin.unitCode}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Validation & Conflict Status Alert */}
      {unit?.validationStatus === 'CONFLICT' || conflictLog ? (
        <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/50 text-red-200 space-y-1.5 shadow-neon-red">
          <div className="flex items-center gap-2 text-xs font-bold text-red-400">
            <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
            <span>CRITICAL 3D TOPOLOGY CONFLICT</span>
          </div>
          <p className="text-[11px] text-red-300/90 leading-tight">
            {conflictLog?.message || 'Vertical 3D solid overlap detected with adjacent unit bounding box.'}
          </p>
          {conflictLog?.details?.overlapVolumeCum && (
            <div className="text-[10px] font-mono text-red-200/80 bg-red-900/30 px-2 py-1 rounded">
              Encroaching Volume: {conflictLog.details.overlapVolumeCum} m³ &bull; Range: [{conflictLog.details.elevationZRange?.join('m to ')}m]
            </div>
          )}
          {conflictLog?.status === 'OPEN' && (
            <button
              onClick={() => resolveConflict(conflictLog.id)}
              className="mt-2 w-full py-1.5 px-3 bg-red-600 hover:bg-red-500 text-white rounded text-[11px] font-semibold transition-all shadow"
            >
              Resolve in DoLR Verifier Portal →
            </button>
          )}
        </div>
      ) : (
        <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>3D Topology Validated</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
            WATERTIGHT SOLID
          </span>
        </div>
      )}

      {/* 3D Geometry Metrics Grid */}
      <div className="space-y-2">
        <h3 className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Gauge className="w-3.5 h-3.5 text-brand-primary" />
          3D Spatial Measurements
        </h3>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="glass-card p-2.5 rounded-lg border border-white/5">
            <div className="text-[10px] text-slate-400">Carpet / Usable Area</div>
            <div className="text-sm font-mono font-bold text-white mt-0.5">
              {unit?.carpetAreaSqm ? `${unit.carpetAreaSqm} m²` : (parcel?.areaSqm ? `${parcel.areaSqm} m²` : 'N/A')}
            </div>
            <div className="text-[9px] text-slate-400 font-mono mt-0.5">
              {unit?.carpetAreaSqm ? `~${(unit.carpetAreaSqm * 10.764).toFixed(0)} sq.ft` : ''}
            </div>
          </div>

          <div className="glass-card p-2.5 rounded-lg border border-white/5">
            <div className="text-[10px] text-slate-400">3D Solid Volume</div>
            <div className="text-sm font-mono font-bold text-brand-primary mt-0.5">
              {unit?.volumeCum ? `${unit.volumeCum} m³` : (underground ? `${underground.diameterMm}mm Pipe` : 'N/A')}
            </div>
            <div className="text-[9px] text-slate-400 font-mono mt-0.5">
              Height Z-delta: {unit ? `${(unit.zMax - unit.zMin).toFixed(2)}m` : 'N/A'}
            </div>
          </div>

          <div className="glass-card p-2.5 rounded-lg border border-white/5 col-span-2">
            <div className="text-[10px] text-slate-400 flex items-center justify-between">
              <span>Vertical Elevation Range (Z)</span>
              <span className="font-mono text-cyan-300 text-[9px]">Datum: WGS84 MSL</span>
            </div>
            <div className="text-xs font-mono font-bold text-slate-100 mt-1 flex items-center justify-between">
              <span>Z-min: {unit ? `+${unit.zMin}m` : (underground ? `${underground.depthMinM}m` : '+4.5m')}</span>
              <span className="text-slate-500">→</span>
              <span>Z-max: {unit ? `+${unit.zMax}m` : (underground ? `${underground.depthMaxM}m` : '+68.5m')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ownership & Cadastral KYC */}
      <div className="glass-card p-3 rounded-xl border border-white/5 space-y-2">
        <h3 className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-indigo-400" />
          Cadastral Ownership & Legal Tenure
        </h3>

        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Registered Owner:</span>
            <span className="font-medium text-white text-right truncate max-w-[180px]">
              {unit?.ownerName || (underground?.owningAgency || parcel?.ownershipType || 'Government of Maharashtra')}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Owner Identifier:</span>
            <span className="font-mono text-cyan-300 text-xs">
              {unit?.ownerId || 'GOV-MH-CADASTRE'}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Use Classification:</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300">
              {unit?.useType || (underground ? 'Municipal Infrastructure' : 'Mixed Commercial')}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Property Tax Status:</span>
            <span className="text-emerald-400 font-semibold text-[11px]">
              {unit?.taxStatus || 'PAID (FY 2026-27)'}
            </span>
          </div>
        </div>
      </div>

      {/* Parent Building & Survey Coordinates */}
      {building && (
        <div className="glass-card p-3 rounded-xl border border-white/5 space-y-1 text-xs">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Building & Location</div>
          <div className="font-medium text-slate-100">{building.name}</div>
          <p className="text-[11px] text-slate-400 leading-snug">{building.address}</p>
          <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Floors: {building.numFloors}</span>
            <span>Survey: {parcel?.surveyNumber}</span>
          </div>
        </div>
      )}

      {/* Interactive Actions */}
      <div className="pt-2 flex flex-col gap-2">
        <button
          onClick={() => setActiveTab('EXPLODED_3D')}
          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-brand-primary to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-neon-cyan transition-all"
        >
          <Layers className="w-3.5 h-3.5" />
          Drill Down in Exploded 3D View
        </button>

        <button
          onClick={() => currentUlpin && handleDownloadPropertyCard(currentUlpin)}
          disabled={isDownloading || !currentUlpin}
          className="w-full py-1.5 px-3 rounded-xl bg-surface-100 hover:bg-surface-200 text-slate-200 text-xs font-medium border border-white/10 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
        >
          <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
          {isDownloading ? 'Generating...' : 'Download 3D Cadastral Property Card'}
        </button>
      </div>
    </div>
  );
};
